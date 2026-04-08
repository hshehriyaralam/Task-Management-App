'use client'
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation'



export default function Header() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = getSupabaseBrowserClient();
 
    const handleLogOut = async () => {
        try{
            setLoading(true)
            await supabase.auth.signOut()
            toast.success("Succcessfully LogOut", {position : 'top-center'})
            router.push('/login')
        }catch(error){
            toast.error("Logout failed", {position : 'top-center'})
        }finally{
            setLoading(false)
        }

        

    }
    return (
        <header  className="">
        <div  className="flex items-center justify-between   mb-2"  >
            <div >

            <h1  className="text-4xl font-bold text-gray-800">TaskFlow</h1>
            </div>

        <div  className="flex items-center gap-2">
            <div  className="bg-white  rounded-xl px-4 py-2 shadow-sm border border-gray-100 font-quicksand font-semibold  cursor-pointer "
            onClick={handleLogOut}>
                {loading ? "loading" : "LogOut"}
            </div>
        </div>
        </div>
        </header>
    )
}