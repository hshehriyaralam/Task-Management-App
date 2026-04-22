"use server";

import { nanoid } from 'nanoid';
import {Resend} from 'resend'
import { createClient } from '../lib/supabase/server'


const resend = new Resend(process.env.RESEND_API_KEY)


export const sendInvite = async (boardId: number, email: string, name: string) => {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    return { success: false, message: "User is not registered" };
  }

  const token = nanoid();

  const { error } = await supabase.from("invitations").insert([
    {
      board_id: boardId,
      email,
      token,
      role: "viewer",
      expires_at: new Date(Date.now() + 86400000),
    },
  ]);

  if (error) {
    return { success: false, message: error.message };
  }

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/board/${boardId}?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Board Invite",
    html: `<p>${name} invited to view board</p>
           <a href="${link}">Open Board</a>`,
  });

  return { success: true, link };
};