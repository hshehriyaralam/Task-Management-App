import { createClient } from '@/app/lib/supabase/server'
import TodoHome from '@/component/home'



  export default async function Page() {

  const supabase =  await createClient()

  const { data : todos } = await supabase.from('todos').select()
  const { data : categories } = await supabase.from('categories').select()

  
 

  return (
    <div>
      <TodoHome 
      todos={todos || []}
  categories={categories || []}
      />  
    </div>
  )
  }