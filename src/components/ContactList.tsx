import React from "react";
import { User } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ContactListProps {
  contacts: User[];
  onSelectContact: (contact: User) => void;
  selectedContactId?: string;
  loading?: boolean;
  unreadCounts?: { [key: string]: number };
}

const ContactList = ({ 
  contacts, 
  onSelectContact, 
  selectedContactId, 
  loading = false,
  unreadCounts = {}
}: ContactListProps) => {
  // Sort contacts by most recent message
  const sortedContacts = [...contacts].sort((a, b) => {
    const aLastSeen = new Date(a.last_seen || 0).getTime();
    const bLastSeen = new Date(b.last_seen || 0).getTime();
    return bLastSeen - aLastSeen;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-red-600 border-b border-red-700">
        <h2 className="font-semibold text-white text-lg">Contacts</h2>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-red-600 border-opacity-50 border-t-red-600 rounded-full"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="p-4 text-center text-gray-600">
          No contacts found
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {sortedContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContactId === contact.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar_url} alt={contact.name || ""} />
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    {contact.name ? contact.name.substring(0, 2).toUpperCase() : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">{contact.name || "Unknown User"}</p>
                    <div className="flex items-center gap-2">
                      {unreadCounts[contact.id] > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center">
                          {unreadCounts[contact.id]}
                        </Badge>
                      )}
                      {contact.is_online && (
                        <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  {contact.business_name && (
                    <p className="text-sm text-gray-600 truncate">{contact.business_name}</p>
                  )}
                  {contact.category && (
                    <p className="text-xs text-gray-500 truncate">{contact.category}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactList;
