'use client'

import { deleteCategory } from '@/app/(action)/action'



export default function FetchCategories({categories}:any){



    return(
        <div>
    <div  className='flex items-center justify-center my-10'>
       {categories?.map((cat:any )=> (
    <div  key={cat.id}  className='p-10  border mx-2  '>
      <p>Categories : {cat.category}</p>
         <button
         onClick={() => deleteCategory(cat.id)}
          title='Delete Category'
            className="text-sm bg-red-500 px-3 py-1.5 text-white rounded-xl cursor-pointer">
            Delete
          </button>
      </div>
  ))}
    </div>
        </div>
    )
}