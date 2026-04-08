'use client'
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js" 


type   SupabaseSchema = Record<string, never>;

let client : SupabaseClient<SupabaseSchema> | null = null

export function getSupabaseBrowserClient(): SupabaseClient<SupabaseSchema> {
    if(client){
        return client
    }

    const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if(!supabaseURL  ||     !supabaseAnonKey){
        throw new Error(
            "Missing  NEXT_PUBLIC_SUPABASE_URL or  NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )
    }

    client = createBrowserClient<SupabaseSchema>(supabaseURL,supabaseAnonKey)
    return client

}