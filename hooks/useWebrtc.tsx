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
  const [currentRoomId, setCurrentRoomId] = useState<string>("");
  const currentRoomIdRef = useRef<string>("");

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
      setupDataChannel(dataChannel);
    }

    // Handle incoming data channel
    pc.ondatachannel = (event) => {
      console.log("Data channel received!");
      setupDataChannel(event.channel);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      console.log("ICE channel received!");
      if (event.candidate) {
        sendSignal({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      updateConnectionState();
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      updateConnectionState();
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
      console.log("Sending Signal: ", signal);
      if (!supabase) {
        console.error("Failed to send signal as supabase not initialized!");
        return;
      }
      if (!currentRoomIdRef.current) {
        console.error("Failed to send signal as roomid not initialized!");
        return;
      }
      try {
        await supabase.from("signaling").insert({
          room_id: currentRoomIdRef.current,
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
            console.log("Received offer:", data);
            await pcRef.current?.setRemoteDescription(data.offer);
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            await sendSignal({
              type: "answer",
              answer: answer,
            });
            break;

          case "answer":
            console.log("Received answer:", data);
            await pcRef.current.setRemoteDescription(data.answer);
            break;

          case "ice-candidate":
            console.log("Received ICE candidate:", data);
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
    if (!supabase) {
      console.error("Failed to setup signaling as supabase not initialized!");
      return;
    }
    if (!currentRoomIdRef.current) {
      console.error("Failed to setup signaling as roomid not initialized!");
      return;
    }
    // Subscribe to signaling messages
    const channel = supabase
      .channel(`supabase-${currentRoomIdRef.current}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signaling",
          filter: `room_id=eq.${currentRoomIdRef.current}`,
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
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    signalChannelRef.current = channel;
  }, [supabase, handleSignal]);

  const createOffer = useCallback(async () => {
    if (!pcRef.current) {
      console.error("Failed to create offer, pc not defined!");
      return;
    }
    try {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      await sendSignal({
        type: "offer",
        offer: offer,
      });
    } catch (error) {
      console.error("Error creating offer: ", error);
    }
  }, [sendSignal]);

  const updateConnectionState = useCallback(() => {
    const pc = pcRef.current;
    const dataChannel = dataChannelRef.current;
    if (dataChannel && dataChannel.readyState == "open") {
      setConnectionState("connected");
    } else if (
      pc &&
      (pc.connectionState == "connecting" ||
        pc.iceConnectionState == "checking")
    ) {
      setConnectionState("connecting");
    } else {
      setConnectionState("disconnected");
    }
  }, []);

  const joinRoom = useCallback(async () => {
    if (!supabase) {
      throw new Error("Failed to join room as supabase not initialized!");
    }
    if (!currentRoomIdRef.current) {
      console.error("Failed to join room as roomid not initialized!");
      return;
    }
    setConnectionState("connecting");
    // Register peer in the peer_sessions table
    await supabase.from("peer_sessions").insert({
      room_id: currentRoomIdRef.current,
      peer_id: peerIdRef.current,
    });
    const { data: existingPeers } = await supabase
      .from("signaling")
      .select("peer_id")
      .eq("room_id", currentRoomIdRef.current)
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

    if (!isInitiatorRef.current) {
      // Check for existing offer in the room
      const { data: signals } = await supabase
        .from("signaling")
        .select("*")
        .eq("room_id", currentRoomIdRef.current)
        .order("created_at", { ascending: true });

      if (signals && signals.length > 0) {
        for (const signal of signals) {
          if (signal.peer_id !== peerIdRef.current) {
            console.log("[Late Join] Processing past signal:", signal.type);
            await handleSignal(signal);
          }
        }
      }
    }
  }, [supabase, setupWebRTC, setupSignaling, createOffer, handleSignal]);

  const sendMessage = useCallback((text: string) => {
    const dataChannel = dataChannelRef.current;
    if (!text.trim() || !dataChannel || dataChannel.readyState !== "open") {
      console.error("Data channel not ready!");
      return false;
    }
    const message = {
      text: text.trim(),
      timestamp: Date.now(),
    };

    // Send through WebRTC data channel
    dataChannel.send(JSON.stringify(message));

    // Add to local messages
    setMessages((prev) => [
      ...prev,
      {
        text: message.text,
        timestamp: message.timestamp,
        isSent: true,
      },
    ]);

    return true;
  }, []);

  // const disconnect = useCallback(() => {
  //   // Close data channel
  //   if (dataChannelRef.current) {
  //     dataChannelRef.current.close();
  //     dataChannelRef.current = null;
  //   }

  //   // Close peer connection
  //   if (pcRef.current) {
  //     pcRef.current.close();
  //     pcRef.current = null;
  //   }

  //   // Unsubscribe from signaling
  //   if (signalChannelRef.current) {
  //     signalChannelRef.current.unsubscribe();
  //     signalChannelRef.current = null;
  //   }

  //   setConnectionState("disconnected");
  //   setCurrentRoomId("");
  //   setMessages([]);
  // }, []);

  const disconnect = useCallback(async () => {
    // Unregister this peer from peer_sessions
    await supabase
      .from("peer_sessions")
      .delete()
      .eq("room_id", currentRoomIdRef.current)
      .eq("peer_id", peerIdRef.current);

    // Check if any peers remain in the room
    const { data: remainingPeers, error } = await supabase
      .from("peer_sessions")
      .select("id")
      .eq("room_id", currentRoomIdRef.current);

    if (!error && remainingPeers && remainingPeers.length === 0) {
      console.log("Last peer disconnected. Cleaning up signaling messages...");
      await supabase
        .from("signaling")
        .delete()
        .eq("room_id", currentRoomIdRef.current);
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Unsubscribe from signaling
    if (signalChannelRef.current) {
      signalChannelRef.current.unsubscribe();
      signalChannelRef.current = null;
    }

    setConnectionState("disconnected");
    setCurrentRoomId("");
    setMessages([]);
  }, []);

  useEffect(() => {
    currentRoomIdRef.current = currentRoomId;
  }, [currentRoomId]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    pcRef,
    supabase,
    connectionState,
    messages,
    currentRoomId,
    setCurrentRoomId,
    joinRoom,
    sendMessage,
    disconnect,
    canSendMessage: connectionState === "connected",
  };
};

export default useWebRTC;

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
