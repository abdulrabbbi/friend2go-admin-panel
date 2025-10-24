import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserById } from "./api/users.service";
import { PATHS } from "../../routes/paths";

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getUserById(id);
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="card">Loading…</div>;
  if (!user) return (
    <div className="card">
      <div className="text-danger font-medium mb-2">User not found</div>
      <Link to={PATHS.USERS} className="btn-ghost">Back to Users</Link>
    </div>
  );

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{user.fullName}</h1>
        <Link to={PATHS.USERS} className="btn-ghost">Back</Link>
      </div>

      <div className="card grid gap-3">
        <div className="text-sm text-muted">Email</div>
        <div>{user.email}</div>
        <div className="text-sm text-muted">Role</div>
        <div className="badge">{user.role}</div>
        <div className="text-sm text-muted">Status</div>
        <div className="badge">{user.status}</div>
        <div className="text-sm text-muted">Premium</div>
        <div>{user.premium ? "Yes" : "No"}</div>
        <div className="text-sm text-muted">Language</div>
        <div>{user.language}</div>
        <div className="text-sm text-muted">Joined</div>
        <div>{new Date(user.createdAt).toLocaleString()}</div>
        {user.notes && (
          <>
            <div className="text-sm text-muted">Notes</div>
            <div>{user.notes}</div>
          </>
        )}
      </div>
    </section>
  );
}
