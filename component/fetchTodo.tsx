'use client'

import { CircleX, Pencil, Trash } from "lucide-react"
import { deleteTodo, updateTodo } from '@/app/(action)/action'
import { useState } from "react"





export default function FetchTodo({todos}:any){
    // for edit todo States 
     const [isOpen, setIsOpen] = useState(false)
     const [editTodoId, setEditTodoId] = useState<number | null>(null)
     const [editText, setEditText] = useState('')
   
   

    const handleEdit = (todo:any) => {
    setIsOpen(true)
    setEditTodoId(todo.id)
    setEditText(todo.task)
  }

const handleUpdate = async () => {
  try {
    if (!editTodoId) return

    
    await updateTodo(editTodoId, {
      task: editText
    })

    setIsOpen(false)

  } catch (error) {
    alert("Failed to Update Todo")
  }
}
 


    const handleDelte = async (id:number) => {
        try{
            await  deleteTodo(id)
        }catch(error){
             alert("Failed to delete todo.");
        }
    }
    return(
            <div  className='flex items-center justify-center  gap-2'>
  {todos?.map((todo:any)  => (
    <div  key={todo.id}  className='border w-80 h-40  p-6'>
      <p>Todo : {todo.task}</p>
      <p>Todo Category : {todo.category}</p>
      <p>{todo.is_complete ? <span>True</span>  : <span>false</span>}</p>

          <div className="flex items-center gap-2">
            <p>todo id {todo.id}</p>
                  <Pencil
                  onClick={() => handleEdit(todo)}
                  className="w-5 text-violet-600  cursor-pointer" />
                 <button
                 onClick={ () => handleDelte(todo.id)}
          title='Delete Category'
            className="text-sm bg-red-500 px-3 py-1.5 text-white rounded-xl cursor-pointer">
            Delete
          </button>
                   </div>
      </div>
  ))}


 {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-100 rounded-lg p-3 w-[400px] ">

            <CircleX
              onClick={() => setIsOpen(false)}
              className="w-6 cursor-pointer text-red-500  justify-self-end " />

            <h2 className="font-bold text-gray-800 mb-3 text-center text-xl">Edit Todo </h2>
            <form  action={handleUpdate}>
              <div className="flex items-center justify-center gap-2   mb-4 ">
                <input
                  type="text"
                  placeholder="Update your task "
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="px-6 py-2 rounded-xl bg-gray-200 outline-none text-gray-800 " />

              </div>

              {/* Button Update & Cancell */}
              <div className="flex items-center justify-center gap-2  mb-4">
                <button
                  type="submit"
                  className="bg-cyan-500   hover:bg-cyan-400   cursor-pointer text-white rounded-xl text-sm 
      px-5 py-1.5">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-500   hover:bg-gray-400   cursor-pointer text-white rounded-xl text-sm 
      px-5 py-1.5">
                  Cancell
                </button>
              </div>
            </form>


          </div>
        </div>
      )}
   
    </div>
    )
}