"use client";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browserClient";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { LogOut, Share } from "lucide-react";
import ShareModal from "./shareModal";

function Header({ userName, isViewer, boardId, token }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();
  const [shareModal, setShareModal] = useState(false);
  const params = new URLSearchParams();
  params.set('token', 'newToken');

  const handleLogOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success("Succcessfully LogOut", { position: "top-center" });
      // router.push("/login");
       if (isViewer) {
      const redirect = `/board/${boardId}?token=${token}`;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    } else {
      router.push("/login");
    }
      
    } catch (error) {
      toast.error("Logout failed", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section>
      <header className="z-50">
        <div className="flex items-center justify-between   mb-2">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Hello {isViewer ? "Viewer" : userName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isViewer && (
              <Button
                onClick={() => setShareModal(true)}
                className="bg-secondary  flex items-center   rounded-xl  w-34 py-5  shadow-sm border border-gray-100 font-quicksand font-semibold  text-gray-200   text-[14px]  cursor-pointer"
              >
                <>
                  Share Board
                  <Share className="w-4 text-gray-200" />
                </>
              </Button>
            )}

            <Button
            data-id="LogOut"
              className="bg-secondary  flex items-center   rounded-xl  w-30   py-5  shadow-sm border border-gray-100 font-quicksand font-semibold  text-gray-200   text-md  cursor-pointer   "
              onClick={handleLogOut}
            >
              {loading ? (
                <Spinner className="size-6" />
              ) : (
                <>
                  LogOut <LogOut className="w-4 text-gray-200" />
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {shareModal && <ShareModal 
      setShareModal={setShareModal}
      name={userName}
      />}
    </section>
  );
}

export default React.memo(Header);
