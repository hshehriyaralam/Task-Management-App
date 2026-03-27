export default function Modal(){
    return(
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center"  
        onClick={() => setIsOpen(false)}
        >
          <div
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-100 rounded-lg p-5 w-[400px]">

            <CircleX 
            onClick={() => setIsOpen(false)}
            className="w-6 cursor-pointer text-red-500  justify-self-end "/>

            <h2 className="font-bold text-gray-800 mb-3 text-center text-xl">Edit Todo </h2>
            <div className="flex items-center justify-center gap-2   mb-4">

              <input
                type="text"
                placeholder="Update your task "
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="p-2 rounded-xl bg-gray-200 outline-none text-gray-800 " />


              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="p-2 rounded-xl bg-gray-200 text-sm cursor-pointer  ">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

            </div>

            {/* Button Update & Cancell */}
            <div className="flex items-center justify-center gap-2">
              <button
              onClick={handleUpdate}
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



          </div>
        </div>
    )
}