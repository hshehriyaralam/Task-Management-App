  "use client"
  import { useState, useEffect } from "react";
  import { CircleX, LayoutGrid, Plus } from 'lucide-react';
  import Card from "@/component/card";
  import type { TodosCategoriesTypes } from "@/type/todo"
  import { DndContext,useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
  import {  SortableContext,  horizontalListSortingStrategy,} from "@dnd-kit/sortable"
  import dynamic from "next/dynamic"
  import { addCategory, addTodo, deleteTodo, updateTodo } from "@/app/(action)/action"
  import { createClient } from "@/app/lib/supabase/client";





  const SortableCard = dynamic(() => import("@/component/sortableCard"), {
    ssr: false
  })





  export default function TodoHome({todos , categories}: TodosCategoriesTypes) {
    const [todo, setTodo] = useState('')
    const [category, setCategory] = useState<string>("")


    // for edit todo States 
    const [isOpen, setIsOpen] = useState(false)
    const [editTodoId, setEditTodoId] = useState<number | null>(null)
    const [editText, setEditText] = useState('')


    // for add more categories 
    const [newCategory, setNewCategory] = useState('')

    // show add Category modal 
    const [showModal, setShowModal] = useState(false)

    // latest State
    const [todoState, setTodoState] = useState(todos)
    const [categoryState, setCategoryState] = useState(categories)



  // Add Todo 
  const handleAddTodo = async (e:any) =>{
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      await addTodo(formData)
      setTodo("")       
      setCategory("")   
  }


  // Add  category 
  const handleAddCategory = async (e:any)  => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addCategory(formData)
    setShowModal(false)
    setNewCategory("")
}




  // Delete Todo 
    const handleDelete = async (id:number) => {
          try{
              await  deleteTodo(id)
          }catch(error){
              alert("Failed to delete todo.");
          }
      }


      // show Edit Modal
    const handleEdit = (todo: any) => {
      setIsOpen(true)
      setEditTodoId(todo.id)
      setEditText(todo.task)
      setTodo("")
    }


    // Update Todo 
      const handleUpdate = async (e:any) => {
        e.preventDefault()
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




  // Todo & Category Drag & Drop
  
  //   const handleDragEnd = (event: any) => {
  //   const { active, over } = event

  //   if (!over) return
  //   if (categories.includes(active.id)) {
  //     const oldIndex = categories.indexOf(active.id)
  //     const newIndex = categories.indexOf(over.id)

  //     setCategoryState(prev => {
  //       const updated = [...prev]
  //       const [moved] = updated.splice(oldIndex, 1)
  //       updated.splice(newIndex, 0, moved)
  //       return updated
  //     })
  //     return
  //   }

  //   setTodoState(prev =>
  //     prev.map(t =>
  //       t.id === active.id
  //         ? { ...t, category_id: over.id }
  //         : t
  //     )
  //   )
  // }


  const handleDragEnd = async (event:any) => {
    const {active, over} = event
    if(!over) return

    const supabase = await createClient()


    const activeId = active.id
    const overId = over.id

    const dragged = todoState.find(t => t.id === activeId)
    if ( !dragged) return 

    // for move to another category 
    const newCategoryId = over.data.current?.categoryId || dragged.category_id

    if (newCategoryId && dragged.category_id !== newCategoryId) {

  // UI update
  setTodoState(prev =>
    prev.map(t =>
      t.id === activeId
        ? { ...t, category_id: newCategoryId }
        : t
    )
  )

  // DB update
  await supabase
    .from('todos')
    .update({
      category_id: newCategoryId,
      position: 0   // optional: top pe bhej do
    })
    .eq('id', activeId)

  return
}

    // for todos reorder
    const sameTodos = todoState.filter(t => t.category_id === dragged.category_id)
    const oldIndex = sameTodos.findIndex(t => t.id === activeId)
    const newIndex = sameTodos.findIndex(t => t.id === overId)

    const reorder = [...sameTodos]
    const [moved] = reorder.splice(oldIndex ,1)
    reorder.splice(newIndex, 0, moved)

    const update = reorder.map((t:any, index:number) => ({
      ...t,
      position : index
    }) )

     setTodoState(prev =>
    prev.map(t =>
      t.category_id === dragged.category_id
        ? update.find(u => u.id === t.id) || t
        : t
    )
  )

    await supabase.from('todos').upsert(update)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    })
  )

  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
    .channel("todos-realtime")
    .on(
      'postgres_changes',
      {
        event : '*',
        schema: 'public',
        table: 'todos',
      },
      (payload) => {
        const {eventType , new: newRecord, old} = payload;

        if(eventType === "INSERT"){
          setTodoState(prev => [...prev, newRecord])
        }
         if (eventType === "UPDATE") {
          setTodoState(prev =>
            prev.map(t => (t.id === newRecord.id ? newRecord : t))
          )
        }

         if (eventType === "DELETE") {
          setTodoState(prev =>
            prev.filter(t => t.id !== old.id)
          )
        }
      }
    )
    .subscribe()

     return () => {
    supabase.removeChannel(channel)
  }
  }, [])


  useEffect(() => {
  const supabase = createClient()

  const channel = supabase
    .channel('categories-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
      },
      (payload) => {
        const { eventType, new: newRecord, old } = payload

        if (eventType === "INSERT") {
          setCategoryState(prev => [...prev, newRecord])
        }

        if (eventType === "UPDATE") {
          setCategoryState(prev =>
            prev.map(c => (c.id === newRecord.id ? newRecord : c))
          )
        }

        if (eventType === "DELETE") {
          setCategoryState(prev =>
            prev.filter(c => c.id !== old.id)
          )
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])



    return (
      <div >
        <div>
          <form  onSubmit={handleAddTodo}
            className="mb-8  ">
              <div  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex  flex-col md:flex-row gap-4">
            <input
            required
            name="todo"
              type="text"
              placeholder="Enter your task..."
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2  focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400 " />

            <select
            title="Select Category"
            name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
               className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium cursor-pointer outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
              {categoryState.map((cat, index ) => (
                <option   className="text-gray-700"
                 key={index} value={cat.id}>
                  THIS {cat.category.toUpperCase()}
                </option>
              ))}
            </select>


            <button
              type="submit"
               className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 justify-center  cursor-pointer ">
              <Plus className="w-4 h-4" />
              Add Task
            </button>

            <button
            type="button"
              onClick={() => {
                setShowModal(true)
                setTodo("")
              }}
              className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 justify-center  cursor-pointer  hover:bg-primary/10 ">
              <LayoutGrid className="w-4 h-4" />
              New Board

            </button>
              </div>
          </form>



          {/* cards */}
          <div  className="pb-4">  
          <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}>
            <SortableContext
  items={categoryState.map(c => c.id)} 
  strategy={horizontalListSortingStrategy}
>
  <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
    {categoryState.map(cat => (
      <SortableCard key={cat.id} cat={cat}>
        <Card
          cat={cat}
          todo={todoState
            .filter(t => t.category_id === cat.id)
            .sort((a, b) => a.position - b.position)}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
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
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create New Board</h2>
              <CircleX onClick={() => setShowModal(false)} className="w-5 h-5 cursor-pointer text-red-500 transition-colors" />
            </div>
            <form onSubmit={handleAddCategory}>
              <input
                required
                name="category"
                type="text"
                placeholder="Enter board name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 mb-4"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200  cursor-pointer ">
                  Create Board
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer ">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        )}


        {/* Show Edit Todo PopUp */}
        {isOpen && (
           <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
              <CircleX onClick={() => setIsOpen(false)} className="w-5 h-5 cursor-pointer text-red-500 transition-colors" />
            </div>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                placeholder="Update your task..."
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 mb-4"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200  cursor-pointer">
                  Update Task
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200  cursor-pointer ">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    )
  }

