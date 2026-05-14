"use cliet";
import React ,{ useState } from "react";
import { Spinner } from "./ui/spinner";
import { LayoutGrid, Plus } from "lucide-react";

const Todoform = ({
  handleAddTodo,
  containers,
  loading,
  setShowModal,
  todo,
  setTodo,
  category,
  setCategory,
  isViewer,
}: any) => {
  return (
    <form onSubmit={handleAddTodo} className="mb-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex  flex-col md:flex-row gap-4">
        <input
          required
          name="todo"
          type="text"
          placeholder="Enter your task..."
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
          className={`flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2  focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400
            `}
            disabled={isViewer}
          
        />

        <select
          title="Select Category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium  outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all  *:
            ${isViewer ? 'cursor-not-allowed' :  'cursor-pointer '}`}
              disabled={isViewer}

        >
          <option className="text-gray-700" value={''}  disabled>Select the category</option>
          {containers.map((cat: any, index: number) => (
            <option className="text-gray-700" key={index} value={cat.id}>
              THIS {cat.title.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading || isViewer}
          className={`lg:w-30  lg:py-1 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/70 transition-all duration-200 flex items-center gap-2 justify-center 
             ${isViewer ? 'cursor-not-allowed' :  'cursor-pointer '}`}>
          {loading ? (
            <Spinner className="size-6" />
          ) : (
            <>
              <Plus className="w-4 h-4  text-gray-200" /> Add Task
            </>
          )}
        </button>

        <button
          data-testid="card-modal"
          type="button"
          onClick={() => {
            setShowModal(true);
            setTodo("")}}
              disabled={isViewer}
          className={`px-3 lg:py-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 justify-center  hover:bg-primary/10
              ${isViewer ? 'cursor-not-allowed' :  'cursor-pointer '}
            `}
        >
          <LayoutGrid className="w-4 h-4" />
          New Board
        </button>
      </div>
    </form>
  );
};

export default React.memo(Todoform)
