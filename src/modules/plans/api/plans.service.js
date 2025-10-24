import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const plansCol = collection(db, "plans");

function parsePlan(d) {
  return {
    _id: d.id,
    id: d.id,
    title: d.title || "",
    description: d.description || "",
    category: d.category || "",
    age: d.age || "",
    status: d.status || "",
    location: d.location || "",
    planPhoto: d.planPhoto || "",
    planCreatorID: d.planCreatorID || "",
    maxMembers: d.maxMembers || "",
    startDate: d.startDate || "",
    endDate: d.endDate || "",
    startTime: d.startTime || "",
    endTime: d.endTime || "",
    createdAt: d.createdAt || "",
  };
}

export async function listPlans() {
  const snap = await getDocs(query(plansCol, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => parsePlan({ id: d.id, ...d.data() }));
}

export async function createPlan(model) {
  const payload = {
    ...model,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(plansCol, payload);
  const snap = await getDoc(docRef);
  return parsePlan({ id: snap.id, ...snap.data() });
}

export async function updatePlan(id, model) {
  const docRef = doc(db, "plans", id);
  await updateDoc(docRef, model);
  return { ok: true };
}

export async function deletePlan(id) {
  await deleteDoc(doc(db, "plans", id));
  return { ok: true };
}

export async function getPlanById(id) {
  const snap = await getDoc(doc(db, "plans", id));
  if (!snap.exists()) return null;
  return parsePlan({ id: snap.id, ...snap.data() });
}

const PlansService = { listPlans, createPlan, updatePlan, deletePlan, getPlanById };
export default PlansService;
