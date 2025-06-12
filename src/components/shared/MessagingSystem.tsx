
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/hooks/useUserStore";
import { Mail, Send, Inbox } from "lucide-react";

interface MessagingSystemProps {
  currentUserId: string;
  recipientId?: string;
  recipientName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MessagingSystem = ({ 
  currentUserId, 
  recipientId, 
  recipientName, 
  isOpen, 
  onClose 
}: MessagingSystemProps) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [view, setView] = useState<"compose" | "inbox">(recipientId ? "compose" : "inbox");
  
  const { 
    sendMessage, 
    getMessagesForUser, 
    getUserById, 
    markMessageAsRead 
  } = useUserStore();
  
  const { toast } = useToast();
  
  const currentUser = getUserById(currentUserId);
  const userMessages = getMessagesForUser(currentUserId);

  const handleSendMessage = () => {
    if (!recipientId || !subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return;
    }

    sendMessage({
      senderId: currentUserId,
      senderName: currentUser.name,
      recipientId,
      recipientName: recipientName || "Unknown",
      subject,
      content
    });

    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${recipientName}.`,
    });

    setSubject("");
    setContent("");
    onClose();
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
              Inbox ({userMessages.length})
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
              {userMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages yet</p>
              ) : (
                userMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg ${
                      message.isRead ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{message.subject}</h4>
                        <p className="text-sm text-gray-600">
                          {message.senderId === currentUserId 
                            ? `To: ${message.recipientName}`
                            : `From: ${message.senderName}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!message.isRead && message.recipientId === currentUserId && (
                          <Badge className="bg-blue-100 text-blue-700">New</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {!message.isRead && message.recipientId === currentUserId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => markMessageAsRead(message.id)}
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
