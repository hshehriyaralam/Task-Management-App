"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AddTodo, CompleteTodo, DeleteTodo,UpdateTodo } from "@/hooks/todo";
import { AddNewCategory, DeleteCategory } from "@/hooks/category";
import Card from "@/components/card";
import type {  Container } from "@/type/todo";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";


// for Dnd kit
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
import { BatchUpdate,flushBatch } from "@/hooks/helpers";
import Todoform from "@/components/form";
import AddCategoryModal from "@/components/addCategoryModal";
import EditTodoPopUp from "@/components/editTodoPopUp";
import AddTodoModal from "@/components/addTodoModal";
import { updateCategoriesBulk } from "@/hooks/bulkCategory";




export default function TodoHome({todos, categories, accessToken,isViewer,boardId}:any) { 
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
  const updateQueueRef = useRef<any[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTodosRef = useRef(todos);
  const latestCategoriesRef = useRef(categories);





  const updateContainers = (updater: (prev: Container[]) => Container[]) => {
  setContainers(prev => {
    const next = updater(prev);
    latestContainersRef.current = next;
    return next;
  });
};



  const categoryIds = useMemo(
    () => containers.map((c) => `cat-${c.id}`),
    [containers],
  );

 

  // for Bulk API call
  const scheduleBatchUpdate = useCallback((items: any[]) => {
      const existing = updateQueueRef.current;
      // console.log("batch update existing ref ", existing)
         const merged = [
            ...existing,
            ...items
          ];

        updateQueueRef.current = Object.values(
          Object.fromEntries(
            merged.map(item => [item.id, item]) 
          )
        )
    BatchUpdate({
      items : updateQueueRef.current,
      updateQueueRef,batchTimerRef})
  }, []);

  const buildContainers = useCallback((categories: any[], todos: any[]) => {
    return categories
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((cat) => ({
        id: cat.id,
        title: cat.category,
        items: todos
          .filter((t) => t.category_id === cat.id)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      }));
  }, []);

  

  // find active container helper function
  function findContainerId(
    itemId: UniqueIdentifier,
  ): UniqueIdentifier | undefined {
    const container = containers.find((container) => {
      if (container.id === itemId) return true;
      return container.items.some((item) => item.id === itemId);
    });

    return container?.id;
  }

  const isCategoryDrag = useCallback((id: UniqueIdentifier) => {
    return String(id).startsWith("cat-");
  }, []);




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

  const handleCategoryDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const activeRaw = String(active.id).replace("cat-", "");
      const overRaw = String(over.id
      ).replace("cat-", "");
      if (!String(over.id).startsWith("cat-")) return;
      const oldIndex = containers.findIndex((c) => String(c.id) === activeRaw);
      const newIndex = containers.findIndex((c) => String(c.id) === overRaw);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(containers, oldIndex, newIndex);
        setContainers(reordered);
        latestContainersRef.current = reordered;
        try {
      const items = reordered.map((cat, index) => ({
        id: Number(cat.id),
        position: index,
      }));
      isDraggingRef.current = false;   
      isSyncingRef.current = false; 
      await updateCategoriesBulk(items);
    } catch (err) {
      console.error("Category bulk update failed", JSON.stringify(err));
    }
    },
    [containers],
  );



  const sensor = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    isDraggingRef.current = true;
    isSyncingRef.current = true;
  }, []);



 const handleDragOver = useCallback((event: DragOverEvent) => {
  const { active, over } = event;
  if (!over) return;

  if (isCategoryDrag(active.id)) return;

  const activeId = active.id;
  const overId = over.id;

  const activeContainerId = findContainerId(activeId);
  const overContainerId = findContainerId(overId);

  if (!activeContainerId || !overContainerId) return;

  if (activeContainerId === overContainerId) return;

  setContainers((prev) => {
    const activeContainer = prev.find(c => c.id === activeContainerId);
    const overContainer = prev.find(c => c.id === overContainerId);
    if (!activeContainer || !overContainer) return prev;

    const activeItem = activeContainer.items.find(i => i.id === activeId);
    if (!activeItem) return prev;

    return prev.map(container => {
      if (container.id === activeContainerId) {
        return {
          ...container,
          items: container.items.filter(i => i.id !== activeId),
        };
      }

      if (container.id === overContainerId) {
        const overIndex = container.items.findIndex(i => i.id === overId);

        return {
          ...container,
          items:
            overIndex === -1
              ? [...container.items, activeItem]
              : [
                  ...container.items.slice(0, overIndex),
                  activeItem,
                  ...container.items.slice(overIndex),
                ],
        };
      }

      return container;
    });
  });
}, [containers]);




const handleDragEnd = useCallback(async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) {
    setActiveId(null);
    return;
  }
  if (isCategoryDrag(active.id)) {
    handleCategoryDragEnd(event);
    setActiveId(null);
    return;
  }

  const sourceContainerId = findContainerId(active.id);
  const destinationContainerId = findContainerId(over.id);

  if (!sourceContainerId || !destinationContainerId) {
    setActiveId(null);
    return;
  }

  if (sourceContainerId === destinationContainerId) {
    const container = containers.find(c => c.id === sourceContainerId);
    if (!container) return;

    const oldIndex = container.items.findIndex(i => i.id === active.id);
    const newIndex = container.items.findIndex(i => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(container.items, oldIndex, newIndex);

    const newContainers = containers.map(c =>
      c.id === sourceContainerId ? { ...c, items: newItems } : c
    );

    setContainers(newContainers);

    try {
      scheduleBatchUpdate(
        newItems.map((item, index) => ({
          id: Number(item.id),
          position: index,
          category_id: Number(sourceContainerId),
        }))
      );
    } catch (err) {
      console.error("Reorder failed", err);
    }
  }

  setActiveId(null);
  isDraggingRef.current = false;

  await flushBatch({ batchTimerRef, updateQueueRef, isSyncingRef });
  isSyncingRef.current = false;
  updateQueueRef.current = [];

}, [containers]);



 

  // Todo CRUD
const handleAddTodo = useCallback(async (e: any) => {
  await AddTodo({e,setLoading,updateContainers,setShowTaskModal})
  // reset inputs
  setTodo("");
  setCategory("");
  setModalTodo("");

},[])

  const handleUpdate = useCallback(async (e:any) => {
  await UpdateTodo({e,latestContainersRef,setLoading,updateContainers,editTodoId,editText,setIsOpen,setContainers})
},[editTodoId, editText])


  const handleDelete = useCallback(async (id: number) => {
    await DeleteTodo({id, updateContainers,latestContainersRef,setContainers})
},[])

const handleCompleteTodo = async (id: number) => {
  await CompleteTodo({id,latestContainersRef,updateContainers,setContainers})
};



  
// Category CRUD 
  const handleAddCategory = useCallback(async (e:any) => {
    setLoading(true)
    await AddNewCategory({e,updateContainers})
    setNewCategory("")
    setLoading(false)
    setShowModal(false)
  },[])

  const handleDeleteCategory =  useCallback(async (catId: number) => {
  await DeleteCategory({catId,categories,containers,updateContainers,setContainers})
},[])


  // show Edit Modal
  const handleEdit = useCallback((todo: any) => {
    setIsOpen(true);
    setEditTodoId(todo.id);
    setEditText(todo.task);
    setTodo("");
  }, []);


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




  useEffect(() => {
  latestTodosRef.current = todos;
  latestCategoriesRef.current = categories;

  setContainers(buildContainers(categories, todos));
}, [todos,categories]);






  useEffect(() => {
    const supabase = createClient();

    const todoChannel = supabase
      .channel("todos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          if (isDraggingRef.current) return;
          if (isSyncingRef.current) return;
          const { eventType, new: newRecord, old } = payload;

          let updatedTodos = [...latestTodosRef.current];

          if (eventType === "INSERT") {
            updatedTodos.push(newRecord);
          }

          if (eventType === "UPDATE") {
            updatedTodos = updatedTodos.map((t) =>
              t.id === newRecord.id ? newRecord : t,
            );
          }

          if (eventType === "DELETE") {
            updatedTodos = updatedTodos.filter((t) => t.id !== old.id);
          }
          latestTodosRef.current = updatedTodos;
            const latestCategories = latestCategoriesRef.current;
            setContainers(
              buildContainers(
                latestCategories,
                updatedTodos
              )
            );
      
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(todoChannel);
    };
  }, []);

  useEffect(() => {
  const supabase = createClient();

  const categoryChannel = supabase
    .channel("categories-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "categories" },
      (payload) => {
        if (isDraggingRef.current) return;
          if (isSyncingRef.current) return;
        const { eventType, new: newRecord, old } = payload;

        let updatedCategories = [...latestCategoriesRef.current];

        if (eventType === "INSERT") {
          updatedCategories.push(newRecord);
        }

        if (eventType === "UPDATE") {
          updatedCategories = updatedCategories.map((c) =>
            c.id === newRecord.id ? newRecord : c
          );
        }

        if (eventType === "DELETE") {
          updatedCategories = updatedCategories.filter(
            (c) => c.id !== old.id
          );
        }

        latestCategoriesRef.current = updatedCategories;
        setContainers(
          buildContainers(updatedCategories, latestTodosRef.current)
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(categoryChannel);
  };
}, []);

  useEffect(() => {
  containersRef.current = containers;
}, [containers]);


  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, router]);



useEffect(() => {
  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

 
    if (boardId) return;

    const { data: todos } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id);

    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id);

    setContainers(buildContainers(categories || [], todos || []));
  };
  fetchData();
}, []);

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

        {/* cards */}
        <DndContext
            sensors={isViewer ? [] : sensor}
          collisionDetection={rectIntersection}
          onDragStart={isViewer ? undefined : handleDragStart}
          onDragOver={isViewer ? undefined : handleDragOver}
          onDragEnd={isViewer ? undefined : handleDragEnd}
        >
          <SortableContext
            items={categoryIds}
            strategy={horizontalListSortingStrategy}>
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
              <CardOverlay
                cat={getActiveCard()}
                todo={getActiveCard()?.items || []}
              />
            ) : activeId ? (
              <TodoOverlay>{getActiveItem()?.task}</TodoOverlay>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {showModal && ( <AddCategoryModal  
      handleCancelModal={handleCancelModal}
      handleAddCategory={handleAddCategory}
      newCategory={newCategory}
      setNewCategory={setNewCategory}
      loading={loading}
      />)}

      {/* Show Edit Todo PopUp */}
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