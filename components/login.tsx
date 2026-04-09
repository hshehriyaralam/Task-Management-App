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
      if(error){
      toast.error("Email Or Password does not match", {position : "top-center"});
      setEmail("")
      setPassword("")
      return
      }
      router.push("/")
      setEmail("");
      setPassword("");
      toast.success("Login Successfully", { position: "top-center" });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-6">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="border border-gray-200 p-6 w-[400px] min-h-[300px] rounded-xl flex flex-col gap-4 "
        >
          <h1 className="text-2xl font-bold text-gray-600 text-center ">
            Login{" "}
          </h1>

          <label htmlFor="" className="text-gray-700  font-medium">
            Email
          </label>
          <input
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter Your Email"
            className="p-3 px-4  rounded-xl  border  border-gray-200"
          />

          <label htmlFor="" className="text-gray-700  font-medium">
            Password
          </label>
          <input
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 px-4  rounded-xl  border  border-gray-200 "
            type="password"
            placeholder="Enter your password"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full text-md  cursor-pointer bg-secondary text-white font-semibold py-6 rounded-xl "
          >
            {loading ?  <Spinner  className="size-6"/> : "Login" }
          </Button>
            <p className="text-gray-500 text-sm font-normal text-center ">
            Don't have a account?{" "}
            <span className="text-blue-700">
              {" "}
              <a href="/signup">SignUp</a>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
