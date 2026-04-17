'use server'
import { createClient } from "../lib/supabase/server"



//new Add Todo
export async function addTodo(formData: FormData) {
  const supabase = await createClient();

  const todo = formData.get("todo");
  const category_id = Number(formData.get("category"));
  const { data: existingData, error: fetchError } = await supabase
    .from("todos")
    .select("id")
    .eq("category_id", category_id);

      const {
    data: { user },
  } = await supabase.auth.getUser();
  const user_id = user?.id

 const { data: boards } = await supabase
  .from("boards")
  .select("id")
  .eq("owner_id", user?.id)
  .limit(1)
  .single();







  if (fetchError) {
    console.error("Error fetching todos:", fetchError);
    throw fetchError;
  }

  const position = existingData?.length || 0;
  const { data, error } = await supabase
    .from("todos")
    .insert({
      task: todo,
      is_complete: false,
      category_id,
      position,
      user_id,
      board_id : boards?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding todo:", error);
    throw error;
  }

  return data; 
}


// Delete Todo 
export async function deleteTodo(id:number){
    const supabase = await createClient()
    const {error } = await supabase.from('todos').delete().eq('id', id)
     if (error) {
    console.error('Error adding todo:', error);
  }
}

// UpdateTodo 
export async function  updateTodo(id : number, updateTodo :any ){
  const supabase = await  createClient()

  const {data , error} = await supabase.from('todos').update(updateTodo).eq('id', id)

  if (error) {
    console.error('Error updating todo:', error);
    return { success: false, error };
  }
  return { success: true, data };
}


// complete Todos 
export default async function completeTodo(id:number , compeleteTodo : any ){
  const supabase = await createClient()
  const {data , error} = await supabase.from('todos').update(compeleteTodo).eq('id', id)

  if (error) {
    console.error('Error in mark todo:', error);
    return { success: false, error };
  }
  return { success: true, data };
}






// Add Category 
export  async function addCategory(formData : any){
    const supabase = await createClient()
    const category = formData.get('category')
    const {data : ExistingData , error : fetchError} = await supabase.from('categories').select('id')

    if (fetchError) {
    console.error('Error fetching categories:', fetchError)
    return }

         const {
    data: { user },
  } = await supabase.auth.getUser();
    
      
      const { data: boards } = await supabase
        .from("boards")
        .select("id")
        .eq("owner_id", user?.id)
        .limit(1)
        .single();

          const position = ExistingData?.length || 0
        const { error } = await supabase.from('categories').insert({
            category : category,
            position : position,
            board_id  : boards?.id
          });

    if (error) {
    console.error('Error adding todo:', error);
  }
}


// Delete Category
export async function deleteCategory(id:number){
    const supabase = await createClient()
    const {error } = await supabase.from('categories').delete().eq('id', id)
     if (error) {
    console.error('Error adding todo:', error);
  }
}


// update category 
export async function updateCategory(id: number, data: { position?: number }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id);

  if (error) throw new Error(error.message);
}



