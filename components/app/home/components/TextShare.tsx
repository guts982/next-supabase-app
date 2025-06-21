import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import P2PChat from "./P2PChat";

const TextShare = () => {
  const [text, setText] = useState<string>("");

    const shareText = () => {

    }
return <P2PChat />
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
};

export default TextShare;
