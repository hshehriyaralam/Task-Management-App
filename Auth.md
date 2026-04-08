import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://your-project.supabase.co', 'sb_publishable_... or anon key')

// Sign up a new user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'your-password',
})




const { data, error } = await supabase.auth.signUp({
  phone: '+13334445555',
  password: 'some-password',
})
