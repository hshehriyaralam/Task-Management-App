"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import { useRouter } from 'next/navigation'
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";


// type EmalPasswordProp = {
//   user: User | null;
// };

export default function LoginForm() {
    const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if(error?.message === 'Email not confirmed'){
      toast.error("Please confirm email first.", {position : "top-center"});
      return
      }else
        
       if(error?.message === 'Invalid login credentials'){
      toast.error("Email Or Password not valid", {position : "top-center"});
      // console.log("error", error)
      // setEmail("")
      // setPassword("")
      return
      }else{
      router.push("/")
      setEmail("");
      setPassword("");
      toast.success("Login Successfully", { position: "top-center" });
      }
     
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6">
  <div className="w-full max-w-md ">
    <form
      onSubmit={handleLogin}
      className="border border-gray-200 p-5 sm:p-6 w-full min-h-[400px] rounded-xl flex flex-col gap-4"
    >
      <h1 className="text-xl sm:text-2xl font-bold text-gray-600 text-center">
        Login
      </h1>

      <label className="text-gray-700 font-medium text-sm sm:text-base">
        Email
      </label>
      <input
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Enter Your Email"
        className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base"
      />

      <label className="text-gray-700 font-medium text-sm sm:text-base">
        Password
      </label>
      <input
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base"
        type="password"
        placeholder="Enter your password"
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full text-md cursor-pointer bg-secondary text-white font-semibold py-5 sm:py-6 rounded-xl"
      >
        {loading ? <Spinner className="size-5 sm:size-6" /> : "Login"}
      </Button>

      <p className="text-gray-500 text-xs sm:text-sm text-center">
        Don't have an account?{" "}
        <span className="text-blue-900 font-semibold">
          <a href="/signup">SignUp</a>
        </span>
      </p>
    </form>
  </div>
</div>
  );
}
