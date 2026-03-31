


  import { createClient } from '@/app/lib/supabase/server'



  export default async function Page() {

  const supabase =  await createClient()

  const { data : todos } = await supabase.from('todos').select()
  console.log("todos")
  return (
  <div>
  {todos?.map(todo => (
  <p key={todo.id}>{todo.task}</p>
  ))}
  </div>
  )
  }