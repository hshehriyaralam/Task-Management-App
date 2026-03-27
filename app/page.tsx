"use client"
import { useState } from "react";
import { CircleX } from 'lucide-react';
import Card from "@/component/card";



type TodosTypes = {
  id: number,
  text: string,
  category: string
}




export default function Home() {
  const [todo, setTodo] = useState('')
  const [category, setCategory] = useState<string>("today")
  const [categories, setCategories] = useState(['today', 'week', 'month'])
  const [todos, setTodos] = useState<TodosTypes[]>([])


  // for edit todo States 
  const [isOpen, setIsOpen] = useState(false)
  const [editTodoId, setEditTodoId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')


  // for add more categories 
  const [newCategory, setNewCategory] = useState('')


  


  // Add Todo
  const handleAdd = (e: any) => {
    e.preventDefault()
    if (!todo) return

    const newTodo = {
      id: Date.now(),
      text: todo,
      category: category
    }

    setTodos([...todos, newTodo])
    setTodo("")
  }


  // Delete Todo
  const handleDelete = (id: number) => {
    const updateTodo = todos.filter((t) => t.id != id)
    setTodos(updateTodo)
  }


  // handleEdit
  const handleEdit = (todo: any) => {
    setIsOpen(true)
    setEditTodoId(todo.id)
    setEditText(todo.text)
  }

 
  
  const handleUpdate = (e:any) => {
    e.preventDefault()
    const updateTodo = todos.map( todo => 
    {
      if( editTodoId === todo.id){
        return{
          ...todo,
          text  : editText,
         }
      }
      return todo
    })
    setTodos(updateTodo)
    setIsOpen(false)
  }




// Add More Category 
const handleAddCategories = (e:any) => {
  e.preventDefault()

  if(!newCategory.trim()) return

  // avoid duplicate 
  if(categories.includes(newCategory.toLowerCase())){
    alert("categories already exist")
    return
  }

  setCategories([...categories, newCategory.toLowerCase()])
  setNewCategory('')
}







  return (
    <div className="min-h-screen bg-mist-300 p-6 font-quicksand " >
      <div className="max-w-5xl mx-auto" >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700  ">Todo Application</h1>

        <form
          onSubmit={handleAdd}
          className="bg-gray-100 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 mb-6  ">
          <input
            type="text"
            placeholder="Enter your task..."
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-gray-200 outline-none text-gray-800 " />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 rounded-xl bg-gray-200 font-quicksand font-medium  cursor-pointer text-sm  ">
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                THIS {cat.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-teal-300  cursor-pointer  hover:bg-teal-400  text-gray-700 px-5 py-3 rounded-xl font-semibold">
            Add
          </button>

        </form>


      {/* Add extra Category */}

        <form
        onSubmit={handleAddCategories}
          className="bg-gray-100 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 mb-6  ">
          <input
            type="text"
            placeholder="Enter New Category "
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-gray-200 outline-none text-gray-800 " />

          <button
            type="submit"
            className="bg-indigo-300  cursor-pointer  hover:bg-indigo-400  text-gray-700 px-5 py-3 rounded-xl font-semibold">
            Add
          </button>

        </form>

        {/* cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" >
          {categories.map(cat => (
            <div  key={cat} className="min-w-[300px] snap-start">
            <Card
            key={cat}
            heading={cat}
             todo={todos.filter((todo => todo.category === cat))}
             handleDelete={handleDelete}
             handleEdit={handleEdit}/>
              </div>

          ))}
        </div>
      </div>





      {/* ShowPopUp */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"  
        onClick={() => setIsOpen(false)}
        >
          <div
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-100 rounded-lg p-3 w-[400px] ">

            <CircleX 
            onClick={() => setIsOpen(false)}
            className="w-6 cursor-pointer text-red-500  justify-self-end "/>

            <h2 className="font-bold text-gray-800 mb-3 text-center text-xl">Edit Todo </h2>
            <form  onSubmit={handleUpdate}>
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
  );
}
