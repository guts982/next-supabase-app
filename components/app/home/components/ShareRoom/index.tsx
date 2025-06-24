"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const ShareRoom = () => {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="border border-blue-200 shadow-md rounded-sm  p-4 flex flex-col justify-center items-center gap-2 ">
      <h2 className="font-semibold text-2xl font-mono drop-shadow-md tracking-tighter  text-center text-green-500">
        Transfer Files and Texts (
        <span className="text-blue-500 italic font-serif">Persistent</span>){" "}
      </h2>
      <Input
        placeholder="room123"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className=""
      />
      <Button className={`w-full bg-blue-500 text-white`} variant={"default"} >
        Create/Join Room
      </Button>
    </div>
  );
};

export default ShareRoom;
