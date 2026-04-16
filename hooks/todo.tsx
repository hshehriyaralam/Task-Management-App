import completeTodo, { addTodo, deleteTodo, updateTodo } from "@/app/(action)/action";
import { toast } from "sonner";



export const AddTodo = async ({e,setLoading,updateContainers,setShowTaskModal}:any) => {
  e.preventDefault();
  setLoading(true);

  const tempId = Date.now();
  const formData = new FormData(e.currentTarget);

  const task = formData.get("todo");
  const catId = Number(formData.get("category"));

  const optimisticTodo = {
    id: tempId,
    task,
    category_id: catId,
    position: Date.now(),
    is_complete: false,
  };
  updateContainers((prev:any) =>
    prev.map((cat:any) =>
      cat.id === catId
        ? { ...cat, items: [...cat.items, optimisticTodo] }
        : cat
    )
  );

  // reset inputs
//   setTodo("");
//   setCategory("");
//   setModalTodo("");

  try {
    const newTodo = await addTodo(formData);
    updateContainers((prev : any) =>
      prev.map((cat:any) => ({
        ...cat,
        items: cat.items.map((item:any) =>
          item.id === tempId ? newTodo : item
        ),
      }))
    );

    toast.success("Todo Successfully Added", {
      position: "top-center",
    });

    setShowTaskModal(false);
  } catch (err) {
    updateContainers((prev:any) =>
      prev.map((cat:any) => ({
        ...cat,
        items: cat.items.filter((t:any) => t.id !== tempId),
      }))
    );

    toast.error("Failed to add todo", {
      position: "top-center",
    });
  } finally {
    setLoading(false);
  }
};


  export const DeleteTodo = async ({id, updateContainers,latestContainersRef,setContainers}:any) => {
  const old = latestContainersRef.current;
  updateContainers((prev:any) =>
    prev.map((cat:any) => ({
      ...cat,
      items: cat.items.filter((t:any )=> t.id !== id)
    }))
  );
  try {
    toast.success("Todo Successfully Deleted", { position: "top-center" });
    await deleteTodo(id);
  } catch (err) {
    toast.error("Failed to delete todo", { position: "top-center" }); 
    setContainers(old);
  }
};


 export const UpdateTodo = async ({e,latestContainersRef,setLoading,updateContainers,editTodoId,editText,setIsOpen,setContainers}:any) => {
  e.preventDefault();

  const oldValue = latestContainersRef.current;

  setLoading(true);
  updateContainers((prev:any) =>
    prev.map((cat:any) => ({
      ...cat,
      items: cat.items.map((t:any) =>
        t.id === editTodoId
          ? { ...t, task: editText }
          : t
      )
    }))
  );

  try {
    await updateTodo(Number(editTodoId), { task: editText });
    setIsOpen(false);
    toast.success("Todo Successfully Updated", { position: "top-center" });
  } catch (err) {
    setContainers(oldValue)
  }finally{
    setLoading(false)
  }
};


export const CompleteTodo = async ({id,latestContainersRef,updateContainers,setContainers}:any) => {
  if (!id) return;

  // old state backup
  const oldValue = latestContainersRef.current;

  // optimistic update
  updateContainers((prev:any) =>
    prev.map((cat:any) => ({
      ...cat,
      items: cat.items.map((t:any) =>
        t.id === id
          ? { ...t, is_complete: !t.is_complete }
          : t
      )
    }))
  );

  try {
    await completeTodo(id, {
      is_complete: !oldValue
        .flatMap((c:any ) => c.items)
        .find((t:any )=> t.id === id)?.is_complete,
    });
  } catch (error) {
    setContainers(oldValue);
    console.error("Todo not complete", error);
  }
};
