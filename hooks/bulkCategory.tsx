import { createClient } from "@/app/lib/supabase/client";

export async function updateCategoriesBulk(items: any[]) {
  const supabase = createClient();

  const { error } = await supabase.rpc("reorder_categories", {
    items,
  });

  if (error) {
    console.error("Category bulk update failed", JSON.stringify(error));
    throw error;
  }
}

