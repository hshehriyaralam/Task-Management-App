
import { createClient } from '@/app/lib/supabase/server'




export async function getUserId(){
  const supabase = await createClient()
  const {data : {user} } = await supabase.auth.getUser()
  const userId = user?.id

  return userId
}