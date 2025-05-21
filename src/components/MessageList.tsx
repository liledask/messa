import React, { useEffect, useRef } from "react";
import { DirectMessage } from "@/types/chat";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: DirectMessage[];
  currentUserId: string;
  loading?: boolean;
}

const MessageList = ({ messages, currentUserId, loading = false }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sort messages chronologically (oldest first)
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative"
      style={{
        backgroundImage: 'url("/mealogo.png.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '60%',
        opacity: 1
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'rgba(255,255,255,0.7)',
        zIndex: 0
      }} />
      <div className="relative z-10">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-red-600 border-opacity-50 border-t-red-600 rounded-full"></div>
          </div>
        ) : (
          sortedMessages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    isCurrentUser
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-900 shadow-sm"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {format(new Date(message.created_at), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
