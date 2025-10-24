import React, { useEffect, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  listenToChats,
  listenToMessages,
  sendMessage,
} from "./api/chat.service";
import ChatList from "./components/ChatList";
import ChatThread from "./components/ChatThread";
import ChatInput from "./components/ChatInput";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsub = listenToChats(setChats);
    return unsub;
  }, []);

  const selectedId = useMemo(
    () =>
      selectedChat?.id || selectedChat?.chatThreadId || selectedChat?.chatId,
    [selectedChat]
  );

  useEffect(() => {
    if (!selectedId) return;
    const unsub = listenToMessages(selectedId, setMessages);
    return unsub;
  }, [selectedId]);

  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-4rem)]">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      {/* Sidebar */}
      <div className="w-full sm:w-1/3 lg:w-1/4 border-r border-border/40 overflow-y-auto">
        <ChatList
          chats={chats}
          onSelect={setSelectedChat}
          selected={selectedChat}
        />
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-950/40 to-black/60 backdrop-blur-lg">
        {selectedChat ? (
          <>
            <ChatThread chat={selectedChat} messages={messages} />
            <ChatInput chat={selectedChat} onSend={sendMessage} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
