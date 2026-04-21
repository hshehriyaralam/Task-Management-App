todo drag and drop ,card drag & drop




scheduleBatchUpdate([
  {
    id: Number(movedItem.id),
    position: newIndex,
    category_id: Number(overContainerId),
  },
]);



const updatedSourceItems = sourceContainer.items
  .filter(item => item.id !== active.id)
  .map((item, index) => ({
    id: Number(item.id),
    position: index,
    category_id: Number(activeContainerId),
  }));

const updatedDestinationItems = [
  ...destinationContainer.items.slice(0, newIndex),
  movedItem,
  ...destinationContainer.items.slice(newIndex),
].map((item, index) => ({
  id: Number(item.id),
  position: index,
  category_id: Number(overContainerId),
}));

scheduleBatchUpdate([
  ...updatedSourceItems,
  ...updatedDestinationItems,
]);


------------------------------------------------------------------

    isSyncingRef.current = true;
if (isSyncingRef.current) return;
await flushBatch({ batchTimerRef, updateQueueRef, isSyncingRef });

isSyncingRef.current = false;




3
const latestContainers = [...containers];

const latestContainers = [...latestContainersRef.current];


4
optimisticRef.current = null;

if (isDraggingRef.current || isSyncingRef.current) return;


5
updateQueueRef.current = Object.values(
  Object.fromEntries(
    items.map(item => [item.id, item])
  )
);