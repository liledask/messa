import React from "react";
import { User } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  recipient: User;
}

const ChatHeader = ({ recipient }: ChatHeaderProps) => {
  return (
    <div className="bg-red-600 p-3 flex items-center gap-3 border-b border-red-700">
      <Avatar className="h-10 w-10">
        <AvatarImage src={recipient.avatar_url} alt={recipient.name || ""} />
        <AvatarFallback className="bg-white text-red-600">
          {recipient.name ? recipient.name.substring(0, 2).toUpperCase() : "??"}
              </AvatarFallback>
            </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">{recipient.name || "Unknown User"}</p>
          {recipient.is_online && (
            <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
          )}
        </div>
        {recipient.business_name && (
          <p className="text-sm text-red-100 truncate">{recipient.business_name}</p>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
