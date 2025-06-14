
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
  const [view, setView] = useState<"compose" | "inbox">(recipientId ? "compose" : "inbox");
  
  const { messages, sendMessage, markAsRead, getUnreadCount } = useMessages(currentUserId);
  const { profiles } = useProfiles();
  const { toast } = useToast();

  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.name || "Unknown User";
  };

  const handleSendMessage = async () => {
    if (!recipientId || !subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const success = await sendMessage(recipientId, subject, content);
    
    if (success) {
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${recipientName}.`,
      });
      setSubject("");
      setContent("");
      onClose();
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    await markAsRead(messageId);
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
              ? `Send a message to ${recipientName}`
              : "View and manage your messages"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={view === "compose" ? "default" : "outline"}
              onClick={() => setView("compose")}
              className="flex-1"
              disabled={!recipientId}
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

          {view === "compose" && recipientId ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">To:</Label>
                <Input
                  id="recipient"
                  value={recipientName || ""}
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
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
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
                    className={`p-4 border rounded-lg ${
                      message.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
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
                    <p className="text-sm">{message.content}</p>
                    {!message.is_read && message.recipient_id === currentUserId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleMarkAsRead(message.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
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
