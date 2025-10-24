import React, { useState } from "react";
import toast from "react-hot-toast";
import { updateUserProfile, updateUserEmail } from "../api/settings.service";

export default function ProfileForm() {
  const user = JSON.parse(localStorage.getItem("ballie_user") || "{}");
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [email, setEmail] = useState(user.email || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(user.photoURL || "");
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const loading = toast.loading("Updating profile...");
    try {
      await updateUserProfile({ displayName, photoFile });
      if (email !== user.email && password) {
        await updateUserEmail(email, password);
      }
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
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
      <h2 className="text-lg font-semibold text-white">Profile Settings</h2>

      <div className="flex items-center gap-4">
        <img
          src={preview || "https://via.placeholder.com/80"}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover border border-border/40"
        />
        <input
          type="file"
          accept="image/*"
          className="file:bg-blue-500/20 file:text-white text-sm"
          onChange={handleFile}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300">Display Name</label>
        <input
          className="input bg-white/5 mt-1 w-full rounded-lg px-3 py-2 text-white"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300">Email</label>
        <input
          className="input bg-white/5 mt-1 w-full rounded-lg px-3 py-2 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={saving}
        />
      </div>

      {email !== user.email && (
        <div>
          <label className="block text-sm text-gray-300">
            Current Password (required for email update)
          </label>
          <input
            type="password"
            className="input bg-white/5 mt-1 w-full rounded-lg px-3 py-2 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={saving}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
