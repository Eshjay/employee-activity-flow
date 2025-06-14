
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply } from "lucide-react";
import type { Message } from "@/hooks/useMessages";
import type { Profile } from "@/types/user";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  profiles: Profile[];
  onMarkAsRead: (messageId: string) => void;
  onReplyToMessage: (messageId: string) => void;
}

export const MessageList = ({
  messages,
  currentUserId,
  profiles,
  onMarkAsRead,
  onReplyToMessage,
}: MessageListProps) => {
  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.name || "Unknown User";
  };

  if (messages.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No messages yet</p>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
            message.is_read ? "bg-white" : "bg-blue-50 border-blue-200"
          }`}
          onClick={() => {
            if (!message.is_read && message.recipient_id === currentUserId) {
              onMarkAsRead(message.id);
            }
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-semibold">{message.subject}</h4>
              <p className="text-sm text-gray-600">
                {message.sender_id === currentUserId 
                  ? `To: ${getProfileName(message.recipient_id)}`
                  : `From: ${getProfileName(message.sender_id)}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!message.is_read && message.recipient_id === currentUserId && (
                <Badge className="bg-blue-100 text-blue-700">New</Badge>
              )}
              <span className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p className="text-sm mb-3">{message.content}</p>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {!message.is_read && message.recipient_id === currentUserId && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(message.id);
                }}
              >
                Mark as Read
              </Button>
            )}
            
            {message.sender_id !== currentUserId && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReplyToMessage(message.id);
                }}
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
