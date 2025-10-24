import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "../../../lib/firebase";

// 🔹 Login with Email & Password
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  // Store token & user info
  const token = await user.getIdToken();
  localStorage.setItem("ballie_token", token);
  localStorage.setItem(
    "ballie_user",
    JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    })
  );
  try {
    window.dispatchEvent(
      new CustomEvent("ballie:user-updated", {
        detail: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
        },
      })
    );
  } catch (e) {
    // ignore if not in browser
  }
  return user;
}

// 🔹 Login with Google OAuth
export async function loginWithOAuth(provider) {
  if (provider !== "google") throw new Error("Unsupported provider");

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const token = await user.getIdToken();

  localStorage.setItem("ballie_token", token);
  localStorage.setItem(
    "ballie_user",
    JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    })
  );
  try {
    window.dispatchEvent(
      new CustomEvent("ballie:user-updated", {
        detail: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
        },
      })
    );
  } catch (e) {
    // ignore if not in browser
  }
  return user;
}

// 🔹 Send password reset link
export async function requestPasswordReset(email) {
  const target = String(email || "").trim();
  if (!target) throw new Error("Enter an email address");

  try {
    // Optional: set email template language from browser
    try {
      auth.languageCode = navigator?.language || "en";
    } catch (_) {}

    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    const envUrl = import.meta?.env?.VITE_PUBLIC_RESET_REDIRECT;
    const continueUrl = envUrl || origin;

    if (continueUrl) {
      // Try with actionCodeSettings for better UX
      await sendPasswordResetEmail(auth, target, {
        url: continueUrl,
        handleCodeInApp: true,
      });
      return true;
    }
  } catch (e) {
    // If provided continue URL is not authorized or invalid, retry without it
    const code = e?.code || "";
    const shouldRetry =
      code === "auth/invalid-continue-uri" ||
      code === "auth/unauthorized-continue-uri" ||
      code === "auth/argument-error";
    if (!shouldRetry) throw e;
  }

  // Fallback: basic reset (uses Firebase console default)
  await sendPasswordResetEmail(auth, target);
  return true;
}
