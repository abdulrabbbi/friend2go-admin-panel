import {
  collection, addDoc, getDocs, orderBy, query, deleteDoc, doc,
  serverTimestamp, updateDoc, getDoc
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

// Use default app + your region (you deployed in us-central1)
const functions = getFunctions(undefined, "us-central1");

const col = collection(db, "notificationCampaigns");

function parseCampaign(d) {
  return {
    _id: d.id,
    title: d.title || "",
    text: d.text || "",
    imageUrl: d.imageUrl || "",
    link: d.link || "",
    targetType: d.targetType || "all", // "all" | "topic" | "userIds"
    topic: d.topic || "all",
    userIds: Array.isArray(d.userIds) ? d.userIds : [],
    status: d.status || "draft",       // "draft" | "scheduled" | "completed" | "failed"
    result: d.result || null,
    createdAt: typeof d.createdAt?.toDate === "function" ? d.createdAt.toDate() : d.createdAt ?? null,
    sentAt: typeof d.sentAt?.toDate === "function" ? d.sentAt.toDate() : d.sentAt ?? null,
    scheduledAt: typeof d.scheduledAt?.toDate === "function" ? d.scheduledAt.toDate() : d.scheduledAt ?? null,
  };
}

export async function listCampaigns() {
  const snap = await getDocs(query(col, orderBy("createdAt", "desc")));
  return snap.docs.map((s) => parseCampaign({ id: s.id, ...s.data() }));
}

export async function createCampaign(model) {
  const ref = await addDoc(col, {
    title: model.title || "",
    text: model.text || "",
    imageUrl: model.imageUrl || "",
    link: model.link || "",
    targetType: model.targetType || "all",
    topic: model.topic || "all",
    userIds: Array.isArray(model.userIds) ? model.userIds : [],
    status: model.status || "draft",
    scheduledAt: model.scheduledAt || null,
    createdAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return parseCampaign({ id: snap.id, ...snap.data() });
}

export async function updateCampaign(id, patch) {
  await updateDoc(doc(col, id), patch);
  const snap = await getDoc(doc(col, id));
  return parseCampaign({ id: snap.id, ...snap.data() });
}

export async function deleteCampaign(id) {
  await deleteDoc(doc(col, id));
  return { ok: true };
}

export async function sendCampaignNow(campaignId) {
  const call = httpsCallable(functions, "notificationsSend");
  const res = await call({ campaignId });
  return res.data;
}

export default { listCampaigns, createCampaign, updateCampaign, deleteCampaign, sendCampaignNow };
