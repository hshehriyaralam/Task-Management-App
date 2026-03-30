"use client"
import { useDraggable } from "@dnd-kit/core"
import { Trash, Pencil } from 'lucide-react';


export default function TodoItem ({todo, handleDelete, handleEdit}:any){
        const {attributes, listeners,setNodeRef,transform} = useDraggable({
            id:  todo.id
        })

            const style = transform ? {
        transform : `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined
    return(
        <div ref={setNodeRef} style={style}  {...listeners} {...attributes}
         className="bg-gray-200 p-3  rounded-lg mb-2 flex justify-between ">
            {/* cursor-grab active:cursor-grabbing */}
            <div  className="flex  items-center justify-center gap-2 ">
          <input 
  type="radio" 
  className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:bg-teal-400 checked:border-white cursor-pointer"/>

            <span>{todo.text}</span>
            </div>

        <div className="flex items-center gap-2">
                  <Pencil className="w-5 text-violet-600  cursor-pointer" 
                onClick={() => handleEdit(todo)} />
                <Trash className="w-5 text-red-500  cursor-pointer"
                 onClick={() => handleDelete(todo.id)}/>
                   </div>


        </div>
    )
}