"use client";

import { createClient } from "@/lib/client";
import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectionState = "disconnected" | "connecting" | "connected";
export interface Message {
  text: string;
  timestamp: number;
  isSent: boolean;
}

const CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const useWebRTC = () => {
  const supabase = createClient();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const peerIdRef = useRef<string>(generatePeerId());
  const isInitiatorRef = useRef<boolean>(false);
  const signalChannelRef = useRef<any>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const setupWebRTC = useCallback(() => {
    const pc = new RTCPeerConnection(CONFIG);
    pcRef.current = pc;

    // Create data channel for messages (initiator only)
    if (isInitiatorRef.current) {
      const dataChannel = pc.createDataChannel("messages");
      // setupDataChannel(dataChannel);
    }

    // Handle incoming data channel
    pc.ondatachannel = (event) => {
      // setupDataChannel(event.channel);
    };
  }, []);

  const setupDataChannel = useCallback((channel: RTCDataChannel) => {
    dataChannelRef.current = channel;
    channel.onopen = () => {
      console.log("Data channel opened!");
      setConnectionState("connected");
    };
    channel.onclose = () => {
      console.log("Data channel closed!");
      setConnectionState("disconnected");
    };
    channel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        {
          text: message.text,
          timestamp: message.timestamp,
          isSent: false,
        },
      ]);
    };
    channel.onerror = (error) => {
      console.error("Data channel error:", error);
    };
  }, []);

  const sendSignal = useCallback(
    async (signal: any) => {
      if (!supabase || !currentRoomId) {
        console.error(
          "Failed to send signal as supabase or roomid not initialized!"
        );
        return;
      }
      try {
        await supabase.from("signaling").insert({
          room_id: currentRoomId,
          peer_id: peerIdRef.current,
          type: signal.type,
          data: signal,
        });
      } catch (error) {
        console.error("Error sending signal: ", error);
      }
    },
    [supabase, currentRoomId]
  );

  const handleSignal = useCallback(
    async (signal: any) => {
      if (!pcRef.current) {
        console.error("Failed to handle signal, pc not defined!");
        return;
      }
      try {
        const data = signal.data;
        switch (data.type) {
          case "offer":
            await pcRef.current?.setRemoteDescription(data.offer);
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            await sendSignal({
              type: "answer",
              answer: answer,
            });
            break;

          case "answer":
            await pcRef.current.setRemoteDescription(data.answer);
            break;

          case "ice-candidate":
            await pcRef.current.addIceCandidate(data.candidate);
            break;
        }
      } catch (error) {
        console.error("Error handling signal: ", error);
      }
    },
    [sendSignal]
  );

  const setupSignaling = useCallback(async () => {
    if (!supabase || !currentRoomId) {
      console.error(
        "Failed to setup signaling as supabase or roomid not initialized!"
      );
      return;
    }
    // Subscribe to signaling messages
    const channel = supabase
      .channel(`supabase-${currentRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signaling",
          filter: `room_id=eq.${currentRoomId}`,
        },
        async (payload) => {
          const signal = payload.new;

          // Ignore self messages
          if (signal.peer_id == peerIdRef.current) {
            console.log(`Self message!`);
            return;
          }
          console.log("Received signal: ", signal.type);
          await handleSignal(signal);
        }
      )
      .subscribe();

    signalChannelRef.current = channel;
  }, [supabase, currentRoomId, handleSignal]);

  const createOffer = useCallback(async () => {
    if (!pcRef.current) {
      console.error("Failed to create offer, pc not defined!");
      return;
    }
    try {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        await sendSignal({
            type:'offer',
            offer: offer
        });
    } catch (error) {
        console.error('Error creating offer: ', error)
    }
  }, [sendSignal]);

  const updateConnectionState = useCallback(()=>{
    const pc = pcRef.current;
    const dataChannel = dataChannelRef.current;
    if(dataChannel && dataChannel.readyState == 'open') {
        setConnectionState('connected');
    } else if (pc && (pc.connectionState == 'connecting' || pc.iceConnectionState == 'checking')) {
          setConnectionState('connecting');
    } else {
        setConnectionState('disconnected');
    }
  },[])

  const joinRoom = useCallback(async (roomId: string) => {
    if (!supabase) {
         throw new Error( "Failed to join room as supabase not initialized!");
    }
    setCurrentRoomId(roomId);
    setConnectionState("connecting");
    const { data: existingPeers } = await supabase
      .from("signaling")
      .select("peer_id")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(10);

    isInitiatorRef.current = !existingPeers || existingPeers.length == 0;
    // Setup WebRTC and signaling
    setupWebRTC();
    await setupSignaling();

    // If initiator, create offer after a short delay
     if (isInitiatorRef.current) {
      setTimeout(() => createOffer(), 1000);
    }
  }, [supabase, setupWebRTC, setupSignaling, createOffer]);


  const sendMessage = useCallback((text:string) => {
  const dataChannel = dataChannelRef.current;
      if (!text.trim() || !dataChannel || dataChannel.readyState !== 'open') {
        console.error('Data channel not ready!')
      return false;
    }
  },[])

  useEffect(() => {}, [supabase]);

  return {};
};

export default useWebRTC();

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
