import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";

const TextContent = () => {

    return (
      <div className="grid grid-cols-5 pt-2 gap-2">
          <div className="col-span-4     flex flex-col justify-center items-center">
            <Textarea 
            className="shadow-lg border rounded-sm border-lime-500/30 h-full min-h-[60vh]"

            />
            <div className="pt-2 grid grid-cols-5 r w-full items-center gap-2">
                <Button className=" shadow-md col-span-2 md:col-span-1 bg-rose-600/80 dark:bg-rose-500/50 text-white "> <X className="h-4 w-4" /> Clear</Button>
                <Button className="shadow-md col-span-3 md:col-span-4 bg-lime-600/90 dark:bg-lime-500/50 text-white"> <Send className="h-4 w-4" />  Upload</Button>
            </div>
       </div>
       <div className="flex flex-col gap-2 border p-2 rounded-sm  border-lime-500/30">
        <h3 className=" bg-lime-300/20 rounded-sm  p-1 text-xs text-lime-500 text-center">Older Texts</h3>
          <ScrollArea className="h-full h-[60vh] col-span-1 bg-lime-900/20 rounded-sm">

       </ScrollArea>
       </div>
     
      </div>
    )
}

export default TextContent;
