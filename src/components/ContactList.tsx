import React, { useEffect, useState } from "react";
import { User } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface ContactListProps {
  onSelectContact: (contact: User) => void;
  selectedContactId?: string;
  unreadCounts: Record<string, number>;
}

const ContactList = ({ onSelectContact, selectedContactId, unreadCounts }: ContactListProps) => {
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!authUser) {
        navigate("/login");
        return;
      }

      try {
        // Get all users who have exchanged messages with the current user
        const { data: conversations, error: convError } = await supabase
          .rpc('get_user_conversations');

        if (convError) {
          throw convError;
        }

        if (!conversations || conversations.length === 0) {
          setContacts([]);
          setLoading(false);
          return;
        }

        // Get user details for each conversation
        const userIds = conversations.map(conv => conv.conversation_with);
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds);

        if (usersError) {
          throw usersError;
        }

        // Create a map of last message times
        const lastMessageMap = conversations.reduce((acc, conv) => ({
          ...acc,
          [conv.conversation_with]: conv.last_message_at
        }), {});

        // Combine user data with last message time and sort by most recent
        const contactsWithLastMessage = (users || []).map(user => ({
          ...user,
          last_message_at: lastMessageMap[user.id]
        })).sort((a, b) => {
          const timeA = new Date(a.last_message_at || 0).getTime();
          const timeB = new Date(b.last_message_at || 0).getTime();
          return timeB - timeA; // Sort in descending order (most recent first)
        });

        setContacts(contactsWithLastMessage);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [authUser, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-6 w-6 border-2 border-red-600 border-opacity-50 border-t-red-600 rounded-full"></div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No conversations yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedContactId === contact.id
                ? "bg-red-50"
                : "hover:bg-gray-50"
            }`}
          >
            <Avatar>
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback>
                {contact.full_name?.charAt(0) || contact.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {contact.full_name || contact.email}
                </p>
                {unreadCounts[contact.id] > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCounts[contact.id]}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {contact.last_message_at ? new Date(contact.last_message_at).toLocaleDateString() : 'No messages yet'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ContactList;
