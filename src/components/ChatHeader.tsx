import React from "react";
import { User } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  recipient: User;
  onBack: () => void;
}

const ChatHeader = ({ recipient, onBack }: ChatHeaderProps) => {
  return (
    <div className="bg-red-600 text-white p-3 flex items-center justify-between border-b border-red-700">
      <button onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-xl font-semibold">Back</span>
      </button>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={recipient.avatar_url} />
          <AvatarFallback>
            {recipient.full_name?.charAt(0) || recipient.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{recipient.full_name || recipient.email}</h2>
          {recipient.business_name && (
            <p className="text-sm text-gray-200">{recipient.business_name}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
