import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, requestPasswordReset } from "./api/auth.service";
import AuthBackground from "./components/AuthBackground";
import { MdVisibility, MdVisibilityOff, MdMail, MdLock } from "react-icons/md";
// Logo removed from the login header; keep spacing only
import { toast } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  // reset modal state
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    if (!email || !password) {
      setErr("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      if (!remember) {
        // move token to session if you prefer ephemeral sessions
        const t = localStorage.getItem("ballie_token");
        const u = localStorage.getItem("ballie_user");
        sessionStorage.setItem("ballie_token", t || "");
        sessionStorage.setItem("ballie_user", u || "{}");
      }
      toast.success("Signed in");
      navigate("/");
    } catch (e2) {
      const message = e2?.message || "Unable to sign in";
      setErr(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // Open reset modal or prefill it if email exists
  function openReset() {
    setResetEmail(email || "");
    setErr("");
    setInfo("");
    setResetOpen(true);
  }

  async function handleResetSend(e) {
    e?.preventDefault?.();
    const targetEmail = (resetEmail || "").trim();
    if (!targetEmail) {
      toast.error("Enter an email address");
      return;
    }
    // Basic email format check to reduce typos
    const emailOk = /.+@.+\..+/.test(targetEmail);
    if (!emailOk) {
      toast.error("Enter a valid email address");
      return;
    }

    setResetLoading(true);
    const loadingToast = toast.loading("Sending reset link...");
    try {
      await requestPasswordReset(targetEmail);
      const msg = `If an account exists for ${targetEmail}, a reset link has been sent.`;
      toast.success(msg);
      setResetOpen(false);
      setInfo(msg);
    } catch (err) {
      console.error(err);
      const msg = err?.message || "Could not send reset link right now.";
      toast.error(msg);
      setErr(msg);
    } finally {
      setResetLoading(false);
      toast.dismiss(loadingToast);
    }
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(80%_60%_at_50%_-10%,#0b0f14,transparent),linear-gradient(#06080b,#06080b)] text-slate-100">
      <AuthBackground />

      {/* center container with subtle tilt and glow */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div
          className="w-full max-w-md"
          style={{
            transform:
              "rotateX(var(--rx,0)) rotateY(var(--ry,0)) translateX(var(--tx,0)) translateY(var(--ty,0))",
            transition: "transform 120ms ease-out",
          }}
        >
          {/* halo glow */}
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-40"
            style={{
              background:
                "radial-gradient(60% 80% at 50% -10%, rgba(168,255,26,0.45), transparent 60%)",
              filter: "drop-shadow(0 0 40px rgba(168,255,26,.3))",
            }}
          />
          <div className="glass rounded-3xl border border-border/60 shadow-2xl backdrop-blur-xl">
            <div className="p-7 sm:p-8">
              {/* Brand (logo removed; keep spacing) */}
              <div className="flex items-center gap-3 mb-6">
                <div aria-hidden="true" className="h-8 w-8 rounded-md" />
                <div>
                  <div className="text-lg font-semibold leading-none">
                    Admin Login
                  </div>
                  <div className="text-[11px] text-muted">
                    Sign in to continue
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm text-muted">Email</span>
                  <div className="mt-1 input flex items-center gap-2">
                    <MdMail className="text-muted" />
                    <input
                      className="bg-transparent flex-1 outline-none"
                      placeholder="you@gmail.app"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </label>

                <label className="block">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted">Password</span>
                    <button
                      type="button"
                      className="text-[11px] text-primary hover:underline"
                      onClick={openReset}
                      disabled={loading}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="mt-1 input flex items-center gap-2">
                    <MdLock className="text-muted" />
                    <input
                      className="bg-transparent flex-1 outline-none"
                      placeholder="••••••••"
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-muted hover:text-text p-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPass((v) => !v);
                      }}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? (
                        <MdVisibilityOff aria-hidden="true" />
                      ) : (
                        <MdVisibility aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                </div>

                {err && (
                  <div className="text-danger text-xs bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
                    {err}
                  </div>
                )}
                {info && (
                  <div className="text-success text-xs bg-success/10 border border-success/30 rounded-xl px-3 py-2">
                    {info}
                  </div>
                )}

                <button
                  className="btn w-full h-11 mt-2 relative overflow-hidden"
                  disabled={loading}
                >
                  <span className={loading ? "opacity-0" : ""}>Sign in</span>
                  {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* subtle bottom caption */}
          <div className="text-center mt-6 text-[11px] text-muted">
            © {new Date().getFullYear()} — All rights reserved.
          </div>
        </div>
      </div>

      {/* Password reset modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
          resetOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setResetOpen(false)}
        />
        <div className="relative z-10 w-[92%] max-w-lg bg-[#0b0f14]/90 border border-border/40 rounded-xl p-5 backdrop-blur-md shadow-2xl">
          <h3 className="text-lg font-semibold mb-2 text-white">
            Reset password
          </h3>
          <p className="text-xs text-muted mb-3">
            Enter the email to receive a password reset link.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResetSend();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              className="input w-full bg-transparent"
              placeholder="you@gmail.app"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setResetOpen(false)}
                disabled={resetLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetSend}
                className="btn"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending…" : "Send reset link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
