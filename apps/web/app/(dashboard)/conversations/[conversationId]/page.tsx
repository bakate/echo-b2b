import type { ConversationId } from "@/modules/dashboard/types";
import { SingleConversationScreen } from "@/modules/dashboard/ui/screens/single-conversation-screen";

interface Props {
  params: Promise<{ conversationId: ConversationId }>;
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  return <SingleConversationScreen conversationId={conversationId} />;
}
