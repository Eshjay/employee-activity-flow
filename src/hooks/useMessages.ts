
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const useMessages = (currentUserId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to fetch messages.",
          variant: "destructive",
        });
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipientId: string, subject: string, content: string) => {
    if (!currentUserId) return false;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          subject,
          content,
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive",
        });
        return false;
      }
      
      await fetchMessages(); // Refresh messages
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
      return false;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('recipient_id', currentUserId);

      if (error) {
        console.error('Error marking message as read:', error);
        toast({
          title: "Error",
          description: "Failed to mark message as read.",
          variant: "destructive",
        });
      } else {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getUnreadCount = () => {
    return messages.filter(msg => 
      msg.recipient_id === currentUserId && !msg.is_read
    ).length;
  };

  useEffect(() => {
    fetchMessages();
  }, [currentUserId]);

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    getUnreadCount,
    fetchMessages,
  };
};
