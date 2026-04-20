"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/app/lib/supabase/client";
import Link from "next/link";
import TodoHome from "@/app/pages/home";
import Header from "./header";
import Loading from "./loading";

export default function BoardClient({
  boardId,
  token,
  user,
  accessToken,
}: any) {
  const supabase = createClient();
  const { setPostLoginRedirect } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isViewer, setIsViewer] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [todos, setTodos] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);

  useEffect(() => {
    if (!user) {
      setPostLoginRedirect(`/board/${boardId}?token=${token}`);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      const { data: invite } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .single();

      
      if (
        !invite ||
        invite.board_id !== boardId ||
        invite.email !== user.email ||
        new Date(invite.expires_at) < new Date()
      ) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data: member } = await supabase
        .from("board_members")
        .select("*")
        .eq("board_id", boardId)
        .eq("user_id", user.id)
        .single();

      if (!member) {
        await supabase.from("board_members").insert({
          board_id: boardId,
          user_id: user.id,
          role: invite.role || "viewer",
        });
      }

      const role = member?.role || invite.role;
      setIsViewer(role === "viewer");

      
      setHasAccess(true);

      
      const { data: todosData } = await supabase
        .from("todos")
        .select("*")
        .eq("board_id", boardId);

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("board_id", boardId);

      setTodos(todosData || []);
      setCategories(categoriesData || []);

      setLoading(false);
    };

    init();
  }, [user]);

  // ✅ FIX: Real-time subscription now depends on hasAccess
  // Previously it would open for ANY logged-in user, mixing data between users
  useEffect(() => {
    if (!user || !hasAccess) return; // ✅ Guard added

    const channel = supabase
      .channel(`board-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `board_id=eq.${boardId}`,
        },
        async () => {
          const { data } = await supabase
            .from("todos")
            .select("*")
            .eq("board_id", boardId);

          setTodos(data || []);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, hasAccess]); 

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 font-quicksand">
        <div className="w-full h-full flex items-center justify-center flex-col gap-4 mt-60">
          <h2 className="text-3xl font-bold text-gray-800">
            Please login to continue 🔐
          </h2>
          <Link
            className="bg-secondary flex items-center rounded-xl w-20 py-2 text-center shadow-sm border border-gray-100 font-quicksand font-semibold text-gray-200 flex items-center justify-center cursor-pointer"
            href={{
              pathname: "/login",
              query: {
                redirect: `/board/${boardId}?token=${token}`,
              },
            }}
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 font-quicksand">
        <div className="w-full h-full flex items-center justify-center flex-col gap-4 mt-60">
          Access Denied ❌
        </div>
      </div>
    );
  }

  return (
    <section
      className="min-h-screen bg-gradient-to-br
                 from-gray-50 via-white to-gray-50  font-quicksand"
    >
      <div className="max-w-7xl mx-auto p-6 lg:p-4">
        <Header isViewer={isViewer} />
        <TodoHome
          todos={todos}
          categories={categories}
          accessToken={accessToken}
          isViewer={isViewer}
          boardId={boardId}
        />
      </div>
    </section>
  );
}