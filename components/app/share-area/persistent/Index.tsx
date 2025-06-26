"use client";

import { useEffect } from "react";
import { usePersistentShareContext } from "@/context/PersistentShareContext";
import { useAuthContext } from "@/context/AuthContext";
import TextContent from "./components/TextContent";

type Props = {
  roomId?: string | null;
};

const Index = ({ roomId = null }: Props) => {
  const { currentRoom, isInitiator, setCurrentRoomIdRef, joinOrCreateRoom } =
    usePersistentShareContext();

  const { clientId, guestUser, authUser } = useAuthContext();

  const isReady = !!clientId && (guestUser || authUser);

  //   useEffect(() => {
  //     if (!roomId) return;
  //     setCurrentRoomIdRef(roomId);
  //     if (isReady && roomId) {
  //       joinOrCreateRoom(false);
  //     }
  //   }, [isReady, roomId, setCurrentRoomIdRef, joinOrCreateRoom]);

  useEffect(() => {
    if (!roomId) return;
    setCurrentRoomIdRef(roomId);
    if (isReady && roomId) {
      joinOrCreateRoom(false);
    }
  }, [isReady, roomId]);

  return currentRoom ? (
    <div className="min-h-[70vh] mt-4 rounded-sm p-2 sm:p-4">
      <div className="w-full shadow-sm p-2 grid grid-cols-3 bg-lime-300/20 rounded-sm pb-1">
        <div className="md:col-span-1 w-full flex flex-col items-start justify-center text-sm">
          <div className="text-[.6rem] text-gray-500 dark:text-gray-400">
            ROOM ID{" "}
          </div>
          <div className="uppercase text-lime-500 font-semibold">
            {currentRoom.room_id}
          </div>
        </div>
        <div className="md:col-span-1 w-full text-xs text-center text-gray-500 dark:text-gray-400">
          PERSISTENT SHARE AREA
        </div>
        <div className="md:col-span-1 w-full flex flex-col items-end justify-center text-sm">
          <div className="text-[.6rem] text-gray-500 dark:text-gray-400">
            ROLE{" "}
          </div>
          <div className="uppercase text-lime-500 font-semibold">
            {isInitiator ? "OWNER" : "MEMBER"}
          </div>
        </div>
      </div>
      <TextContent />
    </div>
  ) : (
    <div className="border min-h-[70vh] mt-4 rounded-sm p-2 sm:p-4">
      Room not found!
    </div>
  );
};

export default Index;
