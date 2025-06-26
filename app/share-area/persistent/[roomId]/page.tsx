import Index from "@/components/app/share-area/persistent/Index";
import BaseLayout from "@/components/layout/BaseLayout";
import { PersistentShareProvider } from "@/context/PersistentShareContext";
interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function PersistentShareArea({ params }: PageProps) {
  const { roomId } = await params;

  if (!roomId) {
    return <div>Room Id Required</div>;
  }

  return (
    <BaseLayout>
      <PersistentShareProvider>
        <Index roomId={roomId ?? null} />
      </PersistentShareProvider>
    </BaseLayout>
  );
}
