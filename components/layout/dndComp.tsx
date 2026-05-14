"use client"
import React, { useCallback, useState } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  DragOverEvent,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { updateCategoriesBulk } from '@/hooks/bulkCategory';
import { BatchUpdate, flushBatch } from '@/hooks/helpers';
import { CompleteTodo, DeleteTodo } from '@/hooks/todo';
import { DeleteCategory } from '@/hooks/category';
import Card from '../card';
import CardOverlay from '../cardOverlay';
import TodoOverlay from '../todoOverlay';


const DndComponent = ({
    isViewer,
    setActiveId,
    isDraggingRef,
    isSyncingRef,
    latestContainersRef,
    updateQueueRef,
    batchTimerRef,
    isCategoryDrag,
    findContainerId,
    setContainers,
    containers,
    updateContainers,
    categories,
    handleEdit,
    activeId,
    categoryIds,
    TaskModalOpen,
}:any) => {

    


    


      const scheduleBatchUpdate = useCallback((items: any[]) => {
          const existing = updateQueueRef.current;
          // console.log("batch update existing ref ", existing)
             const merged = [
                ...existing,
                ...items
              ];
    
            updateQueueRef.current = Object.values(
              Object.fromEntries(
                merged.map(item => [item.id, item]) 
              )
            )
        BatchUpdate({
          items : updateQueueRef.current,
          updateQueueRef,batchTimerRef})
      }, []);




      const sensor = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );



  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    isDraggingRef.current = true;
    isSyncingRef.current = true;
  }, []);



     const handleDragOver = useCallback((event: DragOverEvent) => {
  const { active, over } = event;
  if (!over) return;

  if (isCategoryDrag(active.id)) return;

  const activeId = active.id;
  const overId = over.id;

  const activeContainerId = findContainerId(activeId);
  const overContainerId = findContainerId(overId);

  if (!activeContainerId || !overContainerId) return;

  if (activeContainerId === overContainerId) return;

  setContainers((prev:any) => {
    const activeContainer = prev.find((c:any) => c.id === activeContainerId);
    const overContainer = prev.find((c :any)=> c.id === overContainerId);
    if (!activeContainer || !overContainer) return prev;

    const activeItem = activeContainer.items.find((i:any) => i.id === activeId);
    if (!activeItem) return prev;

    return prev.map((container:any) => {
      if (container.id === activeContainerId) {
        return {
          ...container,
          items: container.items.filter((i:any) => i.id !== activeId),
        };
      }

      if (container.id === overContainerId) {
        const overIndex = container.items.findIndex((i:any) => i.id === overId);

        return {
          ...container,
          items:
            overIndex === -1
              ? [...container.items, activeItem]
              : [
                  ...container.items.slice(0, overIndex),
                  activeItem,
                  ...container.items.slice(overIndex),
                ],
        };
      }

      return container;
    });
  });
}, [containers]);

  const handleCategoryDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const activeRaw = String(active.id).replace("cat-", "");
      const overRaw = String(over.id
      ).replace("cat-", "");
      if (!String(over.id).startsWith("cat-")) return;
      const oldIndex = containers.findIndex((c:any) => String(c.id) === activeRaw);
      const newIndex = containers.findIndex((c:any) => String(c.id) === overRaw);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(containers, oldIndex, newIndex);
        setContainers(reordered);
        latestContainersRef.current = reordered;
        try {
      const items = reordered.map((cat:any, index:number) => ({
        id: Number(cat.id),
        position: index,
      }));
      isDraggingRef.current = false;   
      isSyncingRef.current = false; 
      await updateCategoriesBulk(items);
    } catch (err) {
      console.error("Category bulk update failed", JSON.stringify(err));
    }
    },
    [containers],
  );




    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        setActiveId(null);
        return;
      }
      if (isCategoryDrag(active.id)) {
        handleCategoryDragEnd(event);
        setActiveId(null);
        return;
      }
    
      const sourceContainerId = findContainerId(active.id);
      const destinationContainerId = findContainerId(over.id);
    
      if (!sourceContainerId || !destinationContainerId) {
        setActiveId(null);
        return;
      }
    
      if (sourceContainerId === destinationContainerId) {
        const container = containers.find((c:any) => c.id === sourceContainerId);
        if (!container) return;
    
        const oldIndex = container.items.findIndex((i:any) => i.id === active.id);
        const newIndex = container.items.findIndex((i:any)=> i.id === over.id);
    
        if (oldIndex === -1 || newIndex === -1) return;
    
        const newItems = arrayMove(container.items, oldIndex, newIndex);
    
        const newContainers = containers.map((c:any) =>
          c.id === sourceContainerId ? { ...c, items: newItems } : c
        );
    
        setContainers(newContainers);
    
        try {
          scheduleBatchUpdate(
            newItems.map((item :any, index:number) => ({
              id: Number(item.id),
              position: index,
              category_id: Number(sourceContainerId),
            }))
          );
        } catch (err) {
          console.error("Reorder failed", err);
        }
      }
    
      setActiveId(null);
      isDraggingRef.current = false;
    
      await flushBatch({ batchTimerRef, updateQueueRef, isSyncingRef });
      isSyncingRef.current = false;
      updateQueueRef.current = [];
    
    }, [containers]);


      const handleDelete = useCallback(async (id: number) => {
        await DeleteTodo({id, updateContainers,latestContainersRef,setContainers})
    },[])
    
    const handleCompleteTodo = async (id: number) => {
      await CompleteTodo({id,latestContainersRef,updateContainers,setContainers})
    };



      const handleDeleteCategory =  useCallback(async (catId: number) => {
      await DeleteCategory({catId,categories,containers,updateContainers,setContainers})
    },[])

  
    
    
      const getActiveItem = () => {
        for (const container of containers) {
          const item = container.items.find((item:any) => item.id === activeId);
          if (item) return item;
        }
        return null;
      };
    
      const getActiveCard = () => {
        if (!activeId) return null;
        const rawId = String(activeId).replace("cat-", "");
        return containers.find((c:any) => String(c.id) === rawId) || null;
      };
    

  return (
        <DndContext
               sensors={isViewer ? [] : sensor}
             collisionDetection={rectIntersection}
             onDragStart={isViewer ? undefined : handleDragStart}
             onDragOver={isViewer ? undefined : handleDragOver}
             onDragEnd={isViewer ? undefined : handleDragEnd}
           >
             <SortableContext
               items={categoryIds}
               strategy={horizontalListSortingStrategy}>
               <div className="flex gap-5 overflow-x-auto custom-scrollbar">
                 {containers?.map((cat:any, index:number) => (
                   <Card
                     key={`container-${cat.id}`}
                     cat={cat}
                     todo={cat.items}
                     index={index}
                     categories={containers}
                     handleDelete={handleDelete}
                     handleEdit={handleEdit}
                     TaskModalOpen={TaskModalOpen}
                     handleDeleteCategory={handleDeleteCategory}
                     handleCompleteTodo={handleCompleteTodo}
                     isViewer={isViewer}
                   />
                 ))}
               </div>
             </SortableContext>
   
             <DragOverlay>
               {activeId && isCategoryDrag(activeId) ? (
                 <CardOverlay
                   cat={getActiveCard()}
                   todo={getActiveCard()?.items || []}
                 />
               ) : activeId ? (
                 <TodoOverlay>{getActiveItem()?.task}</TodoOverlay>
               ) : null}
             </DragOverlay>
           </DndContext>
  )
}

export default React.memo(DndComponent) 
