
import { createClient } from '@/app/lib/supabase/server'
import Header from '@/components/header'
import TodoHome from '@/app/pages/home'
import Stats from '@/components/stats'
import { cookies } from 'next/headers'





export default  async   function Page() {
  
  const supabase = await createClient()


    const { data: todos } = await supabase.from('todos').select("*").order('position', { ascending: true })
    const { data: categories } = await supabase.from('categories').select("*").order('position', { ascending: true })
    const {data : {user} } = await supabase.auth.getUser()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-xilzbhrcplvgwljkwtsb-auth-token')?.value

    const userId = user?.id
    const filterTodo = todos?.filter(todo => todo.user_id === userId )
    const filterCategory = categories?.filter(cat => cat.user_id === userId )
    console.log(filterTodo)




  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50  font-quicksand'>
      <div className="max-w-7xl mx-auto p-6 lg:p-4  " >
        <Header />
        {/* <Stats todos={todos} />  */}
          <TodoHome
          
          accessToken={accessToken}
          todos={filterTodo || []}
          categories={filterCategory || []}/> 





      </div>
    </div>
  )
}


