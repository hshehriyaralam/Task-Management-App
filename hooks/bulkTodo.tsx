import { createClient } from "@/app/lib/supabase/client";

export async function updateTodosBulk(items: any[]) {
  const supabase = createClient();

  const { error } = await supabase.rpc("reorder_todos", {
    items,
  });

  if (error) {
    console.log("Bulk update failed", error.message);
    throw error;
  }
}


