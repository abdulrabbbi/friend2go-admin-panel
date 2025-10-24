import React, { useState } from "react";
import toast from "react-hot-toast";
import { updateUserPassword } from "../api/settings.service";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword)
      return toast.error("Please fill all fields");

    setSaving(true);
    const loading = toast.loading("Updating password...");
    try {
      await updateUserPassword(currentPassword, newPassword);
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update password");
    } finally {
      toast.dismiss(loading);
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white/10 p-6 rounded-xl border border-border/30"
    >
      <h2 className="text-lg font-semibold text-white">Change Password</h2>

      <div>
        <label className="block text-sm text-gray-300">Current Password</label>
        <input
          type="password"
          className="input bg-white/5 mt-1 w-full rounded-lg px-3 py-2 text-white"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300">New Password</label>
        <input
          type="password"
          className="input bg-white/5 mt-1 w-full rounded-lg px-3 py-2 text-white"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={saving}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
      >
        {saving ? "Saving..." : "Update Password"}
      </button>
    </form>
  );
}
