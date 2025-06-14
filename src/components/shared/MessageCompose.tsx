
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelector } from "./UserSelector";
import { Send } from "lucide-react";
import type { Message } from "@/hooks/useMessages";
import type { Profile } from "@/types/user";

interface MessageComposeProps {
  currentUserId: string;
  replyToMessage: string | null;
  selectedRecipientId: string | undefined;
  selectedRecipientName: string | undefined;
  subject: string;
  content: string;
  messages: Message[];
  profiles: Profile[];
  onUserSelect: (userId: string, userName: string) => void;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  onSendMessage: () => void;
  onBackToInbox: () => void;
}

export const MessageCompose = ({
  currentUserId,
  replyToMessage,
  selectedRecipientId,
  selectedRecipientName,
  subject,
  content,
  messages,
  profiles,
  onUserSelect,
  onSubjectChange,
  onContentChange,
  onSendMessage,
  onBackToInbox,
}: MessageComposeProps) => {
  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.name || "Unknown User";
  };

  const getComposeRecipientName = () => {
    if (replyToMessage) {
      const message = messages.find(m => m.id === replyToMessage);
      if (message) {
        return getProfileName(message.sender_id);
      }
    }
    return selectedRecipientName || "";
  };

  return (
    <div className="space-y-4">
      {/* Recipient Selection */}
      {replyToMessage ? (
        <div>
          <Label htmlFor="recipient">To:</Label>
          <Input
            id="recipient"
            value={getComposeRecipientName()}
            readOnly
            className="bg-gray-50"
          />
        </div>
      ) : (
        <UserSelector
          selectedUserId={selectedRecipientId}
          selectedUserName={selectedRecipientName}
          onUserSelect={onUserSelect}
          currentUserId={currentUserId}
          placeholder="Select a recipient..."
        />
      )}
      
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Enter message subject"
        />
      </div>
      
      <div>
        <Label htmlFor="content">Message</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Type your message here..."
          rows={6}
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button 
          onClick={onSendMessage} 
          className="flex-1"
          disabled={!selectedRecipientId || !subject || !content}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Message
        </Button>
        <Button variant="outline" onClick={onBackToInbox} className="flex-1">
          Back to Inbox
        </Button>
      </div>
    </div>
  );
};
