"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePersistentShareContext } from "@/context/PersistentShareContext";
import React from "react";

const PersistentShare = () => {
  const { roomId, setRoomId,  joinOrCreateRoom} = usePersistentShareContext();

  return (
    <div className="border border-blue-300 bg-blue-100/50 dark:bg-blue-800/30 shadow-md rounded-sm  p-4 flex flex-col justify-center items-center gap-2 ">
      <h2 className="font-semibold text-2xl font-mono drop-shadow-md tracking-tighter  text-center text-green-500">
        Transfer Files and Texts (
        <span className="text-blue-500 italic font-serif">Persistent</span>)
      </h2>
      <Input
        placeholder="room123"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="bg-white dark:bg-black"
      />
      <Button className={`w-full bg-blue-500 text-white hover:bg-black`} onClick={()=>joinOrCreateRoom()} variant={"default"} >
        Create/Join Room
      </Button>
    </div>
  );
};

export default PersistentShare;
