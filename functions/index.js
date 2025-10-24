const functions = require("firebase-functions");
const admin = require("firebase-admin");

try { admin.app(); } catch { admin.initializeApp(); }

const db = admin.firestore();
const messaging = admin.messaging();

const REGION = "us-central1";
const FCM_CHUNK = 500;

/** Admin check: custom claim admin=true OR UID in env ADMIN_UIDS (comma-separated) */
function isAdmin(ctx) {
  const claim = ctx.auth && ctx.auth.token && ctx.auth.token.admin === true;
  const allow = (process.env.ADMIN_UIDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(ctx.auth && ctx.auth.uid ? ctx.auth.uid : "");
  return claim || allow;
}

function buildMessageParts(c) {
  const notification = {};
  if (c.title) notification.title = c.title;
  if (c.text) notification.body = c.text;
  if (c.imageUrl) notification.image = c.imageUrl;

  const webpush = c.link
    ? { fcmOptions: { link: c.link }, headers: { Urgency: "high" } }
    : { headers: { Urgency: "high" } };

  return { notification, webpush };
}

async function sendCampaign(campaignId) {
  const ref = db.collection("notificationCampaigns").doc(campaignId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError("not-found", "Campaign not found");
  }

  const c = snap.data();
  const { notification, webpush } = buildMessageParts(c);

  if (c.targetType === "all" || c.targetType === "topic") {
    const topic = c.targetType === "all" ? "all" : (c.topic || "all");
    const messageId = await messaging.send({ topic, notification, webpush });
    await ref.update({
      status: "completed",
      result: { topic, messageId },
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true, result: { topic, messageId } };
  }

  if (c.targetType === "userIds" && Array.isArray(c.userIds) && c.userIds.length) {
    const docs = await Promise.all(
      c.userIds.map((uid) => db.collection("user").doc(uid).get())
    );

    const tokens = [];
    for (const d of docs) {
      if (!d.exists) continue;
      const v = d.data() || {};
      if (Array.isArray(v.fcmTokens)) tokens.push(...v.fcmTokens.filter(Boolean));
      else if (typeof v.fcmToken === "string" && v.fcmToken) tokens.push(v.fcmToken);
    }

    if (!tokens.length) {
      await ref.update({ status: "failed", result: { error: "No tokens" } });
      return { ok: false, result: { error: "No tokens" } };
    }

    let success = 0, failure = 0;
    const deadTokens = [];

    for (let i = 0; i < tokens.length; i += FCM_CHUNK) {
      const batch = tokens.slice(i, i + FCM_CHUNK);
      const resp = await messaging.sendEachForMulticast({
        tokens: batch,
        notification,
        webpush,
      });
      success += resp.successCount;
      failure += resp.failureCount;

      resp.responses.forEach((r, idx) => {
        if (!r.success) {
          const code = (r.error && r.error.code) || "";
          if (code.includes("registration-token-not-registered")) {
            deadTokens.push(batch[idx]);
          }
        }
      });
    }

    if (deadTokens.length) {
      await db.runTransaction(async (t) => {
        for (const d of docs) {
          if (!d.exists) continue;
          const data = d.data() || {};
          const arr = Array.isArray(data.fcmTokens) ? data.fcmTokens : [];
          const filtered = arr.filter((tok) => !deadTokens.includes(tok));
          if (filtered.length !== arr.length) t.update(d.ref, { fcmTokens: filtered });
        }
      });
    }

    await ref.update({
      status: "completed",
      result: { success, failure, cleaned: deadTokens.length },
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true, result: { success, failure } };
  }

  throw new functions.https.HttpsError("invalid-argument", "Unsupported targetType");
}

/** (A) subscribe a token to a topic */
exports.topicSubscribe = functions
  .region(REGION)
  .https.onCall(async (data, ctx) => {
    if (!ctx.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
    }
    const token = data && data.token;
    const topic = (data && data.topic ? String(data.topic) : "all").trim();
    if (!token) {
      throw new functions.https.HttpsError("invalid-argument", "token required");
    }
    await messaging.subscribeToTopic([token], topic);
    return { ok: true };
  });

/** (B) send now */
exports.notificationsSend = functions
  .region(REGION)
  .https.onCall(async (data, ctx) => {
    if (!ctx.auth || !isAdmin(ctx)) {
      throw new functions.https.HttpsError("permission-denied", "Admins only.");
    }
    const campaignId = data && data.campaignId;
    if (!campaignId) {
      throw new functions.https.HttpsError("invalid-argument", "campaignId required");
    }
    return await sendCampaign(campaignId);
  });

/** (C) optional cron (Blaze plan) */
exports.notificationsCron = functions
  .region(REGION)
  .pubsub.schedule("every 1 minutes")
  .timeZone("UTC")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const q = await db.collection("notificationCampaigns")
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .limit(10)
      .get();

    for (const doc of q.docs) {
      try { await sendCampaign(doc.id); }
      catch (e) { console.error("cron send failed", doc.id, e); }
    }
    return null;
  });
