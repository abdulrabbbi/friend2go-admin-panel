import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const usersCol = collection(db, "user");

// --- helper: strip undefined (Firestore can't accept undefined) ---
const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

function parseUser(d) {
  return {
    _id: d.id,
    fullName: d.fullName || "",
    email: d.email || "",
    role: d.role || "fan",
    // Preserve backend truth; don't default to "active" so filters match correctly
    status: typeof d.status === "string" ? d.status : "",
    premium: !!d.premium,
    language: d.language || "en",
    bio: d.bio || "",
    profileImage: d.profileImage || "",
    fcmToken: d.fcmToken || "",
    authType: d.authType || "email",         
    createdAt:
      typeof d.createdAt?.toDate === "function"
        ? d.createdAt.toDate()
        : d.createdAt instanceof Date
        ? d.createdAt
        : null,
  };
}

export async function listUsers(params = {}) {
  const { q = "", role = "", status = "" } = params;

  // Normalize status for case-insensitive matching (handles "Active" vs "active")
  const normalizeStatusVariants = (s) => {
    if (!s) return [];
    const lower = String(s).toLowerCase();
    const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
    const set = new Set([lower, cap, s]);
    return Array.from(set);
  };

  const constraints = [];
  if (role) constraints.push(where("role", "==", role));
  if (status) {
    const variants = normalizeStatusVariants(status);
    // Support boolean storage for status as well (true ~ active, false ~ suspended)
    if (status.toLowerCase() === "active") variants.push(true);
    if (status.toLowerCase() === "suspended") variants.push(false);
    const unique = Array.from(new Set(variants));
    if (unique.length > 1) constraints.push(where("status", "in", unique));
    else constraints.push(where("status", "==", unique[0]));
  }

  // Build query for docs
  let snap;
  try {
    const preferOrder = constraints.length === 0;
    const qRef = preferOrder
      ? query(usersCol, orderBy("createdAt", "desc"))
      : query(usersCol, ...constraints);
    snap = await getDocs(qRef);
  } catch (_) {
    // Fallback without order when index is missing
    const qRefNoOrder = query(usersCol, ...constraints);
    snap = await getDocs(qRefNoOrder);
  }

  // Compute total from backend using aggregation (best-effort)
  let totalFromServer = undefined;
  try {
    const countRef = constraints.length ? query(usersCol, ...constraints) : query(usersCol);
    const agg = await getCountFromServer(countRef);
    totalFromServer = agg.data().count;
  } catch (_) {
    // ignore; we'll fall back to client count
  }

  let users = snap.docs.map((docSnap) => parseUser({ id: docSnap.id, ...docSnap.data() }));

  // Client-side text search
  const queryStr = q.trim().toLowerCase();
  if (queryStr) {
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(queryStr) ||
        u.email.toLowerCase().includes(queryStr)
    );
  }

  // Deterministic sort by createdAt desc
  users.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return { items: users, total: totalFromServer ?? users.length };
}

export async function createUser(model) {
  const payload = stripUndefined({
    fullName: model.fullName,
    email: model.email,
    role: model.role,
    status: model.status,
    premium: !!model.premium,
    language: model.language || "en",
    notes: model.notes || "",
    bio: model.bio || "",
    fcmToken: model.fcmToken || "",
    profileImage: model.profileImage || "",
    authType: model.authType || "email",
    createdAt: serverTimestamp(),             // ✅ server time
  });
  const docRef = await addDoc(usersCol, payload);
  const snap = await getDoc(docRef);
  return parseUser({ id: snap.id, ...snap.data() });
}

export async function updateUser(id, model) {
  const docRef = doc(db, "user", id);

  // ❗ send only defined fields; don’t overwrite createdAt
  const { createdAt, _id, ...rest } = model || {};
  const payload = stripUndefined(rest);

  await updateDoc(docRef, payload);
  return { ok: true };
}

export async function deleteUser(id) {
  await deleteDoc(doc(db, "user", id));
  return { ok: true };
}

export async function getUserById(id) {
  const snap = await getDoc(doc(db, "user", id));
  if (!snap.exists()) return null;
  return parseUser({ id: snap.id, ...snap.data() });
}

export async function uploadUserProfileImage(file, userId) {
  if (!file) throw new Error("No file");
  const safeName = `${Date.now()}-${(file.name || "image").replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const path = userId ? `profile-images/${userId}/${safeName}` : `profile-images/${safeName}`;
  const fileRef = ref(storage, path);

  const task = uploadBytesResumable(fileRef, file, {
    contentType: file.type || "application/octet-stream",
  });

  await new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      null,
      (err) => {
        console.error("Storage error:", err.code, err.message);
        reject(err);
      },
      resolve
    );
  });

  return await getDownloadURL(task.snapshot.ref);
}

// Dev smoke test helper to validate Storage setup quickly
export async function testUploadStorage() {
  const blob = new Blob(["hello"], { type: "text/plain" });
  const file = new File([blob], "ping.txt", { type: "text/plain" });
  const url = await uploadUserProfileImage(file);
  // eslint-disable-next-line no-console
  console.log("Upload OK, URL:", url);
  return url;
}

if (typeof window !== "undefined" && import.meta?.env?.DEV) {
  // @ts-ignore: exposed for manual testing in dev console
  window.testUploadStorage = testUploadStorage;
}

const UsersService = {
  listUsers, createUser, updateUser, deleteUser, getUserById, uploadUserProfileImage
};
export default UsersService;
