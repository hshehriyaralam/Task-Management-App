import { createClient } from '@/app/lib/supabase/server'
import Header from '@/component/header'
import TodoHome from '@/component/home'
import Stats from '@/component/stats'



  export default async function Page() {

  const supabase =  await createClient()

  const { data : todos } = await supabase.from('todos').select()
  const { data : categories } = await supabase.from('categories').select()

  
 

  return (
    <div  className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50  font-quicksand'>
      <div className="max-w-7xl mx-auto p-6 lg:p-8  " >
        <Header />
        <Stats />
      <TodoHome 
      todos={todos || []}
      categories={categories || []}
      />  
      </div>
    </div>
  )
  }