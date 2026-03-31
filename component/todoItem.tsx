"use client"
import { useDraggable } from "@dnd-kit/core"
import { Trash, Pencil } from 'lucide-react';
import { useState } from "react";


export default function TodoItem ({   todo, handleDelete, handleEdit,handleCompleteTodo}:any){
    const [showRadio, setShowRadio] = useState(false)
    const [value, setValue] = useState('')
    
      

const handleOptionChange = (event:any) => {
    setValue(event.target.value);
    handleCompleteTodo(todo.id)

  };






// Drag and drop attribute
      const {attributes, listeners,setNodeRef,transform} = useDraggable({
            id:  todo.id
        })

            const style = transform ? {
        transform : `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return(
        <div ref={setNodeRef} style={style}  {...listeners} {...attributes}
         className="bg-gray-200 p-3  rounded-lg mb-2 flex justify-between  relative group ">
            {/* cursor-grab active:cursor-grabbing */}
            <div  className="flex  items-center justify-center gap-2     ">
          <input 
          title={`${todo.isComplete  ? "Mark incomplete" :  "Mark complete"}`}
          value={value}
          onChange={handleOptionChange}
            type="checkbox"
            className={`appearance-none w-4 h-4 border-2 rounded-full cursor-pointer
                ${todo.isComplete ?  "translate-x-0  bg-emerald-500 border-white " : " border-gray-400  opacity-0  -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out  "}`} />
            <span>{todo.text}</span>
            </div>

        <div className="flex items-center gap-2">
                  <Pencil
                  className="w-5 text-violet-600  cursor-pointer" 
                onClick={() => handleEdit(todo)} />
                <Trash className="w-5 text-red-500  cursor-pointer"
                 onClick={() => handleDelete(todo.id)}/>
                   </div>


        </div>
    )
}