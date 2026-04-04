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
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...listeners} {...attributes} 
      className={`bg-white rounded-lg border border-gray-100 p-2.5 flex items-center justify-between group transition-all duration-200 ${isDragging ? 'shadow-lg cursor-grabbing' : 'hover:shadow-sm cursor-grab'} `}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          title={`${todo.is_complete ? "Mark incomplete" : "Mark complete"}`}
          onChange={() => handleCompleteTodo(todo.id)}
          type="checkbox"
          checked={todo.is_complete || false}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-200 cursor-pointer"
        />
        <span className={`text-sm text-gray-700 truncate transition-all duration-200 ${todo.is_complete ? 'line-through text-gray-400' : ''}`}>
          {todo.task}
        </span>
      </div>

      <div className={`flex items-center gap-1 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => handleEdit(todo)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-all duration-200"
          title="Edit task"
        >
          <Pencil className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" />
        </button>
        <button
          onClick={() => handleDelete(todo.id)}
          className="p-1.5 rounded-md hover:bg-red-50 transition-all duration-200"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
        </button>
      </div>
    </div>
  )
}