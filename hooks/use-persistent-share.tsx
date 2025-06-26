"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { useAuthContext } from "@/context/AuthContext";

type Room = {
  room_id: string;
  user_id?: string;
  guest_id?: string;
  [key: string]: any;
};

const usePersistentShare = () => {
  const supabase = createClient();
  const router = useRouter();
  const { clientId, guestUser, authUser } = useAuthContext();

  const [displayTextContent, setDisplayTextContent] = useState("");

  const [roomId, setRoomId] = useState<string>("");
  const [roomMessages, setRoomMessages] = useState<any>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isInitiator, setIsInitiator] = useState<boolean>(false);

  const currentRoomIdRef = useRef<string>("");
  const currentRoomRef = useRef<any>("");
  const currentRoomMessageRef = useRef<string>("");

  const setCurrentRoomIdRef = useCallback((id: string) => {
    currentRoomIdRef.current = id;
  }, []);

  const setCurrentRoomMessageRef = (newText: string) => {
    currentRoomMessageRef.current = newText;
  };

  const handleToastError = (msg: string, log?: any) => {
    if (log) console.error(msg, log);
    toast.error(msg, { position: "top-right", richColors: true });
  };

  const determineInitiator = (room: Room) => {
    if (authUser?.id === room.user_id || guestUser?.id === room.guest_id) {
      setIsInitiator(true);
    } else {
      setIsInitiator(false);
    }
  };

  const createNewRoom = async (): Promise<Room | null> => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    if (!guestUser || !authUser) {
      console.log("NO AUTH OR GUEST", authUser, guestUser);
    }
    const newRoom: Partial<Room> = {
      room_id: currentRoomIdRef.current,
      type: "persistent",
      password: null,
      metadata: {},
      expires_at: expiresAt.toISOString(),
    };

    if (authUser) {
      newRoom.user_id = authUser.id;
    } else if (guestUser) {
      newRoom.guest_id = guestUser.id;
    } else {
      handleToastError("No user identified (guest or logged-in)");
      return null;
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert(newRoom)
      .select("*")
      .single();

    if (error) {
      handleToastError("Failed to create new room", error);
      return null;
    }

    toast.success(
      <div className="flex flex-col gap-1 items-start">
        <div>Room created successfully.</div>
        <div>ID: {currentRoomIdRef.current}</div>
      </div>,
      { position: "top-right", richColors: true }
    );

    return data;
  };

  const joinOrCreateRoom = useCallback(
    async (redirect: boolean = true): Promise<Room | void> => {
      if (!supabase) {
        handleToastError("Supabase not initialized!");
        return;
      }

      const roomId = currentRoomIdRef.current;
      if (!roomId.trim()) {
        handleToastError("Room ID not defined!");
        return;
      }

      const { data: existingRooms, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_id", roomId);

      if (error) {
        handleToastError("Failed to check for existing room", error);
        return;
      }

      if (existingRooms?.length) {
        const room = existingRooms[0];
        determineInitiator(room);
        setCurrentRoom(room);
        currentRoomRef.current = room;
        console.log("Room Exists!");
        if (redirect) router.push(`/share-area/persistent/${roomId}`);
        return room;
      }

      // Room doesn't exist — create new one
      toast.info(
        <div className="flex flex-col gap-1 items-start">
          <div>Room "{roomId}" not found.</div>
          <div>Creating new room ...</div>
        </div>,
        { position: "top-right", richColors: true }
      );

      const newRoom = await createNewRoom();
      if (newRoom) {
        setCurrentRoom(newRoom);
        currentRoomRef.current = newRoom;
        setIsInitiator(true);
        if (redirect) router.push(`/share-area/persistent/${roomId}`);
        return newRoom;
      }
    },
    [supabase, authUser, guestUser]
  );

  const createRoomMessage = useCallback(async () => {
    if (!supabase) {
      handleToastError("Supabase not initialized!");
      return;
    }

    const room = currentRoomRef.current;

    if (!room || !room.id) {
      handleToastError("Room not defined!");
      return;
    }

    const newText = currentRoomMessageRef.current;

    if (!newText.trim()) {
      handleToastError("Text message required!");
      return;
    }

    const messagePayload: any = {
      room_id: room.id,
      content: newText,
      message_type: "text",
    };

    if (authUser) {
      messagePayload.sender_user_id = authUser.id;
    } else if (guestUser) {
      messagePayload.sender_guest_id = guestUser.id;
    } else {
      handleToastError("No user identified (guest or logged-in)");
      return;
    }

    // Insert the message
    const { data: newMessage, error: messageError } = await supabase
      .from("room_messages")
      .insert(messagePayload)
      .select("*")
      .single();

    if (messageError) {
      handleToastError("Failed to send message", messageError);
      return;
    }

    setDisplayTextContent(newText);

    const memberFilter = authUser
      ? { room_id: room.id, user_id: authUser.id }
      : { room_id: room.id, guest_id: guestUser?.id };

    const { data: existingMember, error: fetchError } = await supabase
      .from("room_members")
      .select("id")
      .match(memberFilter)
      .single();

    if (!existingMember) {
      const memberPayload: any = {
        room_id: room.id,
        role: isInitiator ? "initiator" : "participant",
        is_initiator: isInitiator,
        ...(authUser ? { user_id: authUser.id } : { guest_id: guestUser?.id }),
      };

      const { data: insertedMember, error: insertError } = await supabase
        .from("room_members")
        .insert(memberPayload)
        .select("*")
        .single();

      if (insertError) {
        console.error("Error inserting member:", insertError);
        toast.error("Failed to register user in room");
      }
    }

    await getRoomMessages();
    // // Upsert room membership (can be moved to a protected API route if sensitive)
    // const { data: member, error: memberError } = await supabase
    //   .from("room_members")
    //   .upsert(
    //     memberPayload
    //     // {onConflict: authUser ? "room_id,user_id" : "room_id,guest_id",}
    //   )
    //   .select("*")
    //   .single();

    // if (memberError) {
    //   handleToastError("Failed to update room member", memberError);
    // }
  }, [supabase, isInitiator, authUser, guestUser]);

  const getRoomMessages = useCallback(async () => {
    if (!supabase) {
      handleToastError("Supabase not initialized!");
      return;
    }
    const room = currentRoomRef.current;
    if (!room) {
      handleToastError("Room not defined!");
      return;
    }
    const { data } = await supabase
      .from("room_messages")
      .select(
        `
            id, content, file_url, file_type, file_metadata, message_type, metadata, sent_at,
            sender_user_id,
            sender_guest_id
        `
      )
      .eq("room_id", room.id)
      .order("sent_at", { ascending: false });
    console.log("ROOM MESSAGES: ", data);
    setRoomMessages(data);
    return data;
  }, [supabase]);

  useEffect(() => {
    setCurrentRoomIdRef(roomId);
  }, [roomId]);

  useEffect(() => {
    if (currentRoom) {
      getRoomMessages();
    }
  }, [currentRoom]);

  return {
    supabase,
    roomId,
    setRoomId,
    joinOrCreateRoom,
    currentRoom,
    isInitiator,
    setCurrentRoomIdRef,
    roomMessages,
    setCurrentRoomMessageRef,
    getRoomMessages,
    createRoomMessage,
  };
};

export default usePersistentShare;

// "use client";

// import { useAuthContext } from "@/context/AuthContext";
// import { createClient } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { toast } from "sonner";

// const usePersistentShare = () => {
//     const supabase = createClient();
//     const router = useRouter();
//     const { clientId, guestUser, authUser } = useAuthContext();
//     const [currentRoom, setCurrentRoom] = useState<any>(null);
//     const [isInitiator, setIsInitiator] = useState(false);
//     const [roomId, setRoomId] = useState("");
//     const currentRoomIdRef = useRef<string>("");

//     const setCurrentRoomIdRef = (id: string) => {
//         currentRoomIdRef.current = id;
//     }

//     const joinOrCreateRoom = useCallback(async (redirect = true) => {
//         if (!supabase) {
//             toast.error("Supabase not initialized!", { position: "top-right", richColors: true });
//             return;
//         }

//         if (!currentRoomIdRef.current) {
//             toast.error("Room ID not defined!", { position: "top-right", richColors: true });
//             return;
//         }

//         // Check if room already exists
//         const { data: existingRoom, error: roomError } = await supabase
//             .from("rooms")
//             .select('*')
//             .eq("room_id", currentRoomIdRef.current);

//         if (roomError) {
//             console.error("Error fetching room:", roomError);
//             toast.error("Failed to check for existing room", { position: "top-right" });
//             return;
//         }
//         if (existingRoom && existingRoom.length > 0) {
//             const room = existingRoom[0];
//             if (authUser) {
//                 if (authUser.id == room.user_id) {
//                     setIsInitiator(true);
//                 }
//             } else if (guestUser) {
//                 if (guestUser.id == room.guest_id) {
//                     setIsInitiator(true);
//                 }
//             } else {
//                 console.error("No user identified (guest or logged-in)");
//                 toast.error("No user identified (guest or logged-in)", { position: "top-right" });
//             }
//             console.log("EXISTING ROOM:", room)
//             // ✅ Room already exists
//             setCurrentRoom(room)
//             setIsInitiator(true);
//             if (redirect) { router.push(`/share-area/persistent/${currentRoomIdRef.current}`); }
//             else {
//                 return room;
//             }
//         } else {
//             // ✅ Room doesn't exist, create it
//             toast.success(
//                 <div className="flex flex-col justify-center gap-1 items-start">
//                     <div>Room ID "{currentRoomIdRef.current}" does not exist yet.</div>
//                     <div>Creating new room ...</div>
//                 </div>,
//                 { position: "top-right", richColors: true }
//             );

//             const newRoomPayload: any = {
//                 room_id: currentRoomIdRef.current,
//                 type: "persistent", // your corrected enum value
//                 password: null,
//                 metadata: {},
//                 expires_at: (() => {
//                     const date = new Date();
//                     date.setMonth(date.getMonth() + 1);
//                     return date.toISOString();
//                 })(),
//             };

//             if (authUser) {
//                 newRoomPayload.user_id = authUser.id;
//             } else if (guestUser) {
//                 newRoomPayload.guest_id = guestUser.id;
//             } else {
//                 toast.error("No user identified (guest or logged-in)", { position: "top-right" });
//                 return;
//             }

//             const { data: newRoomData, error: insertError } = await supabase
//                 .from("rooms")
//                 .insert(newRoomPayload)
//                 .select("*")
//                 .single();

//             if (insertError) {
//                 console.error("Error creating room:", insertError);
//                 toast.error("Failed to create new room", { position: "top-right" });
//                 return;
//             }
//             console.log("NEW ROOM:", newRoomData)
//             setCurrentRoom(newRoomData);
//             setIsInitiator(true);
//             if (redirect) {
//                 router.push(`/share-area/persistent/${currentRoomIdRef.current}`);
//             } else {
//                 return newRoomData
//             }

//         }

//     }, [supabase, authUser, guestUser, currentRoomIdRef.current]);

//     useEffect(() => {
//         setCurrentRoomIdRef(roomId)
//     }, [roomId])

//     return { supabase, roomId, setRoomId, joinOrCreateRoom, currentRoom, isInitiator, setCurrentRoomIdRef }

// }

// export default usePersistentShare
