"use server";

import { nanoid } from 'nanoid';
import {Resend} from 'resend'
import { createClient } from '../lib/supabase/server'


const resend = new Resend(process.env.RESEND_API_KEY)


export const sendInvite =  async  (boardId : number, email : string) => {
  const supabase =  await createClient()

  // check user through email
      const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

    if(!user){
      console.log("user was not registered")
    }

    // generate token 
    const token = nanoid()


    const {error} = await supabase.from("invitations").insert([
      {
        board_id : boardId,
        email,
        token,
        role : "viewer",
        expires_at : new Date(Date.now() + 86400000)
      }
    ])

    if(error){
      console.log("add invitations Error", error.message )
    }

    // generate Link 
    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/board/${boardId}?token=${token}`

    // send email 
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to   : email,
      subject : "Board Invite",
      html :  `<p>You are invited to view board</p>
                <a href="${link}">${link}</a>`,
    })
      return link

}