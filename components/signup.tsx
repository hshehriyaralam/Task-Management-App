"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";
import { SignUpHandler } from "@/hooks/signUpFunc";

export default function SignUpForm({ accessToken }: any) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  // const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (loading) return;
  //   setLoading(true);
  //   try {
  //     const { data, error } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         data: {
  //           name: name,
  //         },
  //       },
  //     });
  //     if (error) {
  //       if (error.message === "User already registered") {
  //         toast.error("User already registered, Please Login", {
  //           position: "top-center",
  //         });
  //         router.push("/login");
  //         return;
  //       } else if (
  //         error.message === "Password should be at least 6 characters."
  //       ) {
  //         toast.error("Password should be at least 6 characters", {
  //           position: "top-center",
  //         });
  //         return;
  //       } else {
  //         toast.error("Something went Wrong", { position: "top-center" });
  //       }
  //     }

      
  //     const userId = data?.user?.id;
  //     if (!userId) return;

  //     // add user in users table 
  //     if (data?.user) {
  //       await supabase.from("users").insert([
  //         {
  //           id: userId,
  //           email: data.user.email,
  //           name: data?.user.user_metadata?.name,
  //         },
  //       ] as any);
  //     }



  //     // boards get and add 
  //     const { data: boards } = await supabase
  //           .from("boards")
  //           .select("*")
  //           .eq("owner_id", userId)
  //           .single<Board>();

  //         if (!boards) {
  //           const { data: newBoard } = await supabase
  //             .from("boards")
  //             .insert(
  //               [ {
  //                   name: `${data?.user?.user_metadata.name} Board`,
  //                   owner_id: userId,
  //                 } 
  //               ] as any
  //           )
  //             .select()
  //             .single()
  //         }

  //         const boardId = boards?.id




  //     const { data: existingCategories } = await supabase
  //       .from("categories")
  //       .select("id")
  //       .eq("user_id", userId);

    

  //     if (!existingCategories || existingCategories.length === 0) {
  //       await supabase.from("categories").insert([
  //         {
  //           category: "Today",
  //           user_id: userId!,
  //           position: 0,
  //           board : boardId,
            
  //         },
  //         {
  //           category: "Month",
  //           user_id: userId!,
  //           position: 1,
  //           board : boardId,
  //         },
  //         {
  //           category: "Year",
  //           user_id: userId!,
  //           position: 2,
  //           board : boardId,
  //         },
  //       ] as any);
  //     }
  //     setName("");
  //     setEmail("");
  //     setPassword("");
  //     toast.success("SignUp Successfully", { position: "top-center" });
  //     router.push("/login");
  //     console.log(error?.message);
  //   } catch (error: any) {
  //     toast.error("Something went Wrong", { position: "top-center" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

// new 
//   const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();
//   if (loading) return;
//   setLoading(true);

//   try {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { name },
//       },
//     });

//     if (error) {
//       toast.error(error.message);
//       return;
//     }

//     const userId = data?.user?.id;
//     if (!userId) return;

//     // 1. user insert
//     await supabase.from("users").insert([
//       {
//         id: userId,
//         email: data.user?.email,
//         name: data.user?.user_metadata?.name,
//       },
//     ] as any);

//     // 2. SAFE BOARD HANDLING (FIXED)
//     let boardId: string | null = null;

//     const { data: existingBoard, error: boardFetchError } = await supabase
//       .from("boards")
//       .select("*")
//       .eq("owner_id", userId)
//       .maybeSingle<Board>();

//     if (boardFetchError) {
//       console.error(boardFetchError);
//     }

//     if (existingBoard) {
//       boardId = existingBoard.id;
//     } else {
//       const { data: newBoard, error: boardInsertError } = await supabase
//         .from("boards")
//         .insert([
//           {
//             name: `${name} Board`,
//             owner_id: userId,
//           },
//         ] as any)
//         .select()
//         .single<Board>();

//       if (boardInsertError) throw boardInsertError;

//       boardId = newBoard.id;
//     }

//     // ⚠️ fallback safety (IMPORTANT)
//     if (!boardId) {
//       console.warn("No boardId found, skipping board relation");
//     }

//     // 3. categories ALWAYS CREATE (even without boardId)
//     const { data: existingCategories } = await supabase
//       .from("categories")
//       .select("id")
//       .eq("user_id", userId);

//     if (!existingCategories || existingCategories.length === 0) {
//       const { error: catError } = await supabase.from("categories").insert([
//         {
//           category: "Today",
//           user_id: userId,
//           position: 0,
//           board_id: boardId ?? null,
//         },
//         {
//           category: "Month",
//           user_id: userId,
//           position: 1,
//           board_id: boardId ?? null,
//         },
//         {
//           category: "Year",
//           user_id: userId,
//           position: 2,
//           board_id: boardId ?? null,
//         },
//       ]as any );

//       if (catError) {
//         console.error("Category insert error:", catError);
//       }
//     }

//     toast.success("SignUp Successfully");
//     router.push("/login");
//   } catch (error: any) {
//     console.error(error);
//     toast.error("Something went wrong");
//   } finally {
//     setLoading(false);
//   }
// };

const handleSignUp = async (e:React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  await SignUpHandler({setLoading,loading,email,password,name,router,})
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
    </section>
  );
}
