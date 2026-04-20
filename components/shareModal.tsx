"use client";

import { CircleX, Share } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { sendInvite } from "@/app/(action)/sendEmail";
import { Spinner } from "./ui/spinner";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

const ShareModal = ({ setShareModal }: any) => {
  const { board } = useAppContext();
  const [loadingShare, setLoadingShare] = useState(false);
  const [email, setEmail] = useState("");
  const boardId = board?.id;

  const handleSendEmail = async () => {
    try {
      setLoadingShare(true);
      await sendInvite(boardId, email);
      setShareModal(false);
      toast.success("Successfully Send Email", { position: "top-center" });
      setEmail("");
    } catch (error: any) {
      toast.error(error.message, { position: "top-center" });
    } finally {
      setLoadingShare(false);
    }
  };

  return (
    <section
      className="fixed inset-0 bg-black/30 
          backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-[450px] shadow-xl animate-fadeIn"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold teaxt-gray-800">Share board</h2>
          <CircleX
            onClick={() => setShareModal(false)}
            className="w-6 h-6  cursor-pointer
                 text-red-500  transition-colors"
          />
        </div>
        <div className="flex gap-3 justify-center ">
          <input
            required
            name="Link"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all
                 text-gray-700 mb-4"
          />
          <Button
            onClick={handleSendEmail}
            type="submit"
            className="flex-1 py-5 w-30  rounded-lg bg-secondary text-white text-sm  font-medium hover:bg-secondary/80 transition-all duration-200 text-[15px]   cursor-pointer "
          >
            {loadingShare ? (
              <Spinner className="size-6" />
            ) : (
              <>
                Share Link <Share className="size-4" />
              </>
            )}
          </Button>
        </div>

        {/* <div className="flex gap-2">
                <input
                required
                name="category"
                type="text"
                placeholder=""
                className="w-full px-4 py-1 rounded-lg border border-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all
                 text-gray-700 mb-4"
                />

                <Button
                  type="submit"
                  className="flex-1 py-4 rounded-lg bg-blue-500
                   text-white font-medium hover:   hover:bg-blue-400
                   transition-all duration-200 text-sm  cursor-pointer">
                  Copy Link
                </Button>
              </div> 


              <div className="flex gap-4 " >
                 <Button
                 onClick={() =>  GenerateLink() }
                    type="submit"
                  className="flex-1 py-5  px-2 rounded-lg bg-secondary text-white text-sm  font-medium hover:bg-secondary/80 transition-all duration-200 text-md  cursor-pointer "
                >
                  {loadingLink ? <Spinner  className="size-6" />  : 'Generate Link'}
                </Button>

                 <Button
                  type="submit"
                  className="flex-1 py-5  px-2 rounded-lg bg-secondary text-white text-sm  font-medium hover:bg-secondary/80 transition-all duration-200 text-md  cursor-pointer "
                >
                Delete Link
                </Button>


              </div> */}
      </div>
    </section>
  );
};

export default ShareModal;
