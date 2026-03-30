"use client"
import { useState } from "react";
import { CircleX } from 'lucide-react';
import Card from "@/component/card";
import type { TodosTypes } from "@/type/todo"
import { DndContext,useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import {  SortableContext,  horizontalListSortingStrategy,} from "@dnd-kit/sortable"
import dynamic from "next/dynamic"

const SortableCard = dynamic(() => import("@/component/sortableCard"), {
  ssr: false
})





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

  // show add Category modal 
  const [showModal, setShowModal] = useState(false)





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

  // Complete Todo
  const handleComplete = () => {
    
  }


  // handleEdit
  const handleEdit = (todo: any) => {
    setIsOpen(true)
    setEditTodoId(todo.id)
    setEditText(todo.text)
  }



  const handleUpdate = (e: any) => {
    e.preventDefault()
    const updateTodo = todos.map(todo => {
      if (editTodoId === todo.id) {
        return {
          ...todo,
          text: editText,
        }
      }
      return todo
    })
    setTodos(updateTodo)
    setIsOpen(false)
  }




  // Add More Category 
  const handleAddCategories = (e: any) => {
    e.preventDefault()

    if (!newCategory.trim()) return

    // avoid duplicate 
    if (categories.includes(newCategory.toLowerCase())) {
      alert("categories already exist")
      return
    }

    setCategories([...categories, newCategory.toLowerCase()])
    setShowModal(false)
    setNewCategory('')

  }


  // Delete Category 
  const DeleteCategory = (cat: any) => {
    if(categories.length === 1){
      alert("last card was not delete")
      return
    }

    // remove category 
    const updateCategories = categories.filter((c) => c !== cat)
    setCategories(updateCategories)


    // remove  todos 
    const updateTodos = todos.filter((t) => t.category !== cat)
    setTodos(updateTodos)


    if (category === cat) {
      setCategory(updateCategories[0] || "")
    }

  }


// Todo & Category Drag & Drop
  const handleDragEnd = (event: any) => {
  const { active, over } = event

  if (!over) return

  // 🟢 Case 1: Category drag (card reorder)
  if (categories.includes(active.id)) {
    const oldIndex = categories.indexOf(active.id)
    const newIndex = categories.indexOf(over.id)

    setCategories(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, moved)
      return updated
    })
    return
  }

  // 🔵 Case 2: Todo drag (move between cards)
  setTodos(prev =>
    prev.map(t =>
      t.id === active.id
        ? { ...t, category: over.id }
        : t
    )
  )
}

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, 
    },
  })
)



  return (
    <div className="min-h-screen bg-mist-300 p-6 font-quicksand " >
      <div className="max-w-5xl mx-auto" >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700  ">Task Management Application</h1>

        <form
          onSubmit={handleAdd}
          className="bg-gray-100 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 mb-6  ">
          <input
          required
            type="text"
            placeholder="Enter your task..."
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-gray-200 outline-none text-gray-800 " />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 rounded-xl bg-gray-200 font-quicksand font-medium  cursor-pointer text-xs    ">
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                THIS {cat.toUpperCase()}
              </option>
            ))}
          </select>


          <button
            type="submit"
            className="bg-primary  cursor-pointer  hover:bg-primary/80  text-white px-3 py-2 
            rounded-xl font-medium   text-md  flex  items-center justify-between gap-1 ">
            add Todo
          </button>

          <button
          type="button"
            onClick={() => setShowModal(true)}
            className="bg-primary  cursor-pointer  hover:bg-primary/90 
             text-white px-3 py-2 text-md  rounded-xl font-medium ">
            add Card
          </button>
        </form>



        {/* cards */}
        <div  className="overflow-x-auto pb-4 ">  
        <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}>
          <SortableContext
            items={categories}
            strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 min-w-max overflow-x-auto  items-center justify-start gap-8 ">
              {categories.map(cat => (
                <SortableCard key={cat} cat={cat}>
                  <Card
                    cat={cat}
                    todo={todos.filter(t => t.category === cat)}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    DeleteCategory={DeleteCategory}
                  />
                </SortableCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        </div>

      </div>










      {/* Modals */}

      {/* show Add Category Modal  */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setShowModal(false)}>

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-100 rounded-lg p-3 w-[400px] ">

            <CircleX
              onClick={() => setShowModal(false)}
              className="w-6 cursor-pointer text-red-500  justify-self-end " />

            <h2 className="font-bold text-gray-800 mb-3 text-center text-xl">Add More Category</h2>

            <form onSubmit={handleAddCategories}>
              <div className="flex items-center justify-center gap-2   mb-4 ">
                <input
                  required
                  type="text"
                  placeholder="Enter New Category "
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-6 py-2 rounded-xl bg-gray-200 outline-none text-gray-800 " />
              </div>

              {/* Button Update & Cancell */}
              <div className="flex items-center justify-center gap-2  mb-4">
                <button
                  type="submit"
                  className="bg-primary   hover:bg-primary/90   cursor-pointer text-white rounded-xl text-sm 
            px-5 py-1.5">
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500   hover:bg-gray-400   cursor-pointer text-white rounded-xl text-sm 
            px-5 py-1.5">
                  Cancel
                </button>
              </div>
            </form>


          </div>
        </div>

      )}


      {/* Show Edit Todo PopUp */}
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
            <form onSubmit={handleUpdate}>
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

