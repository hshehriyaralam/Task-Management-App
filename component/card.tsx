"use client"
import { useDroppable } from '@dnd-kit/core';
import TodoItem from './todoItem';



export default function Card({ todo, cat, handleDelete, handleEdit, DeleteCategory }: any) {
  const { setNodeRef } = useDroppable({ id: cat })

  return (
    <div ref={setNodeRef}>
      <div className="bg-gray-100 p-3 rounded-2xl shadow-lg h-[300px] flex flex-col">
        <h2 className="text-xl font-bold my-3 text-center text-emerald-500">
          {cat.toUpperCase()}
        </h2>


        <div className="flex-1 overflow-y-auto">
          {todo.length === 0 ? (
            <p className="text-gray-700 font-medium mx-4">No tasks</p>
          ) : (
            todo.map((todo: any) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
              />
            ))
          )}
        </div>

        <div className="flex justify-end ">
          <button
            onClick={(e) => {
              e.stopPropagation()
              DeleteCategory(cat)
            }}
            className="text-sm bg-red-500 px-3 py-1.5 text-white rounded-xl cursor-pointer">
            Delete
          </button>
        </div>

      </div>

    </div>
  )
}