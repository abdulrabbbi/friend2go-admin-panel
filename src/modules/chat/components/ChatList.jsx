import React from "react";

export default function ChatList({ chats, onSelect, selected }) {
  return (
    <div className="divide-y divide-border/40">
      {chats.map((chat) => {
        const cid = chat.id || chat.chatThreadId || chat.chatId;
        const isSelected = (selected?.id || selected?.chatThreadId || selected?.chatId) === cid;
        return (
        <button
          key={cid}
          onClick={() => onSelect(chat)}
          className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/10 ${
            isSelected ? "bg-white/10" : ""
          }`}
        >
          <img
            src={chat.chatImage}
            alt={chat.chatName}
            className="w-10 h-10 rounded-full object-cover border border-border/30"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{chat.chatName}</div>
            <div className="text-xs text-muted truncate">
              {chat.lastMessage || chat.lastMessageText || chat.lastMsg || chat.subtitle || "No messages yet"}
            </div>
          </div>
        </button>
        );
      })}
    </div>
  );
}
