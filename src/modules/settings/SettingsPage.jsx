import React from "react";
import { Toaster } from "react-hot-toast";
import ProfileForm from "./components/ProfileForm";
import PasswordForm from "./components/PasswordForm";

export default function SettingsPage() {
  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-950/40 to-black/70 backdrop-blur-md text-white">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold mb-2">Account Settings</h1>
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}
