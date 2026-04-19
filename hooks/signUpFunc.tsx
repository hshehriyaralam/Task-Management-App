"use client";

import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import { toast } from "sonner";

type Board = {
  id: string;
  owner_id: string;
  name: string;
};

export const SignUpHandler = async ({
  setLoading,
  loading,
  email,
  password,
  name,
  router,
}: any) => {
  if (loading) return;
  setLoading(true);

  const supabase = getSupabaseBrowserClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const userId = data?.user?.id;
    if (!userId) return;

    // 1. user insert
    await supabase.from("users").insert([
      {
        id: userId,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
      },
    ] as any);

    // 2. SAFE BOARD HANDLING (FIXED)
    let boardId: string | null = null;

    const { data: existingBoard, error: boardFetchError } = await supabase
      .from("boards")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle<Board>();

    if (boardFetchError) {
      console.error(boardFetchError);
    }

    if (existingBoard) {
      boardId = existingBoard.id;
    } else {
      const { data: newBoard, error: boardInsertError } = await supabase
        .from("boards")
        .insert([
          {
            name: `${name} Board`,
            owner_id: userId,
          },
        ] as any)
        .select()
        .single<Board>();

      if (boardInsertError) throw boardInsertError;

      boardId = newBoard.id;
    }

    if (!boardId) {
      console.warn("No boardId found, skipping board relation");
    }

    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId);

    if (!existingCategories || existingCategories.length === 0) {
      const { error: catError } = await supabase.from("categories").insert([
        {
          category: "Today",
          user_id: userId,
          position: 0,
          board_id: boardId ?? null,
        },
        {
          category: "Month",
          user_id: userId,
          position: 1,
          board_id: boardId ?? null,
        },
        {
          category: "Year",
          user_id: userId,
          position: 2,
          board_id: boardId ?? null,
        },
      ] as any);

      if (catError) {
        console.error("Category insert error:", catError);
      }
    }

    toast.success("SignUp Successfully", {position : 'top-center'});
    router.push("/login");
  } catch (error: any) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};
