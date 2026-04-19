import { createClient } from "@/app/lib/supabase/server";
import TodoHome from "@/app/pages/home";
import BoardClient from "@/components/boardClient";

export default async function Page({ params, searchParams }: any) {
  const supabase = await createClient();

   // ✅ unwrap both
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const boardId = resolvedParams.boardId
  const token = resolvedSearchParams.token;







  if (!token) return (<div>Access Denied</div>)

  const {
    data: { user },
  } = await supabase.auth.getUser();
;


  
  if (!user){
   <BoardClient
      boardId={boardId}
      token={token}
      user={user}
    />
  }
  
  // ✅ get invitation
  const { data: invite } = await supabase
  .from("invitations")
  .select("*")
  .eq("token", token)
  .single();
  

  if (!invite) {
    return <div>Invalid Link ❌</div>;
  }

  if (invite.board_id !== boardId) {
    return <div>Access Denied ❌</div>;
  }

  if (invite.email !== user?.email) {
    return <div>Unauthorized User ❌</div>;
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <div>Link Expired ⏰</div>;
  }

  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("board_id", boardId);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("board_id", boardId);

  return (
    <div>
      <h1>Shared Board 👀</h1>
      {/* <TodoHome/> */}
    </div>
  );
}