"use client";
import completeTodo from "@/app/(action)/action";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities'


import { Trash2, Pencil } from "lucide-react";

export default function TodoItem({ todo, handleDelete, handleEdit }: any) {

    const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    // isDragging
  } = useSortable({id : todo.id})

   const style = {transform   : CSS.Transform.toString(transform), transition}
  const handleCompleteTodo = async (id: number) => {
    try {
      if (!id) return;
      await completeTodo(id, {
        is_complete: !todo.is_complete,
      });
    } catch (error) {
      alert("Todo not complete ");
    }
  };

  return (
    <div
    ref={setNodeRef}
         style={style}
      {...attributes}
      {...listeners}
    >
      <div
        className={`bg-white rounded-lg border border-gray-100 p-2 my-2
            flex items-center justify-between group transition-all duration-200 cursor-grab
          `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 ">
          <input
            title={`${todo.is_complete ? "Mark incomplete" : "Mark complete"}`}
            onChange={() => handleCompleteTodo(todo.id)}
            type="checkbox"
            checked={todo.is_complete || false}
            className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-200 cursor-pointer"
          />
          <span
            className={`text-sm text-gray-700 truncate transition-all duration-200 
        text-lg font-semibold
          ${todo.is_complete ? "line-through text-blue-400" : ""}`}
          >
            {todo.task}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 transition-all duration-200
         `}
        >
          <button
            onClick={() => handleEdit(todo)}
            className={`p-2   rounded-md bg-blue-100 transition-all duration-200  cursor-pointer  
             ${todo.is_complete ? "opacity-0" : "opacity-100"}`}
            title="Edit task"
          >
            <Pencil className="w-4 h-4 text-blue-600  hover:text-blue-500" />
          </button>
          <button
            onClick={() => handleDelete(todo.id)}
            className="p-2 rounded-md bg-red-100 transition-all duration-200 cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4 text-red-600  hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
