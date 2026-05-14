"use client";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export default function LoginForm({ accessToken }: any) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [mode, setMode] = useState(redirect ? "viewer" : "user");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error?.message === "Email not confirmed") {
        toast.error("Please confirm email first.", { position: "top-center" });
        return;
      }

      if (error?.message === "Invalid login credentials") {
        toast.error("Email Or Password not valid", { position: "top-center" });
        return;
      }
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/");
      }

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
    <section className="flex min-h-svh w-full items-center justify-center px-4 py-6 font-quicksand">
      <div className="w-full max-w-md ">
        <form
          onSubmit={handleLogin}
          className="border border-gray-200 p-5 sm:p-6 w-full min-h-[400px] rounded-xl flex flex-col gap-4"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-gray-600 text-center font-quicksand">
            {mode === "viewer" ? "Viewer Login" : "User Login"}
          </h1>

          <label className="text-gray-700 font-medium text-sm sm:text-base font-quicksand">
            Email
          </label>
          <input
          name="email"
            data-testid="login-email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter Your Email"
            className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base font-quicksand"
          />

          <label className="text-gray-700 font-medium text-sm sm:text-base font-quicksand">
            Password
          </label>
          <input
            name="password"
            data-testid="login-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 px-4 rounded-xl border border-gray-200 text-sm sm:text-base font-quicksand"
            type="password"
            placeholder="Enter your password"
          />

          <Button
            data-testid="login-btn"
            type="submit"
            disabled={loading}
            className="w-full text-md cursor-pointer
         bg-secondary text-white font-semibold py-5 sm:py-6 rounded-xl font-quicksand "
          >
            {loading ? <Spinner className="size-5 sm:size-6" /> : "Login"}
          </Button>

          <p className="text-gray-500 text-xs sm:text-sm text-center font-quicksand">
            Don't have an account?{" "}
            <span className="text-blue-900 font-semibold font-quicksand">
              <a href="/signup">SignUp</a>
            </span>
          </p>
        </form>
      </div>
    </section>
  );
}
