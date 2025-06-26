import Index from "@/components/app/share-area/p2p/Index";
import BaseLayout from "@/components/layout/BaseLayout";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function P2PShareArea({params}:PageProps) {

  const {roomId} = await params;


  if(!roomId) {
    return (<div>
      Room Id Required
    </div>)
  }

  return (
    <BaseLayout>
      <Index roomId={roomId ?? null} />
    </BaseLayout>
  );
}
