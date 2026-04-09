"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import { useRouter } from 'next/navigation'
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";

// type EmalPasswordProp = {
//   user: User | null;
// };

export default function SignUpForm() {
    const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
         options: {
          data: {
            name : name,
          },
        },
      });
      if(error){
        toast.error("Something went Wrong", {position : 'top-center'})
      }
      setName("")
      setEmail("");
      setPassword("");
      toast.success("SignUp Successfully", {position : 'top-center'});
      router.push('/login')
      console.log(error?.message);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6">
  <div className="w-full max-w-md">
    <form
      onSubmit={handleSignUp}
      className="border border-gray-200 p-5 sm:p-6 w-full min-h-[300px] rounded-xl flex flex-col gap-4 shadow-sm"
    >
      <h1 className="text-xl sm:text-2xl font-bold text-gray-600 text-center">
        Sign Up
      </h1>

      <label className="text-gray-700 font-medium text-sm sm:text-base">
        Name
      </label>
      <input
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
        type="text"
        placeholder="Enter Your name"
        className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <label className="text-gray-700 font-medium text-sm sm:text-base">
        Email
      </label>
      <input
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Enter Your Email"
        className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <label className="text-gray-700 font-medium text-sm sm:text-base">
        Password
      </label>
      <input
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Enter your password"
        className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full text-md   cursor-pointer bg-secondary text-white font-semibold py-5 sm:py-6 rounded-xl"
      >
        {loading ? <Spinner className="size-5 sm:size-6" /> : "Sign Up"}
      </Button>

      <p className="text-gray-500 text-xs sm:text-sm text-center">
        Already have an account?{" "}
        <span className="text-blue-900 font-semibold">
          <a href="/login">Login</a>
        </span>
      </p>
    </form>
  </div>
</div>
  );
}
