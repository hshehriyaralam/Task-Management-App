"use client"
import { useDroppable } from '@dnd-kit/core';

import TodoItem from './todoItem';



export default function Card({todo,  cat, handleDelete,handleEdit,DeleteCategory,}:any){

  const   {setNodeRef} = useDroppable({ id : cat})
return(
  <div ref={setNodeRef}>
     <div  className="bg-gray-100 p-3 rounded-2xl shadow-lg  h-[230px]  flex flex-col ">
       <h2 className={`text-xl font-bold my-3  text-center text-emerald-500`}>{cat.toUpperCase()}</h2>
       <div   >
        {/* className='overflow-y-auto' */}
            {todo.length === 0 ? (
              <p className="text-gray-700 font-medium mx-4
               ">No tasks</p>
            ) : (
              todo.map((todo:any) => (

                <TodoItem 
                key={todo.id}
                todo={todo}
                handleDelete={handleDelete} 
                handleEdit={handleEdit}/>


                // <div
                //   key={todo.id}
                //   className="bg-gray-200 p-3 rounded-lg mb-2  text-gray-700 font-medium 
                //   flex items-center justify-between  "
                // >
                //   {todo.text}
                //   <div className="flex items-center gap-2">
                //   <Pencil className="w-5 text-primary  cursor-pointer" 
                //   onClick={() => handleEdit(todo)} />
                //   <Trash className="w-5 text-red-500  cursor-pointer"
                //   onClick={() => handleDelete(todo.id)}
                //   />
                //     </div>
                // </div>
              ))
            )}
       </div>


            <div className='flex items-center justify-end  p-2'>
               <button 
               onClick={ () => DeleteCategory(cat)}
               className='text-xs bg-red-500 px-2 py-1  text-white rounded-xl 
                cursor-pointer'>
                Delete
               </button>
            </div>
        </div>
  </div>

)
}