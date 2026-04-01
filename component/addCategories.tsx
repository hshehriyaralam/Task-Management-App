'use client'


import { useState } from "react"
import { addCategory } from "@/app/(action)/action"


export default function AddCategories(){

  const [newCategory, setNewCategory] = useState('')
    return(
        <div>
            <form action={addCategory}  >
              <div className="flex items-center justify-center gap-2   mb-4 ">
                <input
                  required
                  name="category"
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
                {/* <button
                  type="button"
                  className="bg-gray-500   hover:bg-gray-400   cursor-pointer text-white rounded-xl text-sm 
            px-5 py-1.5">
                  Cancel
                </button> */}
              </div>
            </form>
        </div>
    )
}





