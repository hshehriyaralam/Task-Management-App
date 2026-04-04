"use client"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"



export default function SortableCard({cat, children}:any){
    const {attributes, listeners,setNodeRef,transform, transition, isDragging,} = 
    useSortable({id : cat, data : {categoryId: cat.id }}
      
    )
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
    return(
        <div 
         ref={setNodeRef}
  style={style}
  {...(listeners || {})}
  {...(attributes || {})}
  data-category-id={cat.id}
   className="min-w-[350px] cursor-grab active:cursor-grabbing select-none">
        {children}
        </div>
    )
}