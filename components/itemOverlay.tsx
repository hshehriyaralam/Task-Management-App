"use client";
import { Pencil, Trash2 } from "lucide-react";

export default function ItemOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={`bg-white rounded-lg border border-gray-100 p-2
            flex items-center justify-between group transition-all duration-200 cursor-grab
          `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-200 cursor-pointer"
          />
          <span
            className={`text-sm text-gray-700 truncate transition-all duration-200 
        text-lg font-semibold
          `}
          >
            {children}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 transition-all duration-200
         `}
        >
          <button
            className={`p-2   rounded-md bg-blue-100 transition-all duration-200  cursor-pointer  
             
             `}
            title="Edit task"
          >
            <Pencil className="w-4 h-4 text-blue-600  hover:text-blue-500" />
          </button>
          <button
            className="p-2 rounded-md bg-red-100 transition-all duration-200 cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4 text-red-600  hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
