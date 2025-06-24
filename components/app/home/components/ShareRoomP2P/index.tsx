"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const ShareRoomP2P = () => {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="border border-orange-200  shadow-md rounded-sm  p-4 flex flex-col justify-center items-center gap-2 ">
      <h2 className="font-semibold text-2xl font-mono drop-shadow-md tracking-tighter  text-center text-green-500">
        Transfer Files and Texts (
        <span className="text-orange-500 italic font-serif">Peer to Peer</span>){" "}
      </h2>
      <Input
        placeholder="room123"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className=""
      />
      <Button className={`w-full bg-orange-500 text-white`} variant={"default"}>
        Create/Join Room
      </Button>
    </div>
  );
};

export default ShareRoomP2P;
