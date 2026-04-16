import { addCategory, deleteCategory } from "@/app/(action)/action";
import { toast } from "sonner";





  export const AddNewCategory = async ({e,setLoading,setShowModal,updateContainers}:any) => {
  e.preventDefault();
  setLoading(true);
  const formData = new FormData(e.currentTarget);
  const name = formData.get("category")
  const tempId = Date.now();
  setLoading(false)
  setShowModal(false)
  updateContainers((prev:any) => [
    ...prev,
    {
      id: tempId,
      title: name,
      items: [],
      position: prev.length
    },
  ]);
   toast.success("New Card Successfully Added", {
      position: "top-center"
    });
    // setNewCategory("")
  try {
    await addCategory(formData);
  } catch (err) {
    updateContainers((prev:any) =>
      prev.filter((c:any) => c.id !== tempId)
    );

    toast.error("New Card Not Added", {
      position: "top-center"
    });

  } 
};




  export const DeleteCategory = async ({catId,categories,containers,updateContainers,setContainers}:any) => {
  
  const previousState = containers; 
  updateContainers((prev:any) =>
    prev.filter((cat :any)=> cat.id !== catId)
  );
  toast.success("Card Successfully Deleted", {
      position: "top-center"
    });

  try {
    await deleteCategory(catId);
    updateContainers((prev:any) =>
    prev.filter((cat :any)=> cat.id !== catId)
  );
  } catch (err) {
    setContainers(previousState);
    toast.error("Delete failed, restored previous state", {
      position: "top-center"
    });
  }
};
