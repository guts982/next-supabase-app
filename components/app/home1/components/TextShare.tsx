"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, {  useState } from "react";
import useWebrtc, { Message } from "@/hooks/useWebrtc";
import { Input } from "@/components/ui/input";

const TextShare = () => {
  const [messageInput, setMessageInput] = useState("");
  const {
    connectionState,
    messages,
    currentRoomId,
    setCurrentRoomId,
    joinRoom,
    sendMessage,
  } = useWebrtc();

  const createOrJoin = async () => {
    try {
      if (!currentRoomId?.trim()) {
        alert("Please enter a room ID");
        return;
      }
      await joinRoom();
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Failed to join room. Please try again.");
    }
  };

  const sendNewMessage = async () => {
    if (!messageInput.trim()) return;

    if (sendMessage(messageInput)) {
      setMessageInput(""); // Clear input on successful send
    }
  };

  return (
    <div>
      <div>Connecttion State: {connectionState}</div>
      {connectionState == "connected" ? (
        <div className="w-full ">
          {messages.map((msg: Message) => (
            <div
              key={msg.timestamp}
              className={`p-2 mb-2 rounded ${
                msg.isSent ? "bg-blue-100 dark:bg-blue-700 ml-8" : "bg-gray-100 dark:bg-gray-700  mr-8"
              }`}
            >
              <div className="text-xs text-yellow-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
              <div>{msg.text}</div>
            </div>
          ))}

          <div>
            <div>
              <Label>Your Text</Label>
              <Textarea
                className="min-h-[300px] focus:outline-none focus:border-0"
                onChange={(e) => setMessageInput(e.target.value)}
                value={messageInput}
                placeholder="Text toshare..."
              />
            </div>
            <Button onClick={sendNewMessage} className="" variant={"default"}>
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Input
            name="room_id"
            value={currentRoomId}
            className="border border-white my-2"
            onChange={(e) => setCurrentRoomId(e.target.value)}
          />
          <Button type="button" onClick={createOrJoin}>
            Createt or Join
          </Button>
        </div>
      )}
    </div>
  );
};

export default TextShare;

/*



// const TextShare = () => {
//   const [text, setText] = useState<string>("");

//     const shareText = () => {

//     }

//     return (<div>

//     </div>)
// return <P2PChat />
//   return (
//     <div className="w-full p-2 md:p-4 grid grid-cols-1 gap-4">
//       <div className="w-full ">
//         <Label>Your Text</Label>
//         <Textarea
//           className="min-h-[300px] focus:outline-none focus:border-0"
//           onChange={(e) => setText(e.target.value)}
//           value={text}
//           placeholder="Text toshare..."
//         />
//       </div>
//       <Button onClick={shareText} className="" variant={"default"}>
//         Share
//       </Button>
//     </div>
//   );
// };


const TextShar1e = () => {
 const [messageInput, setMessageInput] = useState('');
  const [status, setStatus] = useState('Enter your Supabase credentials to start');
 
  const { connectionState, messages, currentRoomId, joinRoom, sendMessage, disconnect, canSendMessage } = useWebRTC();
      const shareText = () => {

    }
  useEffect(() => {


    switch (connectionState) {
      case 'disconnected':
        setStatus('Disconnected - Waiting for peer...');
        break;
      case 'connecting':
        setStatus('Connecting to peer...');
        break;
      case 'connected':
        setStatus('Connected! You can now chat.');
        break;
    }
  }, [connectionState]);
  return (
      <div className="w-full p-2 md:p-4 grid grid-cols-1 gap-4">
      <div className="w-full ">
        <Label>Your Text</Label>
        <Textarea
          className="min-h-[300px] focus:outline-none focus:border-0"
          onChange={(e) => setMessageInput(e.target.value)}
          value={messageInput}
          placeholder="Text toshare..."
        />
      </div>
      <Button onClick={shareText} className="" variant={"default"}>
        Share
      </Button>
    </div>
  )
}
*/
