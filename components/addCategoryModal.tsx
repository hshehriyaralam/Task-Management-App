import { CircleX } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'

const AddCategoryModal = ({handleCancelModal,handleAddCategory,newCategory,setNewCategory,loading}:any) => {
  return (
        <section
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancelModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Create New Board
              </h2>
              <CircleX
                onClick={handleCancelModal}
                className="w-6 h-6  cursor-pointer text-red-500 transition-colors"
              />
            </div>
            <form onSubmit={handleAddCategory}>
              <input
                data-testid="add-new-card"
                required
                name="category"
                type="text"
                placeholder="Enter board name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 mb-4"
              />
              <div className="flex gap-3">
                <Button
                data-testid="addCard-btn"
                  type="submit"
                  className="flex-1 py-5 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 transition-all duration-200 text-md  cursor-pointer "
                >
                  {loading ? <Spinner className="size-6" /> : "Create Board"}
                </Button>
                <Button
                  disabled={loading}
                  type="button"
                  onClick={handleCancelModal}
                  className="flex-1 py-5 rounded-lg border border-gray-300 text-gray-700 font-medium text-md bg-white  hover:bg-gray-50 transition-all duration-200 cursor-pointer "
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </section>
  )
}

export default React.memo(AddCategoryModal)
