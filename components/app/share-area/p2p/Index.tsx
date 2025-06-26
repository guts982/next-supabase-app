"use client";

import useP2PShare from "@/hooks/use-p2p-share";

type Props = {
    roomId?:string | null
}

const Index = ({roomId=null}:Props) => {

    // const {} = useP2PShare();

    return (<div>
            P2P Share Area
    </div>)
}

export default Index
