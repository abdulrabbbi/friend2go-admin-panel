import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 🔹 Listen to all chats
export function listenToChats(callback) {
  const qRef = query(collection(db, "chat"), orderBy("lastMessageTime", "desc"));
  return onSnapshot(qRef, (snap) => {
    const chats = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        chatThreadId: data.chatThreadId || doc.id,
        lastMessage: data.lastMessage || "",
        lastMessageTime: data.lastMessageTime || null,
        chatName: data.chatName || data.name || "Chat",
        chatImage: data.chatImage || "",
        ...data,
      };
    });
    callback(chats);
  });
}

// 🔹 Listen to messages
export function listenToMessages(chatId, callback) {
  const msgRef = query(
    collection(db, "chat", chatId, "messages"),
    orderBy("sentAt", "asc")
  );
  return onSnapshot(msgRef, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

// 🔹 Handle file upload
async function uploadAttachment(file, chatId) {
  const safeName = `${Date.now()}-${(file.name || "file").replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const fileRef = ref(storage, `chat-attachments/${chatId}/${safeName}`);
  await uploadBytes(fileRef, file, {
    contentType: file.type || "application/octet-stream",
  });
  const url = await getDownloadURL(fileRef);
  return { url, name: file.name, type: file.type, size: file.size };
}

// 🔹 Send a message (with optional file)
export async function sendMessage(chatId, payload, file) {
  const msgRef = collection(db, "chat", chatId, "messages");
  let attachment = null;
  if (file) attachment = await uploadAttachment(file, chatId);

  const docPayload = {
    ...payload,
    sentAt: serverTimestamp(),
    attachmentUrl: attachment?.url || null,
    attachmentName: attachment?.name || null,
    attachmentType: attachment?.type || null,
    attachmentSize: attachment?.size || null,
  };

  await addDoc(msgRef, docPayload);

  // Update chat summary
  const summary = attachment?.name
    ? `📎 ${attachment.name}`
    : payload.textMessage || "Attachment";
  await updateDoc(doc(db, "chat", chatId), {
    lastMessage: summary,
    lastMessageTime: serverTimestamp(),
  });
}
