"use client"
import { DndContext, useDroppable } from '@dnd-kit/core';
import TodoItem from './todoItem';
import { deleteCategory } from '@/app/(action)/action';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';


export default function Card({ 
  todo, cat, categories, handleDelete, handleEdit,setShowTaskModal, activeTodo, dropPreview}: any) {
  const { setNodeRef,  } = useDroppable({ id: cat.id, data: { type: "category", category: cat }  })
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
    <div ref={setNodeRef} className={`transition-all duration-200  cursor-grab`}>
      <div className="w-[350px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        
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
              
           
          
              <SortableContext
                items={todo.map((t:any) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* {
                todo.map((todo:any, index : number )=> (
                  <div key={todo.id} >
                    {(dropPreview?.categoryId === cat.id  && dropPreview?.index === index) && (
                      <div className='w-80 h-10 border border-blue-500 '>
                        </div>
                    ) }
                
                  <TodoItem
                  todo={todo}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                  activeTodo={activeTodo}/>


                   {dropPreview?.categoryId === cat.id &&
                dropPreview.index === todo.length && (
                  <div className="h-10 border-2 border-blue-400 rounded-md
                   bg-blue-50 mt-2 transition-all duration-200" />
                )}


                  </div>               
                ))
                
              }  */}

              {todo.map((t:any , index:number) => (
                  <div key={t.id}>
                    {dropPreview?.categoryId === cat.id &&
                    dropPreview?.index === index && (
                      <div className="h-10 border-2 border-blue-400 bg-blue-50 rounded-md transition-all" />
                    )}
                  <TodoItem
                  todo={t}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                  activeTodo={activeTodo}/>

                  </div>
                ))}

               
                {dropPreview?.categoryId === cat.id &&
                dropPreview?.index === todo.length && (
                  <div className="h-10 border-2 border-blue-400 bg-blue-50 rounded-md mt-2 transition-all" />
                )}
             
              </SortableContext>
          
            )}
          </div>

          <div className='p-1 flex items-center justify-start mx-3 my-1'>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-2 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 justify-center text-sm  cursor-pointer "
            >
              <Plus className="w-3 h-3" />
              Add Task
            </button>
          </div>

          {/* Card Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            {/* {categories.length > 3 && index > 2 && (
              <button onClick={handleDeleteCategory} className='bg-red-500 w-full py-1.5 rounded-xl text-white font-semibold cursor-pointer'>
                Delete Card
              </button>
            )} */}
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