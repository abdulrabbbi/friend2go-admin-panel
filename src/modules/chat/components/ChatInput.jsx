import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "react-hot-toast";

export default function ChatInput({ chat, onSend }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const auth = getAuth();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    const u = auth.currentUser;
    if (!u) {
      toast.error("Please sign in to send messages");
      return;
    }

    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("ballie_user") || "{}") || {};
      } catch {
        return {};
      }
    })();
    const derivedName =
      u.displayName || stored.displayName || (u.email ? u.email.split("@")[0] : "Admin");
    const payload = {
      textMessage: text.trim() || "",
      sentBy: u.uid,
      senderName: derivedName,
      senderProfileImage: u.photoURL || "",
      adminId: u.uid,
      adminName: derivedName,
      isAdmin: true,
    };

    const chatId = chat?.id || chat?.chatThreadId || chat?.chatId;
    if (!chatId) {
      toast.error("No chat selected");
      return;
    }
    setSending(true);
    const loadingToast = toast.loading("Sending...");
    try {
      await onSend(chatId, payload, file || undefined);
      toast.success("Message sent!");
      setText("");
      setFile(null);
      const fin = document.getElementById("chat-file-input");
      if (fin) fin.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="p-3 border-t border-border/40 bg-white/10 flex flex-col sm:flex-row gap-2"
    >
      <div className="flex-1 flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 input rounded-xl bg-white/5 text-white placeholder:text-gray-400 px-3 py-2"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
        />
        {/* <input
          id="chat-file-input"
          type="file"
          className="file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-white file:cursor-pointer text-xs"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={sending}
        /> */}
      </div>

      {/* {file && (
        <div className="text-xs text-muted sm:mt-1 break-all">
          📎 {file.name}
        </div>
      )} */}

      <button
        type="submit"
        disabled={sending || (!text.trim() && !file)}
        className="btn bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
