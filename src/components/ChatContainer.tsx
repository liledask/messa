import React, { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import { DirectMessage, User } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ChatContainerProps {
  currentUser: User;
  recipient: User;
  onBack: () => void;
  initialMessages?: DirectMessage[];
}

const ChatContainer = ({ 
  currentUser, 
  recipient, 
  onBack, 
  initialMessages = [] 
}: ChatContainerProps) => {
  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (currentUser.id && recipient.id) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [currentUser.id, recipient.id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Use a database function to get all messages between the two users
      const { data, error } = await supabase
        .rpc('get_conversation_messages', { 
          user1_id: currentUser.id, 
          user2_id: recipient.id 
        });

      if (error) {
        throw error;
      }

      if (data) {
        // Keep the original order from the server
        setMessages(data as DirectMessage[]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase.rpc('mark_messages_as_read', { 
        p_conversation_partner_id: recipient.id 
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (content: string, attachmentUrl?: string) => {
    if (!content.trim() && !attachmentUrl) return;
    if (!authUser) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    const newMessage: DirectMessage = {
      id: uuidv4(),
      content,
      sender_id: authUser.id,
      recipient_id: recipient.id,
      created_at: new Date().toISOString(),
      attachment_url: attachmentUrl,
      read: false
    };

    // Optimistic update - add to the end of the list
    setMessages((prev) => [...prev, newMessage]);

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          content: content,
          sender_id: authUser.id,
          recipient_id: recipient.id,
          attachment_url: attachmentUrl,
        });

      if (error) {
        throw error;
      }
      
      // Refresh the messages to get the server-generated ID and timestamp
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Remove the optimistically added message
      setMessages((prev) => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a]">
      <ChatHeader recipient={recipient} onBack={onBack} />
      <MessageList 
        messages={messages} 
        currentUserId={authUser?.id} 
        loading={loading} 
      />
      <MessageComposer onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
