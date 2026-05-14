"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";
import { SignUpHandler } from "@/hooks/signUpFunc";

export default function SignUpForm({ accessToken }: any) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

const handleSignUp = async (e:React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  await SignUpHandler({setLoading,loading,email,password,name,router,})
  setName('')
  setEmail('')
  setPassword('')
}


  useEffect(() => {
    if (accessToken) {
      router.push("/");
    }
  }, [accessToken, router]);

  return (
    <section className="flex min-h-svh w-full items-center justify-center px-4 py-6">
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
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Your name"
            data-testid="signup-name"
            className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <label className="text-gray-700 font-medium text-sm sm:text-base">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="signup-email"
            placeholder="Enter Your Email"
            className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <label className="text-gray-700 font-medium text-sm sm:text-base">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="signup-password"
            placeholder="Enter your password"
            className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <Button
            data-testid="signup-btn"
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
    </section>
  );
}
