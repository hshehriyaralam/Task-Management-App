'use client'
import { updateTodosBulk } from "./bulkTodo";

 
 
 
//   Bulk API call
export  const BatchUpdate = ({items,updateQueueRef,batchTimerRef}:any) => {
    updateQueueRef.current = [...updateQueueRef.current, ...items];

    // deduplicate by id (VERY IMPORTANT)
    const map = new Map();

    for (const item of updateQueueRef.current) {
      map.set(item.id, item);
    }

    updateQueueRef.current = Array.from(map.values());

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }

    batchTimerRef.current = setTimeout(async () => {
      const payload = [...updateQueueRef.current];
      try {

        if (payload.length === 0) return;

        updateQueueRef.current = [];

        await updateTodosBulk(payload);
        
      } catch (err) {
        console.error("Batch update failed", err);
        updateQueueRef.current.push(...payload);
      }
    }, 400);
  }


  export  const flushBatch = async ({batchTimerRef,updateQueueRef,isSyncingRef}:any) => {
  if (batchTimerRef.current) {
    clearTimeout(batchTimerRef.current);
    batchTimerRef.current = null;
  }

  const payload = [...updateQueueRef.current];
  if (!payload.length) return;
  updateQueueRef.current = [];

  try {
    await updateTodosBulk(payload);
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 500);

  } catch (err) {
    console.error(err);
  }
};