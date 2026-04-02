'use server'
import { createClient } from "../lib/supabase/server"




// Add Todo
// export  async function addTodo(formData : any){
//     const supabase = await createClient()

//     const todo = formData.get('todo')
//     const category = formData.get('category')

//  const { error } = await supabase.from('todos').insert({ 
//     task : todo,
//     is_complete : false,
//     category : category
//   });

//     if (error) {
//     console.error('Error adding todo:', error);
//   }
// }


export async function addTodo(formData: any) {
  const supabase = await createClient()

  const todo = formData.get('todo')
  const category_id = Number(formData.get('category')) // 👈 convert to number

  const { error } = await supabase.from('todos').insert({
    task: todo,
    is_complete: false,
    category_id: category_id 
  })

  if (error) {
    console.error('Error adding todo:', error)
  }
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

 const { error } = await supabase.from('categories').insert({ 
    category : category
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



