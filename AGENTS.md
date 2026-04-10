with update 


const handleDragEnd = async (event: DragEndEvent) => {
  const { over, active } = event;

  if (!over) {
    setActiveId(null);
    return;
  }

  const activeContainerId = findContainerId(active.id);
  const overContainerId = findContainerId(over.id);

  if (!activeContainerId || !overContainerId) {
    setActiveId(null);
    return;
  }

  if (activeContainerId === overContainerId && active.id !== over.id) {
    const containerIndex = containers.findIndex(
      (c) => c.id === activeContainerId
    );

    if (containerIndex === -1) {
      setActiveId(null);
      return;
    }

    const container = containers[containerIndex];

    const activeIndex = container.items.findIndex(
      (item) => item.id === active.id
    );
    const overIndex = container.items.findIndex(
      (item) => item.id === over.id
    );

    if (activeIndex !== -1 && overIndex !== -1) {
      const newItems = arrayMove(container.items, activeIndex, overIndex);

     
      setContainers((containers) => {
        return containers.map((c, i) => {
          if (i === containerIndex) {
            return { ...c, items: newItems };
          }
          return c;
        });
      });

 
      try {
        const supabase = createClient();

        const updates = newItems.map((item, index) => ({
          id: item.id,
          position: index, 
        }));

        await supabase.from("todos").upsert(updates);
      } catch (error) {
        console.error("Failed to update positions", error);
      }
    }
  }

  setActiveId(null);
};






old DragEnd
 const handleDragEnd  = (event : DragEndEvent) => {

          const {over, active} = event

          if(!over){
              setActiveId(null)
              return} 


              const activeContainerId = findContainerId(active.id)
              const  overContainerId = findContainerId(over.id)

              if(!activeContainerId || !overContainerId){
                setActiveId(null)
                return
              }

              if(activeContainerId === overContainerId && active.id !== over.id){
                const containerIndex = containers.findIndex((c) => c.id === activeContainerId)

                if(containerIndex === -1){
                  setActiveId(null)
                  return
                }
                
                const container = containers[containerIndex];
                const activeIndex = container.items.findIndex((item) => item.id === active.id)
                const overIndex = container.items.findIndex((item) =>  item.id === over.id)

                if(activeIndex !== -1 && overIndex !== -1 ){
                  const newItems = arrayMove(container.items, activeIndex, overIndex)

                  setContainers((containers) => {
                    return containers.map((c,i) =>  {
                      if( i === containerIndex){
                        return {...c, items:newItems}
                      }
                      return c
                    })
                  })
                }
              }

              setActiveId(null)
      }


