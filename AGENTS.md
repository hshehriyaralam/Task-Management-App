'use client'
import { updateTodosBulk } from "./bulkTodo";

// ✅ FIX: BatchUpdate ab sirf timer manage karta hai
// Queue management scheduleBatchUpdate mein hoti hai
// Pehle: BatchUpdate ko `items` pass hota tha — merged queue nahi
// Iska result: deduplication fail, kuch updates overwrite ho jaate the
export const BatchUpdate = ({ updateQueueRef, batchTimerRef, isSyncingRef }: any) => {
  if (batchTimerRef.current) {
    clearTimeout(batchTimerRef.current);
  }

  batchTimerRef.current = setTimeout(async () => {
    const payload = [...updateQueueRef.current];
    if (payload.length === 0) {
      if (isSyncingRef) isSyncingRef.current = false;
      return;
    }

    updateQueueRef.current = [];

    try {
      await updateTodosBulk(payload);
    } catch (err) {
      console.error("Batch update failed", err);
      // Rollback: queue mein wapas daalo
      updateQueueRef.current.push(...payload);
    } finally {
      // ✅ Guarantee: hamesha reset hogi
      if (isSyncingRef) {
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 300);
      }
    }
  }, 400);
};

export const flushBatch = async ({ batchTimerRef, updateQueueRef, isSyncingRef }: any) => {
  if (batchTimerRef.current) {
    clearTimeout(batchTimerRef.current);
    batchTimerRef.current = null;
  }

  const payload = [...updateQueueRef.current];
  updateQueueRef.current = [];

  if (!payload.length) {
    // ✅ Empty ho toh bhi reset
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 300);
    return;
  }

  try {
    await updateTodosBulk(payload);
  } catch (err) {
    console.error("flushBatch failed", err);
  } finally {
    // ✅ Guarantee reset — try/catch se bahar
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 300);
  }
};







"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AddTodo, CompleteTodo, DeleteTodo, UpdateTodo } from "@/hooks/todo";
import { AddNewCategory, DeleteCategory } from "@/hooks/category";
import Card from "@/components/card";
import type { Container } from "@/type/todo";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  DragOverEvent,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import TodoOverlay from "@/components/todoOverlay";
import CardOverlay from "@/components/cardOverlay";
import { BatchUpdate, flushBatch } from "@/hooks/helpers";
import Todoform from "@/components/form";
import AddCategoryModal from "@/components/addCategoryModal";
import EditTodoPopUp from "@/components/editTodoPopUp";
import AddTodoModal from "@/components/addTodoModal";
import { updateCategoriesBulk } from "@/hooks/bulkCategory";

export default function TodoHome({ todos, categories, accessToken, isViewer, boardId }: any) {
  const [todo, setTodo] = useState("");
  const [category, setCategory] = useState<string>("");
  const [modalTodo, setModalTodo] = useState("");
  const [modalCategory, setModalCategory] = useState<number | null>(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [containers, setContainers] = useState<Container[]>([]);
  const isDraggingRef = useRef(false);
  const containersRef = useRef(containers);
  const isSyncingRef = useRef(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const latestContainersRef = useRef<Container[]>([]);
  const optimisticRef = useRef<Container[] | null>(null);
  const updateQueueRef = useRef<any[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTodosRef = useRef(todos);
  const latestCategoriesRef = useRef(categories);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const updateContainers = (updater: (prev: Container[]) => Container[]) => {
    setContainers((prev) => {
      const next = updater(prev);
      latestContainersRef.current = next;
      return next;
    });
  };

  const categoryIds = useMemo(
    () => containers.map((c) => `cat-${c.id}`),
    [containers]
  );

  // ✅ FIX Bug 1: Queue management yahan hoti hai, BatchUpdate sirf timer
  // Pehle: BatchUpdate ko `items` pass hota tha — wo apna alag dedup karta tha
  // merged queue ignore ho jaati thi → kuch updates DB mein nahi jaate the
  const scheduleBatchUpdate = useCallback((items: any[]) => {
    // Step 1: existing queue + naye items merge karo
    const merged = [...updateQueueRef.current, ...items];

    // Step 2: id ke basis pe deduplicate — latest value rakhte hain
    updateQueueRef.current = Object.values(
      Object.fromEntries(merged.map((item) => [item.id, item]))
    );

    // Step 3: BatchUpdate sirf timer set karta hai, queue se read karta hai
    BatchUpdate({ updateQueueRef, batchTimerRef, isSyncingRef });
  }, []);

  const buildContainers = useCallback((cats: any[], todosArr: any[]) => {
    return cats
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((cat) => ({
        id: cat.id,
        title: cat.category,
        items: todosArr
          .filter((t) => t.category_id === cat.id)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      }));
  }, []);

  function findContainerId(itemId: UniqueIdentifier): UniqueIdentifier | undefined {
    const container = containers.find((c) => {
      if (c.id === itemId) return true;
      return c.items.some((item) => item.id === itemId);
    });
    return container?.id;
  }

  const isCategoryDrag = useCallback((id: UniqueIdentifier) => {
    return String(id).startsWith("cat-");
  }, []);

  // ─── Modal Handlers ──────────────────────────────────────────────────────────

  const TaskModalOpen = useCallback((categoryId: number) => {
    setShowTaskModal(true);
    setModalCategory(categoryId);
    setTodo("");
    setCategory("");
    setModalTodo("");
    setNewCategory("");
  }, []);

  const handleCancelModal = useCallback(() => {
    setIsOpen(false);
    setShowModal(false);
    setShowTaskModal(false);
    setTodo("");
    setCategory("");
    setModalCategory(null);
    setModalTodo("");
    setNewCategory("");
    setEditText("");
    setEditTodoId(null);
  }, []);

  // ─── Drag Handlers ───────────────────────────────────────────────────────────

  const sensor = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    isDraggingRef.current = true;
    isSyncingRef.current = true;
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;
      if (isCategoryDrag(active.id)) return;

      const activeId = active.id;
      const overId = over.id;
      const activeContainerId = findContainerId(activeId);
      const overContainerId = findContainerId(overId);

      if (!activeContainerId || !overContainerId) return;
      if (activeContainerId === overContainerId && activeId !== overId) return;
      if (activeContainerId === overContainerId) return;

      setContainers((prev) => {
        const activeContainer = prev.find((c) => c.id === activeContainerId);
        if (!activeContainer) return prev;
        const activeItem = activeContainer.items.find((item) => item.id === activeId);
        if (!activeItem) return prev;

        return prev.map((container) => {
          if (container.id === activeContainerId) {
            return {
              ...container,
              items: container.items.filter((item) => item.id !== activeId),
            };
          }
          if (container.id === overContainerId) {
            if (overId === overContainerId) {
              return { ...container, items: [...container.items, activeItem] };
            }
            const overItemIndex = container.items.findIndex((item) => item.id === overId);
            if (overItemIndex !== -1) {
              return {
                ...container,
                items: [
                  ...container.items.slice(0, overItemIndex + 1),
                  activeItem,
                  ...container.items.slice(overItemIndex + 1),
                ],
              };
            }
          }
          return container;
        });
      });
    },
    [containers]
  );

  const handleCategoryDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const activeRaw = String(active.id).replace("cat-", "");
      const overRaw = String(over.id).replace("cat-", "");
      if (!String(over.id).startsWith("cat-")) return;

      const oldIndex = containers.findIndex((c) => String(c.id) === activeRaw);
      const newIndex = containers.findIndex((c) => String(c.id) === overRaw);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(containers, oldIndex, newIndex);
      setContainers(reordered);
      latestContainersRef.current = reordered;

      // ✅ FIX Bug 2: latestCategoriesRef bhi reordered positions ke saath update karo
      // Pehle nahi tha — todo realtime event pe buildContainers(latestCategoriesRef.current)
      // purani positions se rebuild karta tha → cards revert ho jaate the
      const updatedCategories = latestCategoriesRef.current.map((cat: any) => {
        const newPos = reordered.findIndex((c) => Number(c.id) === Number(cat.id));
        return newPos !== -1 ? { ...cat, position: newPos } : cat;
      });
      latestCategoriesRef.current = updatedCategories;

      try {
        const items = reordered.map((cat, index) => ({
          id: Number(cat.id),
          position: index,
        }));
        await updateCategoriesBulk(items);
      } catch (err) {
        console.error("Category bulk update failed", JSON.stringify(err));
      } finally {
        isDraggingRef.current = false;
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 300);
      }
    },
    [containers]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      isDraggingRef.current = false;

      if (!over) {
        setActiveId(null);
        isSyncingRef.current = false;
        return;
      }

      if (isCategoryDrag(active.id)) {
        handleCategoryDragEnd(event);
        setActiveId(null);
        return;
      }

      const activeContainerId = findContainerId(active.id);
      const overContainerId = findContainerId(over.id);

      if (!activeContainerId || !overContainerId) {
        setActiveId(null);
        isSyncingRef.current = false;
        return;
      }

      const currentContainers = [...containers];
      const sourceContainer = currentContainers.find((c) => c.id === activeContainerId);
      const destinationContainer = currentContainers.find((c) => c.id === overContainerId);

      if (!sourceContainer || !destinationContainer) {
        setActiveId(null);
        isSyncingRef.current = false;
        return;
      }

      // Same container — reorder
      if (activeContainerId === overContainerId) {
        const activeIndex = sourceContainer.items.findIndex((item) => item.id === active.id);
        const overIndex = sourceContainer.items.findIndex((item) => item.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          const newItems = arrayMove(sourceContainer.items, activeIndex, overIndex);
          const nextState = currentContainers.map((c) =>
            c.id === activeContainerId ? { ...c, items: newItems } : c
          );

          optimisticRef.current = nextState;
          setContainers(nextState);
          latestContainersRef.current = nextState;

          scheduleBatchUpdate(
            newItems.map((item, index) => ({
              id: Number(item.id),
              position: index,
              category_id: Number(activeContainerId),
            }))
          );
        } else {
          isSyncingRef.current = false;
        }
      } else {
        // Different container — move
        const movedItem = sourceContainer.items.find((item) => item.id === active.id);
        if (!movedItem) {
          setActiveId(null);
          isSyncingRef.current = false;
          return;
        }

        let newIndex = destinationContainer.items.length;
        if (over.id !== overContainerId) {
          const overIndex = destinationContainer.items.findIndex(
            (item) => item.id === over.id
          );
          if (overIndex !== -1) newIndex = overIndex;
        }

        const updatedSourceItems = sourceContainer.items
          .filter((item) => item.id !== active.id)
          .map((item, index) => ({
            id: Number(item.id),
            position: index,
            category_id: Number(activeContainerId),
          }));

        const updatedDestinationItems = [
          ...destinationContainer.items.slice(0, newIndex),
          movedItem,
          ...destinationContainer.items.slice(newIndex),
        ].map((item, index) => ({
          id: Number(item.id),
          position: index,
          category_id: Number(overContainerId),
        }));

        scheduleBatchUpdate([...updatedSourceItems, ...updatedDestinationItems]);
      }

      setActiveId(null);
      optimisticRef.current = null;
      await flushBatch({ batchTimerRef, updateQueueRef, isSyncingRef });
    },
    [containers]
  );

  // ─── Todo CRUD ───────────────────────────────────────────────────────────────

  const handleAddTodo = useCallback(async (e: any) => {
    await AddTodo({ e, setLoading, updateContainers, setShowTaskModal });
    setTodo("");
    setCategory("");
    setModalTodo("");
  }, []);

  const handleUpdate = useCallback(
    async (e: any) => {
      await UpdateTodo({
        e,
        latestContainersRef,
        setLoading,
        updateContainers,
        editTodoId,
        editText,
        setIsOpen,
        setContainers,
      });
    },
    [editTodoId, editText]
  );

  const handleDelete = useCallback(async (id: number) => {
    await DeleteTodo({ id, updateContainers, latestContainersRef, setContainers });
  }, []);

  const handleCompleteTodo = useCallback(async (id: number) => {
    await CompleteTodo({ id, latestContainersRef, updateContainers, setContainers });
  }, []);

  // ─── Category CRUD ───────────────────────────────────────────────────────────

  const handleAddCategory = useCallback(async (e: any) => {
    setLoading(true);
    await AddNewCategory({ e, updateContainers });
    setNewCategory("");
    setLoading(false);
    setShowModal(false);
  }, []);

  // ✅ refs use karo — stale closure se bachao
  const handleDeleteCategory = useCallback(async (catId: number) => {
    await DeleteCategory({
      catId,
      categories: latestCategoriesRef.current,
      containers: latestContainersRef.current,
      updateContainers,
      setContainers,
    });
  }, []);

  const handleEdit = useCallback((todo: any) => {
    setIsOpen(true);
    setEditTodoId(todo.id);
    setEditText(todo.task);
    setTodo("");
  }, []);

  // ─── Overlay Helpers ─────────────────────────────────────────────────────────

  const getActiveItem = () => {
    for (const container of containers) {
      const item = container.items.find((item) => item.id === activeId);
      if (item) return item;
    }
    return null;
  };

  const getActiveCard = () => {
    if (!activeId) return null;
    const rawId = String(activeId).replace("cat-", "");
    return containers.find((c) => String(c.id) === rawId) || null;
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    latestTodosRef.current = todos;
    latestCategoriesRef.current = categories;
    setContainers(buildContainers(categories, todos));
  }, [todos, categories]);

  // ✅ [] dependency — containers change pe re-subscribe nahi hoga
  useEffect(() => {
    const supabase = createClient();

    const setup = async () => {
      let filter: string;
      if (boardId) {
        filter = `board_id=eq.${boardId}`;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        filter = `user_id=eq.${user.id}`;
      }

      return supabase
        .channel(`todos-rt-${boardId ?? "owner"}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "todos", filter },
          (payload) => {
            if (isDraggingRef.current) return;
            if (isSyncingRef.current) return;

            const { eventType, new: newRecord, old } = payload;
            let updatedTodos = [...latestTodosRef.current];

            if (eventType === "INSERT") {
              if (!updatedTodos.find((t) => t.id === newRecord.id)) {
                updatedTodos.push(newRecord);
              }
            }
            if (eventType === "UPDATE") {
              updatedTodos = updatedTodos.map((t) =>
                t.id === newRecord.id ? newRecord : t
              );
            }
            if (eventType === "DELETE") {
              updatedTodos = updatedTodos.filter((t) => t.id !== old.id);
            }

            latestTodosRef.current = updatedTodos;
            // ✅ latestCategoriesRef.current mein updated positions hain (card reorder ke baad bhi)
            setContainers(buildContainers(latestCategoriesRef.current, updatedTodos));
          }
        )
        .subscribe();
    };

    let ch: any;
    setup().then((c) => { ch = c; });
    return () => { if (ch) supabase.removeChannel(ch); };
  }, [boardId]);

  useEffect(() => {
    const supabase = createClient();

    const setup = async () => {
      let filter: string;
      if (boardId) {
        filter = `board_id=eq.${boardId}`;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        filter = `user_id=eq.${user.id}`;
      }

      return supabase
        .channel(`categories-rt-${boardId ?? "owner"}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "categories", filter },
          (payload) => {
            if (isDraggingRef.current) return;

            const { eventType, new: newRecord, old } = payload;
            let updatedCategories = [...latestCategoriesRef.current];

            if (eventType === "INSERT") {
              if (!updatedCategories.find((c) => c.id === newRecord.id)) {
                updatedCategories.push(newRecord);
              }
            }
            if (eventType === "UPDATE") {
              updatedCategories = updatedCategories.map((c) =>
                c.id === newRecord.id ? newRecord : c
              );
            }
            if (eventType === "DELETE") {
              updatedCategories = updatedCategories.filter((c) => c.id !== old.id);
            }

            latestCategoriesRef.current = updatedCategories;
            setContainers(buildContainers(updatedCategories, latestTodosRef.current));
          }
        )
        .subscribe();
    };

    let ch: any;
    setup().then((c) => { ch = c; });
    return () => { if (ch) supabase.removeChannel(ch); };
  }, [boardId]);

  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);

  useEffect(() => {
    return () => {
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
      if (updateQueueRef.current.length > 0) {
        flushBatch({ batchTimerRef, updateQueueRef, isSyncingRef });
      }
    };
  }, []);

  useEffect(() => {
    if (!accessToken) router.push("/login");
  }, [accessToken, router]);

  // Owner ka independent fetch
  useEffect(() => {
    if (boardId) return;

    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: t } = await supabase.from("todos").select("*").eq("user_id", user.id);
      const { data: c } = await supabase.from("categories").select("*").eq("user_id", user.id);

      setContainers(buildContainers(c || [], t || []));
    };

    fetchData();
  }, [boardId]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <section>
      <div>
        <Todoform
          handleAddTodo={handleAddTodo}
          containers={containers}
          loading={loading}
          setShowModal={setShowModal}
          todo={todo}
          setTodo={setTodo}
          category={category}
          setCategory={setCategory}
          isViewer={isViewer}
        />

        <DndContext
          sensors={isViewer ? [] : sensor}
          collisionDetection={rectIntersection}
          onDragStart={isViewer ? undefined : handleDragStart}
          onDragOver={isViewer ? undefined : handleDragOver}
          onDragEnd={isViewer ? undefined : handleDragEnd}
        >
          <SortableContext items={categoryIds} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-5 overflow-x-auto custom-scrollbar">
              {containers?.map((cat, index) => (
                <Card
                  key={`container-${cat.id}`}
                  cat={cat}
                  todo={cat.items}
                  index={index}
                  categories={containers}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                  TaskModalOpen={TaskModalOpen}
                  handleDeleteCategory={handleDeleteCategory}
                  handleCompleteTodo={handleCompleteTodo}
                  isViewer={isViewer}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && isCategoryDrag(activeId) ? (
              <CardOverlay cat={getActiveCard()} todo={getActiveCard()?.items || []} />
            ) : activeId ? (
              <TodoOverlay>{getActiveItem()?.task}</TodoOverlay>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showModal && (
        <AddCategoryModal
          handleCancelModal={handleCancelModal}
          handleAddCategory={handleAddCategory}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          loading={loading}
        />
      )}

      {isOpen && (
        <EditTodoPopUp
          handleCancelModal={handleCancelModal}
          handleUpdate={handleUpdate}
          editText={editText}
          setEditText={setEditText}
          loading={loading}
        />
      )}

      {showTaskModal && (
        <AddTodoModal
          handleCancelModal={handleCancelModal}
          handleAddTodo={handleAddTodo}
          modalTodo={modalTodo}
          setModalTodo={setModalTodo}
          modalCategory={modalCategory}
          loading={loading}
        />
      )}
    </section>
  );
}













