"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSignalingContext } from "@/context/SignalContext";

const PC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const useSignaling = () => {
  const {
    roomId,
    setRoomId,
    peerId,
    setPeerId,
    peerConnection,
    setPeerConnection,
    isInitiator,
    setIsInitiator,
    status,
    setStatus,
  } = useSignalingContext();

  const supabase = createClient();

  const checkIfExistingPeersInRoom = async () => {
    const { data: existingPeers } = await supabase
      .from("signaling")
      .select("peer_id")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(10);
    const isIni = !existingPeers || existingPeers.length === 0;
    setIsInitiator(isIni);
    return isIni;
  };

  useEffect(() => {
    if (!!roomId && !!peerId) {
      setStatus("Connecting to room...");
      const isIni = checkIfExistingPeersInRoom();
      setPeerConnection(new RTCPeerConnection(PC_CONFIG));
    }
  }, [roomId, peerId]);

  useEffect(() => {}, []);

  return {};
};

export default useSignaling;




export function generatePeerId() {
  return "peer_" + generateRandomString(8);
}
export function generateRoomId() {
  return "room_" + generateRandomString(4);
}

function generateRandomString(length: number) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

