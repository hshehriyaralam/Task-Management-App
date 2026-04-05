"use client"
import completeTodo from "@/app/(action)/action";
import { useDraggable } from "@dnd-kit/core"
import { Trash2, Pencil, GripVertical } from 'lucide-react';
import { useState } from "react";

export default function TodoItem({ todo, handleDelete, handleEdit }: any) {
  const [isHovered, setIsHovered] = useState(false)

  const handleCompleteTodo = async (id: number) => {
    try {
      if (!id) return
      await completeTodo(id, {
        is_complete: !todo.is_complete
      })
    } catch (error) {
      alert("Todo not complete ")
    }
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined

  return (
    <div
    {...listeners} {...attributes}
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-lg border border-gray-100 p-2
        flex items-center justify-between group transition-all duration-200 
        `}
    >
      {/* <div      className="mx-2  cursor-grab"  >
        <GripVertical  className="w-5 h-5 text-blue-900" />
      </div> */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          title={`${todo.is_complete ? "Mark incomplete" : "Mark complete"}`}
          onChange={() => handleCompleteTodo(todo.id)}
          type="checkbox"
          checked={todo.is_complete || false}
          className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-200 cursor-pointer"
        />
        <span className={`text-sm text-gray-700 truncate transition-all duration-200 
        text-lg font-semibold
          ${todo.is_complete ? 'line-through text-blue-400' : ''}`}>
          {todo.task}
        </span>
      </div>

      <div className={`flex items-center gap-1 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => handleEdit(todo)}
          className="p-2   rounded-md bg-blue-100 transition-all duration-200  cursor-pointer"
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
  )
}