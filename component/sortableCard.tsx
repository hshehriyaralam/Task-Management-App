"use client"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"



export default function SortableCard({cat, children}:any){
    const {attributes, listeners,setNodeRef,transform, transition} = useSortable({id : cat})
    const style = {
  transform: transform ? CSS.Transform.toString(transform) : undefined,
  transition
}
    return(
        <div 
         ref={setNodeRef}
  style={style}
  {...(listeners || {})}
  {...(attributes || {})}
  className="min-w-[300px]
  ">
      {/* cursor-grab */}


        {children}
        </div>
    )
}