import React, { useEffect, useMemo, useState } from "react";
import { storage } from "../../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import UserPicker from "./UserPicker";
import { getUserById } from "../../users/api/users.service"; 

export default function ComposeDrawer({
  open,
  onClose,
  initial = null,
  onSubmit, // async (payload) => campaign
}) {
  const [model, setModel] = useState({
    title: "",
    text: "",
    imageUrl: "",          // final download URL we’ll submit
    link: "",
    targetType: "all",     // all | topic | userIds
    topic: "all",
  });

  // local upload state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // object URL or existing URL
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // selected users (objects) for userIds targeting
  const [selectedUsers, setSelectedUsers] = useState([]);

  // init / edit
  useEffect(() => {
    if (!open) return;
    if (initial) {
      const img = initial.imageUrl || "";
      setModel({
        title: initial.title || "",
        text: initial.text || "",
        imageUrl: img,
        link: initial.link || "",
        targetType: initial.targetType || "all",
        topic: initial.topic || "all",
      });
      setFile(null);
      setPreview(img || null);
      setUploadPct(0);

      // hydrate selected users (if editing a "userIds" campaign)
      if (Array.isArray(initial.userIds) && initial.userIds.length) {
        Promise.all(
          initial.userIds.map((uid) => getUserById(uid).catch(() => null))
        )
          .then((arr) => arr.filter(Boolean))
          .then(setSelectedUsers)
          .catch((e) => {
            console.error("Failed to prefetch selected users", e);
            setSelectedUsers([]);
          });
      } else {
        setSelectedUsers([]);
      }
    } else {
      setModel({
        title: "",
        text: "",
        imageUrl: "",
        link: "",
        targetType: "all",
        topic: "all",
      });
      setFile(null);
      setPreview(null);
      setUploadPct(0);
      setSelectedUsers([]);
    }
  }, [open, initial]);

  // cleanup object URL
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(url);
  }

  function clearImage() {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setModel((m) => ({ ...m, imageUrl: "" }));
    setUploadPct(0);
  }

  async function uploadImageIfNeeded() {
    if (!file) return model.imageUrl || "";

    setUploading(true);
    setUploadPct(0);

    const safeName = `${Date.now()}-${(file.name || "image").replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
    const path = `notification-images/${safeName}`;
    const fileRef = ref(storage, path);

    const task = uploadBytesResumable(fileRef, file, {
      contentType: file.type || "application/octet-stream",
    });

    const url = await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snap) => {
          if (snap.totalBytes) {
            setUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          }
        },
        (err) => reject(err),
        async () => {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });

    setUploading(false);
    return url;
  }

  async function submit(e) {
    e?.preventDefault?.();
    if (saving || uploading) return;
    setSaving(true);
    try {
      const finalImageUrl = await uploadImageIfNeeded();

      const payload = {
        title: model.title,
        text: model.text,
        imageUrl: finalImageUrl,
        link: model.link,
        targetType: model.targetType,
        topic: model.targetType === "topic" ? model.topic || "all" : "all",
        userIds:
          model.targetType === "userIds"
            ? (selectedUsers || []).map((u) => u._id)
            : [],
        status: "draft",
      };

      await onSubmit?.(payload);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save. See console for details.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[28rem] md:w-[32rem] lg:w-[36rem] glass p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {initial ? "Edit Notification" : "New Notification"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <div className="text-sm text-muted">Title</div>
            <input
              className="input mt-1 w-full"
              value={model.title}
              onChange={(e) => setModel((m) => ({ ...m, title: e.target.value }))}
              required
            />
          </label>

          <label className="block">
            <div className="text-sm text-muted">Message</div>
            <textarea
              className="input mt-1 w-full h-28 resize-y"
              value={model.text}
              onChange={(e) => setModel((m) => ({ ...m, text: e.target.value }))}
              required
            />
          </label>

          {/* Image uploader */}
          <div className="space-y-2">
            <div className="text-sm text-muted">Image (optional)</div>
            {!preview ? (
              <label className="block border border-dashed border-border/60 rounded-xl p-4 cursor-pointer hover:bg-white/5">
                <div className="text-center text-sm text-muted">
                  Click to upload or drag and drop
                  <div className="text-xs mt-1">PNG, JPG up to ~5MB</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickFile}
                />
              </label>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-border/60">
                <img
                  src={preview}
                  alt="Selected image preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  <label className="btn-ghost h-8 px-3 cursor-pointer">
                    Replace
                    <input type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                  </label>
                  <button type="button" className="btn-ghost h-8 px-3" onClick={clearImage}>
                    Remove
                  </button>
                </div>
                {uploading && (
                  <div className="absolute left-0 right-0 bottom-0 bg-black/40">
                    <div className="h-1 bg-primary" style={{ width: `${uploadPct}%` }} />
                    <div className="p-2 text-xs text-center">Uploading… {uploadPct}%</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-sm text-muted">Link (optional)</div>
              <input
                className="input mt-1 w-full"
                value={model.link}
                onChange={(e) => setModel((m) => ({ ...m, link: e.target.value }))}
                placeholder="https://your.app/page"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted">Target</div>
            <div className="flex gap-2">
              {["all", "topic", "userIds"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn-ghost px-3 py-1.5 ${model.targetType === t ? "ring-1 ring-primary/60" : ""}`}
                  onClick={() => setModel((m) => ({ ...m, targetType: t }))}
                >
                  {t === "all" ? "All users" : t === "topic" ? "Topic" : "Specific users"}
                </button>
              ))}
            </div>

            {model.targetType === "topic" && (
              <label className="block">
                <div className="text-sm text-muted">Topic</div>
                <input
                  className="input mt-1 w-full"
                  value={model.topic}
                  onChange={(e) => setModel((m) => ({ ...m, topic: e.target.value }))}
                  placeholder="all"
                />
              </label>
            )}

            {model.targetType === "userIds" && (
              <UserPicker
                value={selectedUsers}
                onChange={setSelectedUsers}
                placeholder="Search users by name or email…"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving || uploading}>
              {uploading ? "Uploading…" : initial ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
