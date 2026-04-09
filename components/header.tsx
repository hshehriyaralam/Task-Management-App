'use client'
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation'
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { LogOut } from "lucide-react";




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
        <header  className="z-50">
        <div  className="flex items-center justify-between   mb-2"  >
            <div >
            <h1  className="text-4xl font-bold text-gray-800">TaskFlow</h1>
            </div>

        <div  className="flex items-center gap-2">
            <Button  className="bg-secondary  flex items-center   rounded-xl  w-30   py-5  shadow-sm border border-gray-100 font-quicksand font-semibold  text-gray-200   text-md  cursor-pointer   "
            onClick={handleLogOut}>
                {loading ? <Spinner /> :  <>LogOut <LogOut  className="w-4 text-gray-200" /></>}
            </Button>

        
        </div>
        </div>
        </header>
    )
}