import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 🔹 Upload new profile picture
export async function uploadProfileImage(file, uid) {
  const path = `profile-images/${uid}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return await getDownloadURL(fileRef);
}

// 🔹 Update user display name & photo
export async function updateUserProfile({ displayName, photoFile }) {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  let photoURL = user.photoURL;
  if (photoFile) {
    photoURL = await uploadProfileImage(photoFile, user.uid);
  }

  await updateProfile(user, {
    displayName: displayName || user.displayName,
    photoURL,
  });

  localStorage.setItem(
    "ballie_user",
    JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName,
      photoURL,
    })
  );

  try {
    window.dispatchEvent(
      new CustomEvent("ballie:user-updated", {
        detail: {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName,
            photoURL,
          },
        },
      })
    );
  } catch (e) {
    // no-op for non-browser environments
  }

  return { displayName, photoURL };
}

// 🔹 Update email (requires recent login)
export async function updateUserEmail(newEmail, currentPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not found");

  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updateEmail(user, newEmail);
  return true;
}

// 🔹 Update password (requires reauth)
export async function updateUserPassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not found");

  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
  return true;
}
