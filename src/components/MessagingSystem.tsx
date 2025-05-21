import React, { useState, useEffect } from "react";
import { User } from "@/types/chat";
import ContactList from "./ContactList";
import ChatContainer from "./ChatContainer";
import ConversationButton from "./ConversationButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

interface MessagingSystemProps {
  className?: string;
  showHeader?: boolean;
  headerTitle?: string;
  onContactSelect?: (contact: User) => void;
}

const MessagingSystem = ({
  className = "",
  showHeader = true,
  headerTitle = "Messages",
  onContactSelect
}: MessagingSystemProps) => {
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser?.id) {
      fetchConversationContacts();
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel('direct_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `recipient_id=eq.${authUser.id}`
          },
          (payload) => {
            const newMessage = payload.new as any;
            setUnreadCounts(prev => ({
              ...prev,
              [newMessage.sender_id]: (prev[newMessage.sender_id] || 0) + 1
            }));
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [authUser?.id]);

  const fetchConversationContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_conversations');

      if (error) {
        console.error("Error in get_user_conversations:", error);
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      if (!data) {
        console.log("No conversations found");
        setContacts([]);
        setLoading(false);
        return;
      }

      const conversationUserIds = data.map(conversation => conversation.conversation_with);
      
      // Get unread message counts for each conversation
      const { data: unreadData, error: unreadError } = await supabase
        .from('direct_messages')
        .select('sender_id')
        .eq('recipient_id', authUser?.id)
        .eq('read', false);

      if (unreadError) {
        console.error("Error fetching unread counts:", unreadError);
        throw new Error(`Failed to fetch unread counts: ${unreadError.message}`);
      }

      // Create a map of unread counts
      const unreadCountMap = (unreadData || []).reduce((acc, curr) => ({
        ...acc,
        [curr.sender_id]: (acc[curr.sender_id] || 0) + 1
      }), {});
      setUnreadCounts(unreadCountMap);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          email,
          phone,
          location,
          bio,
          business_name,
          category,
          user_type,
          username,
          is_online,
          last_seen,
          member_since,
          profile_views,
          average_rating,
          reviews_count
        `)
        .in("id", conversationUserIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      if (profilesData && profilesData.length > 0) {
        const mappedProfiles = profilesData.map(profile => ({
          id: profile.id,
          name: profile.full_name,
          avatar_url: profile.avatar_url,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          business_name: profile.business_name,
          category: profile.category,
          user_type: profile.user_type,
          username: profile.username,
          is_online: profile.is_online,
          last_seen: profile.last_seen,
          member_since: profile.member_since,
          profile_views: profile.profile_views,
          average_rating: profile.average_rating,
          reviews_count: profile.reviews_count
        }));
        setContacts(mappedProfiles);
        if (!selectedContact) {
          setSelectedContact(mappedProfiles[0]);
        }
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Error in fetchConversationContacts:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) {
    return null;
  }

  const currentUser: User = {
    id: authUser.id,
    name: authUser.email || "Current User",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    email: authUser.email,
    phone: null,
    location: null,
    bio: null,
    business_name: null,
    category: null,
    user_type: "user",
    username: null,
    is_online: true,
    last_seen: new Date().toISOString(),
    member_since: new Date().toISOString(),
    profile_views: 0,
    average_rating: null,
    reviews_count: 0
  };

  const handleSelectContact = (contact: User) => {
    setSelectedContact(contact);
    setShowChat(true);
    // Clear unread count when selecting a contact
    setUnreadCounts(prev => ({
      ...prev,
      [contact.id]: 0
    }));
    if (onContactSelect) {
      onContactSelect(contact);
    }
  };

  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <ContactList
          onSelectContact={handleSelectContact}
          selectedContactId={selectedContact?.id}
          unreadCounts={unreadCounts}
        />
      </div>
      <div className="flex-1">
        {selectedContact ? (
          <ChatContainer
            currentUser={currentUser}
            recipient={selectedContact}
            onBack={handleBack}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem; 