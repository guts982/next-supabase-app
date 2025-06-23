"use client";
import React, { useState } from "react";
import FileShare from "./FileShare";
import { TextSearch } from "lucide-react";
import TextShare from "./TextShare";

const ShareBox = () => {
  return (
    <div className="w-full h-full shadow-md p-2 pb-5  rounded-md ">
      <h2 className="font-semibold text-2xl font-mono drop-shadow-md tracking-tighter  text-center text-green-500">
        Transfer Files and Texts{" "}
        <span className="text-orange-500 italic font-serif">Peer To Peer</span>{" "}
      </h2>

      <div className="mt-5 md:mt-10  w-full flex flex-col md:flex-row gap-4 md:gap-10 justify-center items-center ">
        <div className="w-full   min-h-[200px] min-w-[200px] rounded shadow-sm">
          <TextShare />
        </div>
        {/* <div className="border min-h-[200px] min-w-[200px] rounded shadow-sm">
          <FileShare  />
        </div> */}
      </div>
    </div>
  );
};

export default ShareBox;

function generatePeerId() {
  return "peer_" + Math.random().toString(36).substr(2, 9);
}
