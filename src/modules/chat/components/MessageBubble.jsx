import React from "react";
import { getAuth } from "firebase/auth";

export default function MessageBubble({ msg }) {
  const currentUid = getAuth().currentUser?.uid;
  const isOwn = msg.sentBy === currentUid;
  const ts = msg.sentAt;
  const timeStr = ts?.toDate
    ? ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : new Date(ts?.seconds * 1000 || ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-3 py-2 ${
          isOwn
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white/10 text-white rounded-bl-none"
        }`}
      >
        {!isOwn && (
          <div className="text-xs text-gray-300 mb-0.5 flex items-center gap-2">
            <img
              src={msg.senderProfileImage}
              alt="sender"
              className="w-4 h-4 rounded-full"
            />
            {msg.senderName || msg.adminName || "User"}
          </div>
        )}

        {(() => {
          const text = msg.textMessage || msg.message || msg.text || msg.body || "";
          return text ? (
            <div className="text-sm whitespace-pre-wrap break-words">{text}</div>
          ) : null;
        })()}

        {msg.attachmentUrl && (
          <div className="mt-2">
            {String(msg.attachmentType || "").startsWith("image/") ? (
              <img
                src={msg.attachmentUrl}
                alt={msg.attachmentName}
                className="rounded-lg max-h-64 w-auto object-contain"
              />
            ) : String(msg.attachmentType || "").startsWith("video/") ? (
              <video
                controls
                className="rounded-lg max-h-64 w-auto object-contain"
              >
                <source src={msg.attachmentUrl} type={msg.attachmentType} />
              </video>
            ) : (
              <a
                href={msg.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-xs"
              >
                {msg.attachmentName || "Download attachment"}
              </a>
            )}
          </div>
        )}

        <div className="text-[10px] opacity-70 mt-1 text-right">{timeStr}</div>
      </div>
    </div>
  );
}
