"use server";

import { createClient } from "@/app/lib/supabase/server";
import { nanoid } from "nanoid";

export async function sendInvite(boardId: number, email: string) {
  const supabase = await createClient();

  const token = nanoid();

  const { error } = await supabase.from("invitations").insert([
    {
      board_id: boardId,
      email,
      token,
      role: "viewer",
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), 
    },
  ]);

  if (error) throw new Error("Invite failed");

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/board/${boardId}?token=${token}`;

  return link;
}