
"use client";

import { useEffect, useState, useRef } from "react";
import { usePersistentShareContext } from "@/context/PersistentShareContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

// Simple time formatting function to replace date-fns
const formatTimeAgo = (date:string) => {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  return `${diffInDays}d`;
};

const TextContent = () => {
  const [newText, setNewText] = useState("");
  const scrollAreaRef = useRef(null);
  const { roomMessages, createRoomMessage, setCurrentRoomMessageRef } =
    usePersistentShareContext();
  const { authUser, guestUser } = useAuthContext();
  useEffect(() => {
    setCurrentRoomMessageRef(newText);
  }, [newText, setCurrentRoomMessageRef]);

  // Enhanced scroll to top functionality
  useEffect(() => {
    if(roomMessages && roomMessages?.length) {
      setNewText(roomMessages[0].content)
    }
    if (scrollAreaRef.current) {
     const viewport = (scrollAreaRef.current as HTMLElement)?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [roomMessages]);

  

  return (
    <div className="grid grid-cols-5 pt-2 gap-2">
      <div className="col-span-4 flex flex-col justify-center items-center">
        <Textarea
          value={newText}
          className="shadow-lg border rounded-sm border-lime-500/30 h-full min-h-[60vh]"
          onChange={(e) => setNewText(e.target.value)}
        />
        <div className="pt-2 grid grid-cols-5 w-full items-center gap-2">
          <Button className="shadow-md col-span-2 md:col-span-1 bg-rose-600/80 dark:bg-rose-500/50 text-white">
            <X className="h-4 w-4" /> Clear
          </Button>
          <Button
            onClick={createRoomMessage}
            className="shadow-md col-span-3 md:col-span-4 bg-lime-600/90 dark:bg-lime-500/50 text-white"
          >
            <Send className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 border p-1 rounded-sm border-lime-500/30">
        <h3 className="bg-lime-300/20 rounded-sm p-1 text-xs text-lime-500 text-center">
          Older Texts ({roomMessages?.length})
        </h3>
        <ScrollArea ref={scrollAreaRef} className="h-[60vh] col-span-1 rounded-sm">
          <div className="w-full flex flex-col gap-3 p-1">
            {roomMessages?.length ? (
             roomMessages.map((msg: { id: string | number; content: string; sender_user_id?: string; sender_guest_id?: string; sent_at: string }) => (
                <div
                  key={msg.id}
                  onClick={() => setNewText(msg.content)}
                  className="w-full cursor-pointer p-1 rounded-sm transition-all duration-300 
                           bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-900/20 dark:to-emerald-800/30 
                           border border-emerald-200/60 dark:border-emerald-700/40 
                           hover:border-emerald-300/80 dark:hover:border-emerald-600/60
                           hover:shadow-lg hover:shadow-emerald-200/40 dark:hover:shadow-emerald-900/30
                           hover:scale-[1.02] hover:-translate-y-0.5
                           active:scale-[0.98] active:translate-y-0 "
                >
                  <div className="text-sm text-emerald-800 dark:text-emerald-100 line-clamp-3 leading-relaxed font-medium">
                    {msg.content}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-700/50">
                   <div className="text-xs text-gray-500 dark:text-gray-400">
                    {
                      authUser && (authUser.id == msg.sender_user_id ) ? (<div className="text-blue-500 dark:text-blue-400">You</div>) :
                       guestUser && (guestUser.id == msg.sender_guest_id ) ? (<div className="text-blue-500 dark:text-blue-400">You</div>) : <div className="text-yellow-500 dark:text-yellow-400">Anonym</div>
                    }
                   </div>

                    <div className="flex justify-center items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400/60 dark:bg-emerald-500/60"></div>
                    <div className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatTimeAgo(msg.sent_at)} {formatTimeAgo(msg.sent_at).includes('now') ? "" : "ago"}
                    </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 dark:text-gray-500 italic px-2 py-8 text-center">
                No messages yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TextContent;



// "use client";

  // import { useEffect, useState } from "react";
  // import { usePersistentShareContext } from "@/context/PersistentShareContext";
  // import { Button } from "@/components/ui/button";
  // import { ScrollArea } from "@/components/ui/scroll-area";
  // import { Textarea } from "@/components/ui/textarea";
  // import { Send, X } from "lucide-react";
  // import { formatDistanceToNowStrict } from "date-fns";

  // const TextContent = () => {
  //   const [newText, setNewText] = useState("");
  //   const { roomMessages, createRoomMessage, setCurrentRoomMessageRef } =
  //     usePersistentShareContext();

  //   useEffect(() => {
  //     setCurrentRoomMessageRef(newText);
  //   }, [newText, setCurrentRoomMessageRef]);

  //   useEffect(()=>{
  //     // scroll the scroll area to top
  //   },[roomMessages])

  //   return (
  //     <div className="grid grid-cols-5 pt-2 gap-2">
  //       <div className="col-span-4 flex flex-col justify-center items-center">
  //         <Textarea
  //           value={newText}
  //           className="shadow-lg border rounded-sm border-lime-500/30 h-full min-h-[60vh]"
  //           onChange={(e) => setNewText(e.target.value)}
  //         />
  //         <div className="pt-2 grid grid-cols-5 w-full items-center gap-2">
  //           <Button className="shadow-md col-span-2 md:col-span-1 bg-rose-600/80 dark:bg-rose-500/50 text-white">
  //             <X className="h-4 w-4" /> Clear
  //           </Button>
  //           <Button
  //             onClick={createRoomMessage}
  //             className="shadow-md col-span-3 md:col-span-4 bg-lime-600/90 dark:bg-lime-500/50 text-white"
  //           >
  //             <Send className="h-4 w-4" /> Upload
  //           </Button>
  //         </div>
  //       </div>
  //       <div className="flex flex-col gap-2 border p-1 rounded-sm border-lime-500/30">
  //         <h3 className="bg-lime-300/20 rounded-sm p-1 text-xs text-lime-500 text-center">
  //           Older Texts
  //         </h3>
  //         <ScrollArea className="h-[60vh] col-span-1 rounded-sm">
  //           <div className="w-full flex flex-col gap-2">
  //             {roomMessages?.length ? (
  //               roomMessages.map((msg: any) => (
  //                 <div
  //                   key={msg.id}
  //                   onClick={()=>setNewText(msg.content)}
  //                   className="w-full cursor-pointer  p-1 rounded-lg bg-orange-100 dark:bg-orange-800/30 border border-orange-300 dark:border-orange-500 shadow-sm hover:shadow-md transition-shadow"

  //                 >
  //                   <div className="text-sm text-gray-800 dark:text-gray-100 line-clamp-2">
  //                     {msg.content}
  //                   </div>
  //                   <div className="text-[0.7rem] text-right text-gray-500 dark:text-gray-400 ">
  //                     {formatDistanceToNowStrict(new Date(msg.sent_at))} ago
  //                   </div>
  //                 </div>
  //               ))
  //             ) : (
  //               <div className="text-sm text-gray-400 dark:text-gray-500 italic px-2 py-4 text-center">
  //                 No messages yet.
  //               </div>
  //             )}
  //           </div>
  //         </ScrollArea>
  //       </div>
  //     </div>
  //   );
  // };

  // export default TextContent;
