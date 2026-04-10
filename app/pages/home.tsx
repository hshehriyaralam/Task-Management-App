"use client";
import { useState, useEffect } from "react";
import { CircleX, LayoutGrid, Plus } from "lucide-react";
import Card from "@/components/card";
import type { TodosCategoriesTypes, Container } from "@/type/todo";
import dynamic from "next/dynamic";
import {
  addCategory,
  addTodo,
  deleteTodo,
  updateTodo,
} from "@/app/(action)/action";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// for Dnd kit
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  DragCancelEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ItemOverlay from "@/components/itemOverlay";

// const SortableCard = dynamic(() => import("@/components/sortableCard"), {
//   ssr: false
// })

export default function TodoHome({
  todos,
  categories,
  accessToken,
}: TodosCategoriesTypes) {
  const [todo, setTodo] = useState("");
  const [category, setCategory] = useState<string>("");
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

  // latest State
  const [todoState, setTodoState] = useState(todos);
  const [categoryState, setCategoryState] = useState(categories);

  //   const [containers, setContainers] = useState<Container[]>(() =>
  //   categories.map((cat) => ({
  //     id: cat.id,
  //     title: cat.category,
  //     items: todos.filter((t) => t.category_id === cat.id),
  //   }))
  // );

  const [containers, setContainers] = useState<Container[]>([]);
  const [hydrated, setHydrated] = useState(false);

  
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  

   const sensor = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

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
  };

  const handleDragEnd = async (event: DragEndEvent) => {
  const { over, active } = event;

  if (!over) {
    setActiveId(null);
    return;
  }

  const activeContainerId = findContainerId(active.id);
  const overContainerId = findContainerId(over.id);

  if (!activeContainerId || !overContainerId) {
    setActiveId(null);
    return;
  }

  if (activeContainerId === overContainerId && active.id !== over.id) {
    const containerIndex = containers.findIndex(
      (c) => c.id === activeContainerId
    );

    if (containerIndex === -1) {
      setActiveId(null);
      return;
    }

    const container = containers[containerIndex];

    const activeIndex = container.items.findIndex(
      (item) => item.id === active.id
    );

    const overIndex = container.items.findIndex(
      (item) => item.id === over.id
    );

    
    if (activeIndex !== -1 && overIndex !== -1) {
      const newItems = arrayMove(container.items, activeIndex, overIndex);

      setContainers((containers) => {
        return containers.map((c, i) => {
          if (i === containerIndex) {
            return { ...c, items: newItems };
          }
          return c;
        });
      });


      

      try {
        await Promise.all(
          newItems.map((item, index) =>
            updateTodo(Number(item.id), {
              position: index,
              category_id: Number(activeContainerId),
            })
          )
        );
      } catch (err) {
        console.error("DB update failed (reorder)", err);
      }
    }
  }

  setActiveId(null);
};

  // Add Todo
  const handleAddTodo = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addTodo(formData);
    setTodo("");
    setCategory("");
    setShowTaskModal(false);
    setLoading(false);
    toast.success("Todo Successfully Added", { position: "top-center" });
  };
  // Add  category
  const handleAddCategory = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addCategory(formData);
    setLoading(false);
    setShowModal(false);
    setNewCategory("");
    toast.success("New Card Successfully Added", { position: "top-center" });
  };
  // Delete Todo
  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      toast.success("Todo Successfully Deleted", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to delete todo", { position: "top-center" });
    }
  };
  // show Edit Modal
  const handleEdit = (todo: any) => {
    setIsOpen(true);
    setEditTodoId(todo.id);
    setEditText(todo.task);
    setTodo("");
  };
  // Update Todo
  const handleUpdate = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!editTodoId) return;
      await updateTodo(editTodoId, {
        task: editText,
      });
      setIsOpen(false);
      toast.success("Todo Successfully Updated", { position: "top-center" });
    } catch (error) {
      alert("Failed to Update Todo");
    } finally {
      setLoading(false);
    }
  };

  const getActiveItem = () => {
    for (const container of containers) {
      const item = container.items.find((item) => item.id === activeId);
      if (item) return item;
    }
    return null;
  };

  // useEffect(() => {
  //   const supabase = createClient();

  //   const channel = supabase
  //     .channel("todos-realtime")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "todos",
  //       },
  //       (payload) => {
  //         const { eventType, new: newRecord, old } = payload;

  //         if (eventType === "INSERT") {
  //           setTodoState((prev) => [...prev, newRecord]);
  //         }
  //         if (eventType === "UPDATE") {
  //           setTodoState((prev) =>
  //             prev.map((t) => (t.id === newRecord.id ? newRecord : t)),
  //           );
  //         }

  //         if (eventType === "DELETE") {
  //           setTodoState((prev) => prev.filter((t) => t.id !== old.id));
  //         }
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, []);

  // useEffect(() => {
  //   const supabase = createClient();

  //   const channel = supabase
  //     .channel("categories-realtime")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "categories",
  //       },
  //       (payload) => {
  //         const { eventType, new: newRecord, old } = payload;

  //         if (eventType === "INSERT") {
  //           setCategoryState((prev) => [...prev, newRecord]);
  //         }

  //         if (eventType === "UPDATE") {
  //           setCategoryState((prev) =>
  //             prev.map((c) => (c.id === newRecord.id ? newRecord : c)),
  //           );
  //         }

  //         if (eventType === "DELETE") {
  //           setCategoryState((prev) => prev.filter((c) => c.id !== old.id));
  //         }
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, []);

  useEffect(() => {
    const initial = categories.map((cat) => ({
      id: cat.id,
      title: cat.category,
      items: todos.filter((t) => t.category_id === cat.id),
    }));

    setContainers(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("todos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          const { eventType, new: newRecord, old } = payload;

          setContainers((prev) => {
            let updated = [...prev];

            // DELETE
            if (eventType === "DELETE") {
              return updated.map((c) => ({
                ...c,
                items: c.items.filter((t) => t.id !== old.id),
              }));
            }

            // INSERT / UPDATE
            if (eventType === "INSERT" || eventType === "UPDATE") {
              // remove from all containers first
              updated = updated.map((c) => ({
                ...c,
                items: c.items.filter((t) => t.id !== newRecord.id),
              }));

              // add into correct container
              return updated.map((c) => {
                if (c.id === newRecord.category_id) {
                  return {
                    ...c,
                    items: [...c.items, newRecord],
                  };
                }
                return c;
              });
            }

            return updated;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("categories-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        (payload) => {
          const { eventType, new: newRecord, old } = payload;

          setContainers((prev) => {
            if (eventType === "INSERT") {
              return [
                ...prev,
                { id: newRecord.id, title: newRecord.category, items: [] },
              ];
            }

            if (eventType === "DELETE") {
              return prev.filter((c) => c.id !== old.id);
            }

            if (eventType === "UPDATE") {
              return prev.map((c) =>
                c.id === newRecord.id ? { ...c, title: newRecord.category } : c,
              );
            }

            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, []);

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
              {categoryState.map((cat, index) => (
                <option className="text-gray-700" key={index} value={cat.id}>
                  THIS {cat.category.toUpperCase()}
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
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div>
            <div className="flex gap-5 overflow-x-auto custom-scrollbar">
              {containers?.map((cat, index) => (
                // <div key={cat.id}>
                <div key={`container-${cat.id}`}>
                  <Card
                    cat={cat}
                    // todo={cat.items
                    //   .filter((t) => t.category_id === cat.id)
                    //   .sort((a, b) => a.position - b.position)}
                    todo={cat.items}
                    index={index}
                    categories={categoryState}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    setShowTaskModal={setShowTaskModal}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* <DragOverlay>
        {
          activeId ? (
            <ItemOverlay>
                {getActiveItem()?.task}
            </ItemOverlay>
          ) : null
        }
      </DragOverlay> */}

          <DragOverlay>
            {activeId && containers.length > 0 ? (
              <ItemOverlay>{getActiveItem()?.task}</ItemOverlay>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {/* show Add Category Modal  */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
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
                onClick={() => setShowModal(false)}
                className="w-5 h-5 cursor-pointer text-red-500 transition-colors"
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
                  onClick={() => setShowModal(false)}
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
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
              <CircleX
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 cursor-pointer text-red-500 transition-colors"
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
                  onClick={() => setIsOpen(false)}
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
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Task</h2>
              <CircleX
                onClick={() => setShowTaskModal(false)}
                className="w-5 h-5 cursor-pointer text-red-500 transition-colors"
              />
            </div>
            <form onSubmit={handleAddTodo}>
              <div className="flex   justify-center gap-2">
                <input
                  required
                  name="todo"
                  type="text"
                  placeholder="Enter your task..."
                  value={todo}
                  onChange={(e) => setTodo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 mb-4"
                />

                <select
                  title="Select Category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium cursor-pointer outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {categoryState.map((cat, index) => (
                    <option
                      className="text-gray-700  text-[13px]"
                      key={index}
                      value={cat.id}
                    >
                      THIS {cat.category.toUpperCase()}
                    </option>
                  ))}
                </select>
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
                  onClick={() => setShowTaskModal(false)}
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
