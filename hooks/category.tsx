import { addCategory, deleteCategory } from "@/app/(action)/action";
import { toast } from "sonner";



export const AddNewCategory = async ({ e, updateContainers }: any) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const name = formData.get("category");

  const tempId = Date.now();
  updateContainers((prev: any) => [
    ...prev,
    {
      id: tempId,
      title: name,
      items: [],
      position: prev.length,
    },
  ]);

  try {
    const created = await addCategory(formData);
    updateContainers((prev: any) =>
      prev.map((c: any) =>
        c.id === tempId
          ? {
              ...c,
              id: created.id,
              title: created.category,
            }: c));

    toast.success("New Category Added", {
      position: "top-center",
    });
  } catch (err) {
    updateContainers((prev: any) =>
      prev.filter((c: any) => c.id !== tempId)
    );

    toast.error("Category creation failed", {
      position: "top-center",
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
