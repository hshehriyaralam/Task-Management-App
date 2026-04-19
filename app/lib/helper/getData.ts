import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function getUserData() {
  const supabase = await createClient();

  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .order("position", { ascending: true });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(
    "sb-xilzbhrcplvgwljkwtsb-auth-token"
  )?.value;

  const {data  : board} = await supabase.from("boards")
  .select("*")
  .eq("owner_id", user?.id)
  .single();


  // get all users 
  // const { data: allUsers } = await supabase
  // .from("users")
  // .select("*")
 





  const filterTodo =
    todos?.filter((todo) => todo.user_id === user?.id) || [];

  const filterCategory =
    categories?.filter((cat) => cat.user_id === user?.id) || [];

  return {
    accessToken : accessToken,
    todos: filterTodo,
    categories: filterCategory,
    userName: user?.user_metadata?.name,
    board : board,
  };
}