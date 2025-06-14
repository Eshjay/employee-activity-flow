
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";
import { MessageCompose } from "./MessageCompose";
import { MessageInbox } from "./MessageInbox";
import { Mail, Send, Inbox } from "lucide-react";

interface MessagingSystemDataProps {
  currentUserId: string;
  recipientId?: string;
  recipientName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MessagingSystemData = ({ 
  currentUserId, 
  recipientId, 
  recipientName, 
  isOpen, 
  onClose 
}: MessagingSystemDataProps) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [view, setView] = useState<"compose" | "inbox">("inbox");
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>(recipientId);
  const [selectedRecipientName, setSelectedRecipientName] = useState<string | undefined>(recipientName);
  
  const { messages, sendMessage, markAsRead, getUnreadCount } = useMessages(currentUserId);
  const { profiles } = useProfiles();
  const { toast } = useToast();

  // Set initial view based on whether we have a recipient
  useEffect(() => {
    if (recipientId && recipientName) {
      setView("compose");
      setSelectedRecipientId(recipientId);
      setSelectedRecipientName(recipientName);
    } else {
      setView("inbox");
    }
  }, [recipientId, recipientName]);

  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.name || "Unknown User";
  };

  const handleSendMessage = async () => {
    // Determine the actual recipient
    const actualRecipientId = replyToMessage ? 
      messages.find(m => m.id === replyToMessage)?.sender_id : 
      selectedRecipientId;

    if (!actualRecipientId || !subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a recipient.",
        variant: "destructive",
      });
      return;
    }

    const success = await sendMessage(actualRecipientId, subject, content);
    
    if (success) {
      const recipientProfile = profiles.find(p => p.id === actualRecipientId);
      const recipientDisplayName = recipientProfile?.name || selectedRecipientName || "recipient";
      
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${recipientDisplayName}.`,
      });
      setSubject("");
      setContent("");
      setReplyToMessage(null);
      setSelectedRecipientId(undefined);
      setSelectedRecipientName(undefined);
      setView("inbox");
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    await markAsRead(messageId);
  };

  const handleReplyToMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyToMessage(messageId);
      setSelectedRecipientId(message.sender_id);
      setSelectedRecipientName(getProfileName(message.sender_id));
      setSubject(`Re: ${message.subject}`);
      setContent("");
      setView("compose");
    }
  };

  const handleComposeNew = () => {
    setReplyToMessage(null);
    setSelectedRecipientId(undefined);
    setSelectedRecipientName(undefined);
    setSubject("");
    setContent("");
    setView("compose");
  };

  const handleUserSelect = (userId: string, userName: string) => {
    setSelectedRecipientId(userId);
    setSelectedRecipientName(userName);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {view === "compose" ? "Send Message" : "Messages"}
          </DialogTitle>
          <DialogDescription>
            {view === "compose" 
              ? replyToMessage 
                ? `Reply to ${getComposeRecipientName()}`
                : "Compose a new message"
              : "View and manage your messages"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={view === "compose" ? "default" : "outline"}
              onClick={handleComposeNew}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Compose
            </Button>
            <Button
              variant={view === "inbox" ? "default" : "outline"}
              onClick={() => setView("inbox")}
              className="flex-1"
            >
              <Inbox className="w-4 h-4 mr-2" />
              Inbox ({getUnreadCount()})
            </Button>
          </div>

          {view === "compose" ? (
            <MessageCompose
              currentUserId={currentUserId}
              replyToMessage={replyToMessage}
              selectedRecipientId={selectedRecipientId}
              selectedRecipientName={selectedRecipientName}
              subject={subject}
              content={content}
              messages={messages}
              profiles={profiles}
              onUserSelect={handleUserSelect}
              onSubjectChange={setSubject}
              onContentChange={setContent}
              onSendMessage={handleSendMessage}
              onBackToInbox={() => setView("inbox")}
            />
          ) : (
            <MessageInbox
              messages={messages}
              currentUserId={currentUserId}
              profiles={profiles}
              onMarkAsRead={handleMarkAsRead}
              onReplyToMessage={handleReplyToMessage}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
