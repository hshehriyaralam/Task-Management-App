

check user already registerd
Insert Invitation 
Generate links 
send email 



import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvite(boardId: number, email: string) {
  const supabase = await createClient();

  // 1. check user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    throw new Error("User not registered");
  }

  // 2. generate token
  const token = nanoid();

  // 3. save invitation
  await supabase.from("invitations").insert([
    {
      board_id: boardId,
      email,
      token,
      role: "viewer",
      expires_at: new Date(Date.now() + 86400000),
    },
  ]);

  // 4. generate link
  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/board/${boardId}?token=${token}`;

  // 5. send email
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Board Invite",
    html: `<p>You are invited to view board</p>
           <a href="${link}">Open Board</a>`,
  });

  return link;
}