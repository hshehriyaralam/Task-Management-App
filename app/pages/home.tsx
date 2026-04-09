
"use client"
import { useState, useEffect } from "react";
import { CircleX,  LayoutGrid, Plus } from 'lucide-react';
import Card from "@/components/card";
import type { TodosCategoriesTypes } from "@/type/todo"
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, } from "@dnd-kit/sortable"
import dynamic from "next/dynamic"
import { addCategory, addTodo, deleteTodo, updateTodo } from "@/app/(action)/action"
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";










const SortableCard = dynamic(() => import("@/components/sortableCard"), {
  ssr: false
})







export default function TodoHome({ todos, categories, accessToken,  }: TodosCategoriesTypes) {
  const [todo, setTodo] = useState('')
  const [category, setCategory] = useState<string>("")
  const router = useRouter()


  // for edit todo States 
  const [isOpen, setIsOpen] = useState(false)
  const [editTodoId, setEditTodoId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')


  // for add more categories 
  const [newCategory, setNewCategory] = useState('')

  // show add Category modal 
  const [showModal, setShowModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)


  // latest State
  const [todoState, setTodoState] = useState(todos)
  const [categoryState, setCategoryState] = useState(categories)


  const [activeTodo, setActiveTodo] = useState<any | null>(null)
  const [dropTodo, setDropTodo] = useState<any | null>(null)
  
  
  
  
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  
  
  const [dropPreview, setDropPreview] = useState<{
    categoryId: number
    index: number
  } | null>(null)
  
  const [activeCard, setActiveCard] = useState<any | null>(null)
  const [cardDropPreview, setCardDropPreview] = useState<number | null>(null)










  // Add Todo 
  const handleAddTodo = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await addTodo(formData)
    setTodo("")
    setCategory("")
    setShowTaskModal(false)
    setLoading(false)
    toast.success("Todo Successfully Added",{ position: "top-center" })
  }


  // Add  category 
  const handleAddCategory = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await addCategory(formData)
    setLoading(false)
    setShowModal(false)
    setNewCategory("")
    toast.success("New Card Successfully Added",{ position: "top-center" })
  }




  // Delete Todo 
  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id)
    toast.success("Todo Successfully Deleted",{ position: "top-center" })
    } catch (error) {
    toast.error("Failed to delete todo",{ position: "top-center" })
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
  const handleUpdate = async (e: any) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (!editTodoId) return
      await updateTodo(editTodoId, {
        task: editText
      })
      setIsOpen(false)
      toast.success("Todo Successfully Updated",{ position: "top-center" })
    } catch (error) {
      alert("Failed to Update Todo")
    }finally{
      setLoading(false)
    }
  }


  // upddated
  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over) return

    const supabase = await createClient()

    const activeId = active.id
    const overId = over.id

    // =========================
    // 🔴 1. CATEGORY REORDER
    // =========================
    const isCategoryDrag = categoryState.some(c => c.id === activeId)

    if (isCategoryDrag) {
      const oldIndex = categoryState.findIndex(c => c.id === activeId)
      const newIndex = categoryState.findIndex(c => c.id === overId)



      setDropTodo(newIndex)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const reordered = [...categoryState]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)

      setCategoryState(reordered)

      const updatedCategories = reordered.map((cat, index) => ({
        ...cat,
        position: index
      }))

      const { error } = await supabase
        .from("categories")
        .upsert(updatedCategories)

      if (error) console.error("Category reorder error:", error)

      return
    }

    // =========================
    // 🔵 2. TODO DRAG
    // =========================
    const dragged = todoState.find(t => t.id === activeId)
    if (!dragged) return

    const isDropOnCategory = categoryState.some(c => c.id === overId)

    // =========================
    // 🟡 2A. MOVE TO ANOTHER CATEGORY
    // =========================
    if (isDropOnCategory && dragged.category_id !== overId) {
      const targetTodos = todoState.filter(t => t.category_id === overId)
      const newPosition = targetTodos.length
      // const previewIndex = dropPreview?.index ?? targetTodos.length
      // const newPosition = previewIndex

      setTodoState(prev =>
        prev.map(t =>
          t.id === activeId
            ? { ...t, category_id: overId, position: newPosition }
            : t
        )
      )

      await supabase
        .from("todos")
        .update({
          category_id: overId,
          position: newPosition
        })
        .eq("id", activeId)

      return
    }

    // =========================
    // 🟢 2B. SAME CATEGORY REORDER
    // =========================
    const sameTodos = todoState
      .filter(t => t.category_id === dragged.category_id)
      .sort((a, b) => a.position - b.position)

    // ⚠️ safety check (important)
    if (!sameTodos.some(t => t.id === overId)) return

    const oldIndex = sameTodos.findIndex(t => t.id === activeId)
    // const newIndex = sameTodos.findIndex(t => t.id === overId)
    const newIndex = dropPreview?.index ?? 0


    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

    const reordered = [...sameTodos]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const updated = reordered.map((t, index) => ({
      ...t,
      position: index
    }))

    // ⚡ UI update
    setTodoState(prev =>
      prev.map(t =>
        t.category_id === dragged.category_id
          ? updated.find(u => u.id === t.id) || t
          : t
      )
    )

    // 💾 DB update
    const { error } = await supabase.from("todos").upsert(updated)

    if (error) console.error("Todo reorder error:", error)
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
          event: '*',
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          const { eventType, new: newRecord, old } = payload;

          if (eventType === "INSERT") {
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


  useEffect(() => {
    if(!accessToken ) {
      router.push('/login')
    } 
  },[])




  return (
    <div>
      <div>
        <form onSubmit={handleAddTodo}
          className="mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex  flex-col md:flex-row gap-4">
            <input
              required
              name="todo"
              type="text"
              placeholder="Enter your task..."
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2  focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400 " />

            <select
              title="Select Category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium cursor-pointer outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
              {categoryState.map((cat, index) => (
                <option className="text-gray-700"
                  key={index} value={cat.id}>
                  THIS {cat.category.toUpperCase()}
                </option>
              ))}
            </select>



            <button
              type="submit"
              disabled={loading}
              className="lg:w-30  lg:py-1 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/70 transition-all duration-200 flex items-center gap-2 justify-center  cursor-pointer ">
                {loading ? <Spinner className="size-6" /> : <> 
                 <Plus className="w-4 h-4  text-gray-200" /> Add Task</>}
            </button>

            <button
              type="button" 
              onClick={() => {
                setShowModal(true)
                setTodo("")
              }}
              className="px-3 lg:py-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 justify-center  cursor-pointer  hover:bg-primary/10 ">
              <LayoutGrid className="w-4 h-4" />
              New Board

            </button>
          </div>
        </form>



        {/* cards */}
        <div className="">
          <DndContext
            sensors={sensors}



            onDragStart={(event) => {
              const activeId = event.active.id
              const found = todoState.find(t => t.id === activeId)
              setActiveTodo(found || null)
            }}

            //for Card Drag & Drop 
            // onDragStart={(event) => {
            //   const activeId = event.active.id

            //   const foundTodo = todoState.find(t => t.id === activeId)
            //   if (foundTodo) {
            //     setActiveTodo(foundTodo)
            //     setActiveCard(null)
            //     return
            //   }

            //   const foundCard = categoryState.find(c => c.id === activeId)
            //   if (foundCard) {
            //     setActiveCard(foundCard)
            //     setActiveTodo(null)
            //   }
            // }}



            onDragOver={(event) => {
              const { over, active } = event
              if (!over) return

              const overData = over.data.current
              if (!overData) return
              if (overData.type === "todo") {
                const categoryId = overData.todo.category_id

                const items = todoState
                  .filter(t => t.category_id === categoryId)
                  .sort((a, b) => a.position - b.position)

                const overIndex = items.findIndex(t => t.id === over.id)
                if (overIndex === -1) return


                const activeTop =
                  active.rect.current.translated?.top ??
                  active.rect.current.initial?.top ??
                  0

                const overMiddle = over.rect.top + over.rect.height / 2

                const isBelow = activeTop > overMiddle

                const index = isBelow ? overIndex + 1 : overIndex

                setDropPreview({
                  categoryId,
                  index
                })
              }

              if (overData.type === "category") {
                const categoryId = overData.category.id

                const todos = todoState
                  .filter(t => t.category_id === categoryId)
                  .sort((a, b) => a.position - b.position)

                setDropPreview({
                  categoryId,
                  index: todos.length
                })
              }

              // if (overData?.type === "category") {
              //     const overIndex = categoryState.findIndex(c => c.id === over.id)
              //     if (overIndex === -1) return
              //     const activeTop =
              //       active.rect.current.translated?.left ??
              //       active.rect.current.initial?.left ??
              //       0

              //     const overMiddle = over.rect.left + over.rect.width / 2

              //     const isAfter = activeTop > overMiddle

              //     const index = isAfter ? overIndex + 1 : overIndex

              //     setCardDropPreview(index)
              //   }
            }}

            onDragEnd={(event) => {
              setDropPreview(null)
              handleDragEnd(event)
            }}
            // onDragEnd={(event) => {
            //     setDropPreview(null)
            //     setCardDropPreview(null)
            //     setActiveCard(null)
            //     handleDragEnd(event)
            //   }}
            
            >




            <SortableContext
              items={categoryState.map(c => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {/* <div className="flex gap-5 overflow-x-auto custom-scrollbar">
                {categoryState.map((cat, index) => (

                  <SortableCard key={cat.id} cat={cat} todo={todo}>
                    <Card
                      cat={cat}
                      todo={todoState
                        .filter(t => t.category_id === cat.id)
                        .sort((a, b) => a.position - b.position)}
                      index={index}
                      categories={categoryState}
                      handleDelete={handleDelete}
                      handleEdit={handleEdit}
                      setShowTaskModal={setShowTaskModal}
                      activeTodo={activeTodo}
                      dropPreview={dropPreview}
                    />
                  </SortableCard>
                ))}
              </div> */}


              <div className="flex gap-5 overflow-x-auto custom-scrollbar">
                {categoryState.map((cat, index) => (
                  <div key={cat.id}>
                    
                    {cardDropPreview === index && (
                      <div className="w-[350px] h-110 border-2 border-blue-400 bg-blue-50 rounded-xl" />
                    )}

                      <SortableCard key={cat.id} cat={cat} todo={todo}>
                    <Card
                      cat={cat}
                      todo={todoState
                        .filter(t => t.category_id === cat.id)
                        .sort((a, b) => a.position - b.position)}
                      index={index}
                      categories={categoryState}
                      handleDelete={handleDelete}
                      handleEdit={handleEdit}
                      setShowTaskModal={setShowTaskModal}
                      activeTodo={activeTodo}
                      dropPreview={dropPreview}
                    />
                  </SortableCard>
                    
                  </div>
                ))}

                {cardDropPreview === categoryState.length && (
                  <div className="w-[350px]  h-100 border-2 border-red-400 bg-blue-50 rounded-xl" />
                )}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeTodo ? (
                <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl w-[300px] text-sm text-gray-700 truncate transition-all duration-200 
                    text-lg font-semibold">
                  {activeTodo.task}
                </div>
              ) : null}
            </DragOverlay>
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
                <Button type="submit" className="flex-1 py-5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 transition-all duration-200 text-md  cursor-pointer ">
                  {loading ? <Spinner className="size-6" />  : "Create Board"}
                </Button>
                <Button 
                disabled={loading}
                type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-lg border border-gray-300 text-gray-700 font-medium text-md bg-white  hover:bg-gray-50 transition-all duration-200 cursor-pointer ">
                  Cancel
                </Button>
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
                <button
                disabled={loading}
                type="submit" className="flex-1 py-2.5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 text-md  flex items-center justify-center    transition-all duration-200  cursor-pointer">
                  {loading ? <Spinner  className="size-6" /> :  'Update Task' }
                </button>
                <Button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-5 rounded-lg border border-gray-300 text-gray-700 font-medium text-md bg-white  hover:bg-gray-50 transition-all duration-200  cursor-pointer ">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showTaskModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Task</h2>
              <CircleX onClick={() => setShowTaskModal(false)} className="w-5 h-5 cursor-pointer text-red-500 transition-colors" />
            </div>
            <form onSubmit={handleAddTodo}>

              <div className="flex   justify-center gap-2">
                <input
                  required
                  name="todo"
                  type="text"
                  placeholder="Enter your task..."
                  value={todo}
                  onChange={(e) => setTodo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 mb-4"
                />


                <select
                  title="Select Category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium cursor-pointer outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                  {categoryState.map((cat, index) => (
                    <option className="text-gray-700  text-[13px]"
                      key={index} value={cat.id}>
                      THIS {cat.category.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>


              <div className="flex gap-3">
                <Button type="submit" className="flex-1 py-5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 text-md transition-all text-center  duration-200  cursor-pointer">
                
                  {loading ? <Spinner  className="size-6" /> :  'Add Task' }

                </Button>
                <Button 
                disabled={loading}
                type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-5 rounded-lg border border-gray-300 text-gray-700 font-medium text-md bg-white hover:bg-gray-100 transition-all duration-200  cursor-pointer ">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
