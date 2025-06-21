"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { createClient } from "@/lib/client";

interface SignalingContextProps {
  status: string;
  setStatus: (st: string) => void;

  peerId: string | null;
  setPeerId: (id: string | null) => void;

  roomId: string | null;
  setRoomId: (id: string | null) => void;

  peerConnection: RTCPeerConnection | null;
  setPeerConnection: (conn: RTCPeerConnection | null) => void;

  isInitiator: boolean;
  setIsInitiator: (loading: boolean) => void;
}

const SignalingContext = createContext<SignalingContextProps | undefined>(
  undefined
);

const PC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const SignalingContextProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<string>("");

  const [peerId, setPeerId] = useState<string | null>(null); //generatePeerId());
  const [roomId, setRoomId] = useState<string | null>(null); //generateRoomId());
  //   const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);

  return (
    <SignalingContext.Provider
      value={{
        status,
        setStatus,
        peerId,
        setPeerId,
        roomId,
        setRoomId,
        peerConnection,
        setPeerConnection,
        isInitiator,
        setIsInitiator,
      }}
    >
      {children}
    </SignalingContext.Provider>
  );
};

export const useSignalingContext = () => {
  const context = useContext(SignalingContext);
  if (!context) {
    throw new Error("useSignaling must be used within a SignalingContext");
  }
  return context;
};
