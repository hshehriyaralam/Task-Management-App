"use client"
import { useDroppable } from '@dnd-kit/core';
import TodoItem from './todoItem';
import { deleteCategory } from '@/app/(action)/action';
import { useEffect, useState } from 'react';


export default function Card({ todo, cat, categories, handleDelete, handleEdit }: any) {
  const { setNodeRef, isOver } = useDroppable({ id: cat.id })
  const [errorMsg, setErrorMsg] = useState('')

 const handleDeleteCategory = async () => {
  if(categories.length === 1) {
    setErrorMsg("Last category cannot be deleted")
    return
  }
  await deleteCategory(cat.id)
}

useEffect(() => {
  if (!errorMsg) return

  const timer = setTimeout(() => {
    setErrorMsg("")
  }, 2000)

  return () => clearTimeout(timer)
}, [errorMsg])

  return (
    <div ref={setNodeRef} className={`transition-all duration-200 ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-xl' : ''}`}>
      <div className="w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold  text-xl  text-gray-800">
                {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
              </h2>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="h-[380px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {todo.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-sm">No tasks yet</div>
              </div>
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

          {/* Card Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleDeleteCategory}
            title='Delete Card'
            className='bg-red-500 w-full py-1.5 rounded-xl text-white cursor-pointer  font-semibold  '
            >
              Delete Card
            </button>
          </div>
        </div>
      </div>


      {errorMsg && (
  <div className="fixed top-50 right-150 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
    {errorMsg}
  </div>
)}
    </div>
  )
}