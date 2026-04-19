"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function BoardClient({ boardId, token, user }: any) {
  const { setPostLoginRedirect } = useAuth();

  useEffect(() => {
    if (!user) {
      setPostLoginRedirect(`/board/${boardId}?token=${token}`);
    }
  }, [user]);

  if (!user) {
    return (
      <div>
        <h2>Please login to continue</h2>
        <Link href="/login">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Shared Board 👀</h1>
    </div>
  );
}