import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConversationButtonProps {
  currentUser: User;
  onSelectContact: (contact: User) => void;
}

const ConversationButton = ({ currentUser, onSelectContact }: ConversationButtonProps) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .neq("id", currentUser.id);

      if (error) {
        throw error;
      }

      // Map the data to include all fields
      const mappedUsers = data?.map(user => ({
        id: user.id,
        name: user.full_name,
        avatar_url: user.avatar_url,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        business_name: user.business_name,
        category: user.category,
        user_type: user.user_type,
        username: user.username,
        is_online: user.is_online,
        last_seen: user.last_seen,
        member_since: user.member_since,
        profile_views: user.profile_views,
        average_rating: user.average_rating,
        reviews_count: user.reviews_count
      })) || [];

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = async (user: User) => {
    try {
      // Create an initial empty message to establish the conversation
      const { error } = await supabase.from('direct_messages').insert({
        content: "",
        sender_id: currentUser.id,
        recipient_id: user.id,
      });

      if (error) {
        // If error mentions row level security, the conversation might already exist
        if (!error.message.includes('row-level security')) {
          throw error;
        }
      }
      
      // Pass the selected contact up to the parent component
      onSelectContact(user);
      setOpen(false);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" className="fixed bottom-6 right-6 rounded-full h-14 w-14">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] md:max-h-[80vh]">
        <DialogHeader className="px-1">
          <DialogTitle className="text-xl md:text-2xl">Start a conversation</DialogTitle>
        </DialogHeader>
        <div className="py-2 px-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2 max-h-[calc(90vh-180px)] md:max-h-[calc(80vh-180px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-opacity-50 border-t-primary rounded-full"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
                >
                  <Avatar className="h-12 w-12 md:h-10 md:w-10">
                    <AvatarImage src={user.avatar_url} alt={user.name || ""} />
                    <AvatarFallback>
                      {user.name ? user.name.substring(0, 2).toUpperCase() : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate text-base md:text-sm">{user.name || "Unknown User"}</p>
                      {user.is_online && (
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      )}
                    </div>
                    {user.business_name && (
                      <p className="text-sm text-muted-foreground truncate">{user.business_name}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {user.category && (
                        <p className="text-xs text-muted-foreground truncate">{user.category}</p>
                      )}
                      {user.location && (
                        <p className="text-xs text-muted-foreground truncate">{user.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationButton;
