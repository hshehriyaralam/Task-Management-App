"use client"
import { Trash, Pencil } from 'lucide-react';


export default function Card({todo, handleDelete,handleEdit, heading}:any){


return(
     <div  className="bg-gray-100 p-3 rounded-2xl shadow-lg  min-h-40  ">
       <h2 className={`text-xl font-bold my-3  text-center text-emerald-500`}>{heading.toUpperCase()}</h2>
            {todo.length === 0 ? (
              <p className="text-gray-700 font-medium mx-4
               ">No tasks</p>
            ) : (
              todo.map((todo:any) => (
                <div
                  key={todo.id}
                  className="bg-gray-200 p-3 rounded-lg mb-2  text-gray-700 font-medium flex items-center justify-between "
                >
                  {todo.text}
                  <div className="flex items-center gap-2">
                  <Pencil className="w-5 text-violet-600  cursor-pointer" 
                  onClick={() => handleEdit(todo)} />
                  <Trash className="w-5 text-red-600  cursor-pointer"
                  onClick={() => handleDelete(todo.id)}
                  />
                    </div>
                </div>
              ))
            )}
        </div>
)
}