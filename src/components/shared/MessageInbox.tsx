
import { MessageList } from "./MessageList";
import type { Message } from "@/hooks/useMessages";
import type { Profile } from "@/types/user";

interface MessageInboxProps {
  messages: Message[];
  currentUserId: string;
  profiles: Profile[];
  onMarkAsRead: (messageId: string) => void;
  onReplyToMessage: (messageId: string) => void;
}

export const MessageInbox = ({
  messages,
  currentUserId,
  profiles,
  onMarkAsRead,
  onReplyToMessage,
}: MessageInboxProps) => {
  return (
    <MessageList
      messages={messages}
      currentUserId={currentUserId}
      profiles={profiles}
      onMarkAsRead={onMarkAsRead}
      onReplyToMessage={onReplyToMessage}
    />
  );
};
