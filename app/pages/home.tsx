"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CircleX, LayoutGrid, Plus } from "lucide-react";
import Card from "@/components/card";
import type { TodosCategoriesTypes, Container } from "@/type/todo";
import {
  addCategory,
  addTodo,
  deleteTodo,
  updateTodo,
  updateCategory,
  deleteCategory,
} from "@/app/(action)/action";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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

export async function updateTodosBulk(items: any[]) {
  const supabase = createClient();

  const { error } = await supabase.rpc("reorder_todos", {
    items,
  });

  if (error) {
    console.error("Bulk update failed", error);
    throw error;
  }
}



export default function TodoHome({
  todos,
  categories,
  accessToken,
}: TodosCategoriesTypes) {
  const [todo, setTodo] = useState("");
  const [category, setCategory] = useState<string>("");
  const [modalTodo, setModalTodo] = useState("");
  const [modalCategory, setModalCategory] = useState<number | null>(null);
  const router = useRouter();

  // for edit todo States
  const [isOpen, setIsOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // for add more categories
  const [newCategory, setNewCategory] = useState("");

  // show add Category modal
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [containers, setContainers] = useState<Container[]>([]);
  const isDraggingRef = useRef(false);
  const containersRef = useRef(containers);
  const isSyncingRef = useRef(false);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const latestContainersRef = useRef<Container[]>([]);


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

  // for Optimistic UI
  const optimisticRef = useRef<Container[] | null>(null);

  // for Bulk API call
  const updateQueueRef = useRef<any[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // for Bulk API call
  const scheduleBatchUpdate = useCallback((items: any[]) => {
    updateQueueRef.current = [...updateQueueRef.current, ...items];

    // deduplicate by id (VERY IMPORTANT)
    const map = new Map();

    for (const item of updateQueueRef.current) {
      map.set(item.id, item);
    }

    updateQueueRef.current = Array.from(map.values());

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }

    batchTimerRef.current = setTimeout(async () => {
      const payload = [...updateQueueRef.current];
      try {

        if (payload.length === 0) return;

        updateQueueRef.current = [];

        await updateTodosBulk(payload);
        
      } catch (err) {
        console.error("Batch update failed", err);
        updateQueueRef.current.push(...payload);
      }
    }, 400);
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

  const latestTodosRef = useRef(todos);
  const latestCategoriesRef = useRef(categories);

  

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

  const flushBatch = async () => {
  if (batchTimerRef.current) {
    clearTimeout(batchTimerRef.current);
    batchTimerRef.current = null;
  }

  const payload = [...updateQueueRef.current];
  if (!payload.length) return;
  updateQueueRef.current = [];

  try {
    await updateTodosBulk(payload);
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 500);

  } catch (err) {
    console.error(err);
  }
};


  const TaskModalOpen = useCallback((categoryId: number) => {
    setShowTaskModal(true);
    setModalCategory(categoryId);
    console.log("modal category", modalCategory);
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
      const overRaw = String(over.id).replace("cat-", "");

      if (!String(over.id).startsWith("cat-")) return;

      const oldIndex = containers.findIndex((c) => String(c.id) === activeRaw);
      const newIndex = containers.findIndex((c) => String(c.id) === overRaw);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(containers, oldIndex, newIndex);

      setContainers(reordered);
      try {
        await Promise.all(
          reordered.map((cat, index) =>
            updateCategory(Number(cat.id), { position: index }),
          ),
        );
      } catch (err) {
        console.error("DB update failed (category reorder)", err);
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

      if (activeContainerId === overContainerId && activeId !== overId) {
        return;
      }

      if (activeContainerId === overContainerId) return;

      setContainers((prev) => {
        const activeContainer = prev.find((c) => c.id === activeContainerId);
        if (!activeContainer) return prev;

        const activeItem = activeContainer.items.find(
          (item) => item.id === activeId,
        );
        if (!activeItem) return prev;

        const newContainers = prev.map((container) => {
          if (container.id === activeContainerId) {
            return {
              ...container,
              items: container.items.filter((item) => item.id !== activeId),
            };
          }

          if (container.id === overContainerId) {
            if (overId === overContainerId) {
              return {
                ...container,
                items: [...container.items, activeItem],
              };
            }

            const overItemIndex = container.items.findIndex(
              (item) => item.id === overId,
            );
            if (overItemIndex !== -1) {
              const activeItemCopy = { ...activeItem };
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

        return newContainers;
      });
    },
    [containers],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
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

      const activeContainerId = findContainerId(active.id);
      const overContainerId = findContainerId(over.id);

      if (!activeContainerId || !overContainerId) {
        setActiveId(null);
        return;
      }

      const latestContainers = [...containers];

      const sourceContainer = latestContainers.find(
        (c) => c.id === activeContainerId,
      );
      const destinationContainer = latestContainers.find(
        (c) => c.id === overContainerId,
      );

      if (!sourceContainer || !destinationContainer) {
        setActiveId(null);
        return;
      }

      // REORDER
      if (activeContainerId === overContainerId) {
        const activeIndex = sourceContainer.items.findIndex(
          (item) => item.id === active.id,
        );

        const overIndex = sourceContainer.items.findIndex(
          (item) => item.id === over.id,
        );

        if (activeIndex !== -1 && overIndex !== -1) {
          const newItems = arrayMove(
            sourceContainer.items,
            activeIndex,
            overIndex,
          );

          // for optimistic UI
          const nextState = (() => {
            const latestContainers = [...containers];

            const sourceContainer = latestContainers.find(
              (c) => c.id === activeContainerId,
            );

            const destinationContainer = latestContainers.find(
              (c) => c.id === overContainerId,
            );

            if (!sourceContainer || !destinationContainer)
              return latestContainers;

            if (activeContainerId === overContainerId) {
              const activeIndex = sourceContainer.items.findIndex(
                (item) => item.id === active.id,
              );

              const overIndex = sourceContainer.items.findIndex(
                (item) => item.id === over.id,
              );

              const newItems = arrayMove(
                sourceContainer.items,
                activeIndex,
                overIndex,
              );

              return latestContainers.map((c) =>
                c.id === activeContainerId ? { ...c, items: newItems } : c,
              );
            }

            return latestContainers;
          })();

          optimisticRef.current = nextState;
          setContainers(nextState);

          // DB update
          try {
            scheduleBatchUpdate(
              newItems.map((item, index) => ({
                id: Number(item.id),
                position: index,
                category_id: Number(activeContainerId),
              })),
            );
          } catch (err) {
            console.error("DB update failed (reorder)", err);
          }
        }
      } else {
        const movedItem = sourceContainer.items.find(
          (item) => item.id === active.id,
        );

        if (!movedItem) {
          setActiveId(null);
          return;
        }

        let newIndex = destinationContainer.items.length;

        if (over.id !== overContainerId) {
          const overIndex = destinationContainer.items.findIndex(
            (item) => item.id === over.id,
          );
          if (overIndex !== -1) {
            newIndex = overIndex;
          }
        }

        try {
          scheduleBatchUpdate([
            {
              id: Number(movedItem.id),
              position: newIndex,
              category_id: Number(overContainerId),
            },
          ]);
        } catch (err) {
          console.error("DB update failed (move)", err);
        }
      }

      setActiveId(null);
      optimisticRef.current = null;
      await flushBatch();
    },
    [containers],
  );

 

  // Add Todo
// const handleAddTodo = async (e: any) => {
//   e.preventDefault();
//   setLoading(true);

//   const tempId = Date.now();
//   const formData = new FormData(e.currentTarget);

//   const task = formData.get("todo");
//   const catId = Number(formData.get("category"));

//   const optimisticTodo = {
//     id: tempId,
//     task,
//     category_id: Number(catId),
//     position: Date.now(),
//   };

//       updateContainers(prev =>
//       prev.map((cat: any) =>
//         cat.id === Number(catId)
//     ? { ...cat, items: [...cat.items, optimisticTodo] }
//     : cat
//   )
// );
  
//   setTodo("");
//   setCategory("");
//   setModalTodo("")
//   try { 
//     await addTodo(formData);
//     setLoading(false);
//     toast.success("Todo Successfully Added", { position: "top-center" });
//     setShowTaskModal(false);
//   } catch (err) {
//     updateContainers(prev =>
//       prev.map(cat => ({
//         ...cat,
//         items: cat.items.filter(t => t.id !== tempId),
//       }))
//     );
//   } 
// };

//new Todo
const handleAddTodo = async (e: any) => {
  e.preventDefault();
  setLoading(true);

  const tempId = Date.now();
  const formData = new FormData(e.currentTarget);

  const task = formData.get("todo");
  const catId = Number(formData.get("category"));

  const optimisticTodo = {
    id: tempId,
    task,
    category_id: catId,
    position: Date.now(),
    is_complete: false,
  };

  // ✅ Optimistic UI
  updateContainers(prev =>
    prev.map((cat:any) =>
      cat.id === catId
        ? { ...cat, items: [...cat.items, optimisticTodo] }
        : cat
    )
  );

  // reset inputs
  setTodo("");
  setCategory("");
  setModalTodo("");

  try {
    // 🔥 get real DB todo
    const newTodo = await addTodo(formData);

    // 🔥 replace tempId with real DB id
    updateContainers(prev =>
      prev.map(cat => ({
        ...cat,
        items: cat.items.map(item =>
          item.id === tempId ? newTodo : item
        ),
      }))
    );

    toast.success("Todo Successfully Added", {
      position: "top-center",
    });

    setShowTaskModal(false);
  } catch (err) {
    // ❌ rollback
    updateContainers(prev =>
      prev.map(cat => ({
        ...cat,
        items: cat.items.filter(t => t.id !== tempId),
      }))
    );

    toast.error("Failed to add todo", {
      position: "top-center",
    });
  } finally {
    setLoading(false);
  }
};

const handleAddCategory = async (e: any) => {
  e.preventDefault();
  setLoading(true);
  const formData = new FormData(e.currentTarget);
  const name = formData.get("category") as string;
  const tempId = Date.now();
  setLoading(false)
  setShowModal(false)
  updateContainers((prev:any) => [
    ...prev,
    {
      id: tempId,
      title: name,
      items: [],
      position: prev.length
    },
  ]);
   toast.success("New Card Successfully Added", {
      position: "top-center"
    });
    setNewCategory("")
  try {
    await addCategory(formData);
  } catch (err) {
    updateContainers(prev =>
      prev.filter((c:any) => c.id !== tempId)
    );

    toast.error("New Card Not Added", {
      position: "top-center"
    });

  } 
};

  const handleDelete = async (id: number) => {
  const old = latestContainersRef.current;
  updateContainers(prev =>
    prev.map(cat => ({
      ...cat,
      items: cat.items.filter(t => t.id !== id)
    }))
  );
  try {
    toast.success("Todo Successfully Deleted", { position: "top-center" });
    await deleteTodo(id);
  } catch (err) {
    toast.error("Failed to delete todo", { position: "top-center" }); 
    setContainers(old);
  }
};

  // show Edit Modal
  const handleEdit = useCallback((todo: any) => {
    setIsOpen(true);
    setEditTodoId(todo.id);
    setEditText(todo.task);
    setTodo("");
  }, []);

  const handleDeleteCategory = async (catId: number) => {
  if (categories.length === 1) {
    toast.error("Last board cannot be deleted", {
      position: "top-center"
    });
    return;
  }
  const previousState = containers;
  updateContainers(prev =>
    prev.filter((cat :any)=> cat.id !== catId)
  );
  toast.success("Card Successfully Deleted", {
      position: "top-center"
    });

  try {
    await deleteCategory(catId);
  } catch (err) {
    setContainers(previousState);
    toast.error("Delete failed, restored previous state", {
      position: "top-center"
    });
  }
};



  const handleUpdate = async (e:any) => {
  e.preventDefault();

  const oldValue = latestContainersRef.current;

  setLoading(true);
  updateContainers(prev =>
    prev.map(cat => ({
      ...cat,
      items: cat.items.map(t =>
        t.id === editTodoId
          ? { ...t, task: editText }
          : t
      )
    }))
  );

  try {
    await updateTodo(Number(editTodoId), { task: editText });
    setIsOpen(false);
    toast.success("Todo Successfully Updated", { position: "top-center" });
  } catch (err) {
    setContainers(oldValue)
  }finally{
    setLoading(false)
  }
};

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
  }, [todos, categories]);

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

          setContainers(prev => {
          return prev.map(container => {
            return {
              ...container,
              items: container.items.map(item =>
                updatedTodos.find(t => t.id === item.id) ?? item
              ),
            };
          });
        });
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

  // for  Batch API Calls
 useEffect(() => {
  return () => {
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }

    // 🔥 FINAL SAFETY FLUSH
    if (updateQueueRef.current.length > 0) {
      flushBatch();
    }
  };
}, []);

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, router]);

  return (
    <div>
      <div>
        <form onSubmit={handleAddTodo} className="mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex  flex-col md:flex-row gap-4">
            <input
              required
              name="todo"
              type="text"
              placeholder="Enter your task..."
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2  focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400 "
            />

            <select
              title="Select Category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium cursor-pointer outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {containers.map((cat, index) => (
                <option className="text-gray-700" key={index} value={cat.id}>
                  THIS {cat.title.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="lg:w-30  lg:py-1 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/70 transition-all duration-200 flex items-center gap-2 justify-center  cursor-pointer "
            >
              {loading ? (
                <Spinner className="size-6" />
              ) : (
                <>
                  <Plus className="w-4 h-4  text-gray-200" /> Add Task
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowModal(true);
                setTodo("");
              }}
              className="px-3 lg:py-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 justify-center  cursor-pointer  hover:bg-primary/10 "
            >
              <LayoutGrid className="w-4 h-4" />
              New Board
            </button>
          </div>
        </form>

        {/* cards */}
        <DndContext
          sensors={sensor}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
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
      {/* show Add Category Modal  */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancelModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Create New Board
              </h2>
              <CircleX
                onClick={handleCancelModal}
                className="w-6 h-6  cursor-pointer text-red-500 transition-colors"
              />
            </div>
            <form onSubmit={handleAddCategory}>
              <input
                required
                name="category"
                type="text"
                placeholder="Enter board name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 mb-4"
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 py-5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 transition-all duration-200 text-md  cursor-pointer "
                >
                  {loading ? <Spinner className="size-6" /> : "Create Board"}
                </Button>
                <Button
                  disabled={loading}
                  type="button"
                  onClick={handleCancelModal}
                  className="flex-1 py-5 rounded-lg border border-gray-300 text-gray-700 font-medium text-md bg-white  hover:bg-gray-50 transition-all duration-200 cursor-pointer "
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Edit Todo PopUp */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancelModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
              <CircleX
                onClick={handleCancelModal}
                className="w-6 h-6  cursor-pointer text-red-500 transition-colors"
              />
            </div>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                placeholder="Update your task..."
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 mb-4"
              />
              <div className="flex gap-3">
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 text-md  flex items-center justify-center    transition-all duration-200  cursor-pointer"
                >
                  {loading ? <Spinner className="size-6" /> : "Update Task"}
                </button>
                <Button
                  type="button"
                  onClick={handleCancelModal}
                  className="flex-1 py-5 rounded-lg border border-gray-300 text-gray-700 font-medium text-md bg-white  hover:bg-gray-50 transition-all duration-200  cursor-pointer "
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancelModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Task</h2>
              <CircleX
                onClick={handleCancelModal}
                className="w-6 h-6 cursor-pointer text-red-500 transition-colors"
              />
            </div>
            <form onSubmit={handleAddTodo}>
              <div className="flex   justify-center gap-2">
                <input
                  required
                  name="todo"
                  type="text"
                  placeholder="Enter your task..."
                  value={modalTodo}
                  onChange={(e) => setModalTodo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 
                  transition-all text-gray-700 mb-4"
                />
                <input
                  type="hidden"
                  name="category"
                  value={modalCategory ?? ""}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 py-5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 text-md transition-all text-center  duration-200  cursor-pointer"
                >
                  {loading ? <Spinner className="size-6" /> : "Add Task"}
                </Button>
                <Button
                  disabled={loading}
                  type="button"
                  onClick={handleCancelModal}
                  className="flex-1 py-5 rounded-lg border border-gray-300 text-gray-700 font-medium text-md bg-white hover:bg-gray-100 transition-all duration-200  cursor-pointer "
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}