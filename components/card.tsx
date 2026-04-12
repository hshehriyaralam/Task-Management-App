"use client";
import TodoItem from "./todoItem";
import { deleteCategory } from "@/app/(action)/action";
import {  SortableContext,verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";


export default function Card({
  todo,
  cat,
  index,
  categories,
  handleDelete,
  handleEdit,
  setShowTaskModal,
}: any) {

//   const {
//   setNodeRef
// } = useSortable({
//   id: cat.id
// });


  const {
    setNodeRef: setSortableRef,
    attributes: cardAttributes,
    listeners: cardListeners,
    transform,
    transition,
    isDragging: isCardDragging,
  } = useSortable({ id: `cat-${cat.id}` })


  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCardDragging ? 0.4 : 1,
  };

    const { setNodeRef: setDropRef } = useDroppable({ id: cat.id });


  const handleDeleteCategory = async () => {
    if (categories.length === 1) {
      toast.error("Last was not delete", { position: "top-center" });
      return;
    }
    await deleteCategory(cat.id);
    toast.success("Card Successfully Deleted", { position: "top-center" });
  };


  return (
    <div  ref={setSortableRef}  style={cardStyle}>
      {/* <div className={`transition-all duration-200  cursor-grab`}> */}
        <div className="w-[350px]  b rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* Card Header */}
          <div 
          {...cardAttributes}
          {...cardListeners}
          className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white cursor-grab ">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold  text-xl  text-gray-800">
                  {/* {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} */}
                  {cat.title.toUpperCase()}
                </h2>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div
          ref={setDropRef}
          className="h-[380px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {todo.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-sm">No tasks yet</div>
                </div>
              ) : (
                <SortableContext
              items={todo.map((todo : any) => todo.id)}
              strategy={verticalListSortingStrategy}
                >
                <div>
                  {todo.map((t: any,) => (
                    <div key={`todo-${t.id}`}>
                      <TodoItem
                        todo={t}
                        handleDelete={handleDelete}
                        handleEdit={handleEdit}
                      />
                    </div>
                  ))}
                </div>
                </SortableContext>
              )}
            </div>

            <div className="p-1 flex items-center justify-start mx-3 my-1">
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-2 py-1.5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/70 flex items-center gap-2 justify-center text-sm  cursor-pointer "
              >
                <Plus className="w-3 h-3" />
                Add Task
              </button>
            </div>

            {/* Card Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              {categories.length > 3 && index > 2 && (
                <button
                  onClick={handleDeleteCategory}
                  className="bg-red-500 w-full py-1.5 rounded-xl text-white font-semibold cursor-pointer"
                >
                  Delete Card
                </button>
              )}
            </div>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}
