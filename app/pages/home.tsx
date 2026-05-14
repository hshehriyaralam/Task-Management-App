"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AddTodo, UpdateTodo } from "@/hooks/todo";
import { AddNewCategory } from "@/hooks/category";
import type { Container } from "@/type/todo";
import { createClient } from "@/app/lib/supabase/client"
import { UniqueIdentifier } from "@dnd-kit/core";
import Todoform from "@/components/form";
import AddCategoryModal from "@/components/addCategoryModal";
import EditTodoPopUp from "@/components/editTodoPopUp";
import AddTodoModal from "@/components/addTodoModal";
import DndComp from "@/components/layout/dndComp";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function TodoHome({
  todos,
  categories,
  accessToken,
  isViewer,
  boardId,
}: any) {
  const [todo, setTodo] = useState("");
  const [category, setCategory] = useState<string>("");
  const [modalTodo, setModalTodo] = useState("");
  const [modalCategory, setModalCategory] = useState<number | null>(null);
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
    setContainers((prev) => {
      const next = updater(prev);
      latestContainersRef.current = next;
      return next;
    });
  };

  const categoryIds = useMemo(
    () => containers.map((c) => `cat-${c.id}`),
    [containers],
  );

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

  // Todo CRUD
  const handleAddTodo = useCallback(async (e: any) => {
    await AddTodo({ e, setLoading, updateContainers, setShowTaskModal });
    // reset inputs
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
    [editTodoId, editText],
  );

  // Category CRUD
  const handleAddCategory = useCallback(async (e: any) => {
    setLoading(true);
    await AddNewCategory({ e, updateContainers });
    setNewCategory("");
    setLoading(false);
    setShowModal(false);
  }, []);

  // show Edit Modal
  const handleEdit = useCallback((todo: any) => {
    setIsOpen(true);
    setEditTodoId(todo.id);
    setEditText(todo.task);
    setTodo("");
  }, []);

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
          const latestCategories = latestCategoriesRef.current;
          setContainers(buildContainers(latestCategories, updatedTodos));
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
              c.id === newRecord.id ? newRecord : c,
            );
          }

          if (eventType === "DELETE") {
            updatedCategories = updatedCategories.filter(
              (c) => c.id !== old.id,
            );
          }

          latestCategoriesRef.current = updatedCategories;
          setContainers(
            buildContainers(updatedCategories, latestTodosRef.current),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoryChannel);
    };
  }, []);

  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);

  // useEffect(() => {
  //   if (!accessToken) {
  //     router.push("/login");
  //   }
  // }, [accessToken, router]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        <DndComp
          isViewer={isViewer}
          setActiveId={setActiveId}
          isDraggingRef={isDraggingRef}
          isSyncingRef={isSyncingRef}
          latestContainersRef={latestContainersRef}
          updateQueueRef={updateQueueRef}
          batchTimerRef={batchTimerRef}
          isCategoryDrag={isCategoryDrag}
          findContainerId={findContainerId}
          setContainers={setContainers}
          containers={containers}
          updateContainers={updateContainers}
          categories={categories}
          handleEdit={handleEdit}
          activeId={activeId}
          categoryIds={categoryIds}
          TaskModalOpen={TaskModalOpen}
        />
      </div>

      {/* Modals */}
      {showModal && (
        // <AddCategoryModal
        //   handleCancelModal={handleCancelModal}
        //   handleAddCategory={handleAddCategory}
        //   newCategory={newCategory}
        //   setNewCategory={setNewCategory}
        //   loading={loading}
        // />
          <section
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
                data-testid="new-category"
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
                data-testid="add-btn"
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
        </section>
      )}

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
