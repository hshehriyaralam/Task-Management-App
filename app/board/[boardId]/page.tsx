import { createClient } from "@/app/lib/supabase/server";
import BoardClient from "@/components/boardClient";
import { cookies } from "next/headers";

export default async function Page({ params, searchParams }: any) {
  const supabase = await createClient();

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const boardId = resolvedParams.boardId;
  const token = resolvedSearchParams.token;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(
    "sb-xilzbhrcplvgwljkwtsb-auth-token",
  )?.value;

  if (!token) {
    return(
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 
       font-quicksand">
        <div  className="w-full h-full flex items-center justify-center flex-col gap-4 mt-60">
          Access Denied ❌
        </div>
        </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <BoardClient
      boardId={boardId}
      token={token}
      user={user}
      accessToken={accessToken}
    />
  );
}
