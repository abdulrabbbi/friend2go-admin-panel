// Toggle mock via VITE_USE_MOCK=1; set VITE_API_URL for real backend
import axios from "axios";

// Use mock when VITE_USE_MOCK=1 or when no VITE_API_URL is configured (makes dev easier)
const _env = import.meta?.env || {};
const USE_MOCK = _env.VITE_USE_MOCK === "1" || !_env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL || "/api",
  withCredentials: true,
});

// normalize
const mapSub = (s) => ({
  _id: s._id || s.id,
  name: s.name || "",
  email: s.email || "",
  plan: s.plan || "free", // free | premium | pro
  status: s.status || "active", // active | unsubscribed | bounced
  locale: s.locale || "en",
  tags: Array.isArray(s.tags) ? s.tags : [],
  subscribedAt: s.subscribedAt || new Date().toISOString(),
  lastEmailAt: s.lastEmailAt || null,
});

// ------- mock data -------
let MOCK = [
  {
    _id: "s1",
    name: "Jesse Carter",
    email: "jesse@gmail.app",
    plan: "premium",
    status: "active",
    locale: "en",
    tags: ["beta", "partner"],
    subscribedAt: "2025-09-30T09:00:00.000Z",
    lastEmailAt: "2025-10-12T10:05:00.000Z",
  },
  {
    _id: "s2",
    name: "Zoë van Dijk",
    email: "zoe@pubhouse.nl",
    plan: "free",
    status: "unsubscribed",
    locale: "nl",
    tags: ["venues"],
    subscribedAt: "2025-10-03T15:00:00.000Z",
    lastEmailAt: "2025-10-05T15:41:00.000Z",
  },
  {
    _id: "s3",
    name: "Omar Ali",
    email: "omar@example.com",
    plan: "pro",
    status: "active",
    locale: "en",
    tags: [],
    subscribedAt: "2025-10-10T12:30:00.000Z",
    lastEmailAt: null,
  },
];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function mockFilter(data, { q, plan, status }) {
  return data.filter((s) => {
    const hitQ =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
    const hitPlan = !plan || s.plan === plan;
    const hitStatus = !status || s.status === status;
    return hitQ && hitPlan && hitStatus;
  });
}

// ------- public API -------
export async function listSubscribers({
  page = 1,
  limit = 10,
  q = "",
  plan = "",
  status = "",
} = {}) {
  if (USE_MOCK) {
    await delay();
    const normQ = q.trim().toLowerCase();
    const filtered = mockFilter(MOCK, { q: normQ, plan, status });
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, total, page, limit };
  }
  const res = await api.get("/subscribers", {
    params: { page, limit, q, plan, status },
  });
  const items = (res.data?.items || []).map(mapSub);
  return {
    items,
    total: res.data?.total || items.length,
    page: res.data?.page || page,
    limit: res.data?.limit || limit,
  };
}

export async function getSubscriber(id) {
  if (USE_MOCK) {
    await delay();
    return MOCK.find((s) => s._id === id);
  }
  const res = await api.get(`/subscribers/${id}`);
  return mapSub(res.data);
}

export async function createSubscriber(payload) {
  if (USE_MOCK) {
    await delay();
    const _id = crypto.randomUUID();
    const sub = mapSub({
      _id,
      ...payload,
      subscribedAt: new Date().toISOString(),
    });
    MOCK.unshift(sub);
    return sub;
  }
  const res = await api.post("/subscribers", payload);
  return mapSub(res.data);
}

export async function updateSubscriber(id, payload) {
  if (USE_MOCK) {
    await delay();
    const i = MOCK.findIndex((s) => s._id === id);
    if (i >= 0) {
      MOCK[i] = { ...MOCK[i], ...payload };
      return MOCK[i];
    }
    throw new Error("Subscriber not found");
  }
  const res = await api.put(`/subscribers/${id}`, payload);
  return mapSub(res.data);
}

export async function deleteSubscriber(id) {
  if (USE_MOCK) {
    await delay();
    MOCK = MOCK.filter((s) => s._id !== id);
    return { ok: true };
  }
  await api.delete(`/subscribers/${id}`);
  return { ok: true };
}
