'use client'
import { useState } from "react"
import { addTodo } from "@/app/(action)/action"




export default  function AddTodo({categories}:any){

      const [todo, setTodo] = useState('')
      const [category, setCategory] = useState<string>("")
    //   const [categories, setCategories] = useState(['today', 'week', 'month'])
    //   const [todos, setTodos] = useState<TodosTypes[]>([])


    return(
        <div  >
        <form
        action={addTodo}
          className="bg-gray-100 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 mb-6 
           w-[800px] 
          mx-auto">
          <input
          required
            type="text"
            placeholder="Enter your task..."
            name="todo"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-gray-200 outline-none text-gray-800 " />

          <select
            value={category}
            name="category"
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 rounded-xl bg-gray-200 font-quicksand font-medium  cursor-pointer text-xs    ">
            {categories.map((cat, index )  => (
              <option key={index} value={cat.category}>
                THIS {cat.category.toUpperCase()}
              </option>
            ))}
          </select>


          <button
            type="submit"
            className="bg-primary  cursor-pointer  hover:bg-primary/90  text-white px-3 py-2 
            rounded-xl font-medium   text-md  ">
            Add Todo
          </button>
        </form>


    

        </div>
    )
}