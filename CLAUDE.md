🔥 STEP 1: Board kab create hoga?

👉 Answer: Jab user pehli baar Todo create kare ya app open kare

Do approach hain:

👉 Login ke baad check karo:

// check user has board or not
const { data: boards } = await supabase
  .from("boards")
  .select("*")
  .eq("owner_id", user.id)

if (!boards || boards.length === 0) {
  const { data: newBoard } = await supabase
    .from("boards")
    .insert({
      name: "My Board",
      owner_id: user.id,
    })
    .select()
    .single()
}

👉 Is board_id ko:

categories me store karo
todos me already add kar chuke ho ✅
🔥 STEP 2: Share Button Flow
UI:

👉 Har board ya header me:

[ Share Button ]

Click → Modal open




🔥 STEP 3: Modal open hote hi link generate

👉 Link structure:

/board/[boardId]?token=xyz
Token generate (server action)
import { nanoid } from "nanoid";

const token = nanoid();

await supabase.from("invitations").insert({
  board_id: boardId,
  token,
  role: "viewer",
});
Final link:
const link = `${process.env.NEXT_PUBLIC_SITE_URL}/board/${boardId}?token=${token}`;

👉 Modal me show karo:

Copy button
Email invite button (later)



🔥 STEP 4: Viewer page (IMPORTANT)

Route:

/board/[boardId]
Yahan validate karo:
const { boardId } = params;
const token = searchParams.token;

const { data: invite } = await supabase
  .from("invitations")
  .select("*")
  .eq("token", token)
  .single();

if (!invite) {
  return "Access Denied";
}
🔥 STEP 5: Viewer ko sirf VIEW mode dena

👉 Yahan sabse important cheez:

const isViewer = true;

👉 Pass karo:

<TodoHome isViewer={true} />
UI me control:
{!isViewer && (
  <button onClick={addTodo}>Add Todo</button>
)}

👉 Disable karo:

Add
Delete
Edit
Drag & Drop
🔥 STEP 6: Real-time sync (Already done ✅)

Tum already ye kar chuke ho:

supabase.channel("todos-realtime")

👉 Iska benefit:

👀 Viewer automatically dekhega:

new todo
edit
drag
delete
🔥 STEP 7: Security (VERY IMPORTANT ⚠️)

Supabase me RLS (Row Level Security) lagao:

Todos policy:

👉 Owner full access:

user_id = auth.uid()

👉 Viewer read only:

board_id IN (
  SELECT board_id FROM board_memberships
  WHERE user_id = auth.uid()
)
🔥 FINAL FLOW (Simple Language)
User login
Board auto create (if not exists)
User clicks "Share"
Modal open → link generate
User copy/send link
Second user opens link
Token verify hota hai
Viewer mode open hota hai
Owner jo kare → viewer real-time dekhe 👀




action/share.ts
"use server";

import { createClient } from "@/app/lib/supabase/server";
import { nanoid } from "nanoid";

export async function generateShareLink(boardId: number) {
  const supabase = await createClient();

  const token = nanoid();

  const { error } = await supabase.from("invitations").insert({
    board_id: boardId,
    token,
    role: "viewer",
  });

  if (error) {
    console.error("Share error:", error);
    throw new Error("Failed to generate link");
  }

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/board/${boardId}?token=${token}`;

  return link;
}


// link generate function  
const handleOpenShareModal = async (boardId: number) => {
  setLoadingLink(true);

  try {
    await 
    const link = await generateShareLink(boardId);
    setShareLink(link);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingLink(false);
  }

  setShowShareModal(true);
};

copy function 
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(shareLink);
    alert("Link copied!");
  } catch (err) {
    console.error("Copy failed", err);
  }
};


