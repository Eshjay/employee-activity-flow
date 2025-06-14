
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";
import { Mail, Send, Inbox, Reply } from "lucide-react";

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
  
  const { messages, sendMessage, markAsRead, getUnreadCount } = useMessages(currentUserId);
  const { profiles } = useProfiles();
  const { toast } = useToast();

  // Set initial view based on whether we have a recipient
  useEffect(() => {
    if (recipientId && recipientName) {
      setView("compose");
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
      recipientId;

    if (!actualRecipientId || !subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const success = await sendMessage(actualRecipientId, subject, content);
    
    if (success) {
      const recipientProfile = profiles.find(p => p.id === actualRecipientId);
      const recipientDisplayName = recipientProfile?.name || recipientName || "recipient";
      
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${recipientDisplayName}.`,
      });
      setSubject("");
      setContent("");
      setReplyToMessage(null);
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
      setSubject(`Re: ${message.subject}`);
      setContent("");
      setView("compose");
    }
  };

  const handleComposeNew = () => {
    setReplyToMessage(null);
    setSubject("");
    setContent("");
    setView("compose");
  };

  const getComposeRecipientName = () => {
    if (replyToMessage) {
      const message = messages.find(m => m.id === replyToMessage);
      if (message) {
        return getProfileName(message.sender_id);
      }
    }
    return recipientName || "";
  };

  const getComposeRecipientId = () => {
    if (replyToMessage) {
      const message = messages.find(m => m.id === replyToMessage);
      return message?.sender_id;
    }
    return recipientId;
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
              ? `Send a message to ${getComposeRecipientName()}`
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">To:</Label>
                <Input
                  id="recipient"
                  value={getComposeRecipientName()}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter message subject"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSendMessage} 
                  className="flex-1"
                  disabled={!getComposeRecipientId() || !subject || !content}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setView("inbox")} className="flex-1">
                  Back to Inbox
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      message.is_read ? "bg-white" : "bg-blue-50 border-blue-200"
                    }`}
                    onClick={() => {
                      if (!message.is_read && message.recipient_id === currentUserId) {
                        handleMarkAsRead(message.id);
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
                            handleMarkAsRead(message.id);
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
                            handleReplyToMessage(message.id);
                          }}
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
