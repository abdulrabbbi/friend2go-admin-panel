import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { listUsers, createUser, updateUser, deleteUser } from "./api/users.service";
import UserDrawer from "./components/UserDrawer";
import DeleteConfirm from "./components/DeleteConfirm";
import UserTable from "./components/UserTable";

import UserStats from "./components/UserStats";    
import UserFilters from "./components/UserFilters"; 
import ViewUserModal from "./components/ViewUserModal"; 

const LIMIT = 10;

export default function UsersList() {
  // filters/pagination
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // data
  const [loading, setLoading] = useState(true);
  const [usersAll, setUsersAll] = useState([]); // full items for stats + paging
  const [rows, setRows] = useState([]);         // current page rows
  const [total, setTotal] = useState(0);

  // drawers/modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delUser, setDelUser] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const queryParams = useMemo(() => ({ page, limit: LIMIT, q, role, status }), [page, q, role, status]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await listUsers(queryParams);
      const items = res.items || [];
      const totalCount = res.total ?? items.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

      if (page > totalPages) {
        setPage(totalPages);
        return; // will re-run effect
      }

      setUsersAll(items);
      setTotal(totalCount);

      const start = (page - 1) * LIMIT;
      const end = start + LIMIT;
      setRows(items.slice(start, end));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, role, status]);

  // drawer handlers
  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(u) {
    setEditing(u);
    setDrawerOpen(true);
  }

  async function handleSubmit(model) {
    try {
      if (editing?._id) {
        await updateUser(editing._id, model);
        setRows((rs) => rs.map((r) => (r._id === editing._id ? { ...r, ...model } : r)));
        toast.success("User updated");
      } else {
        await createUser(model);
        toast.success("User created");
        setPage(1);
      }
      // ensure server truth
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save user");
      throw err;
    }
  }

  // delete handlers
  function askDelete(u) {
    setDelUser(u);
    setDelOpen(true);
  }
  async function confirmDelete() {
    if (!delUser) return;
    try {
      await deleteUser(delUser._id);
      toast.success("User deleted");
      setDelOpen(false);
      setDelUser(null);
      const newCount = total - 1;
      const last = Math.max(1, Math.ceil(newCount / LIMIT));
      if (page > last) setPage(last);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  }

  // view
  function openView(u) {
    setViewUser(u);
    setViewOpen(true);
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <UserStats users={usersAll} loading={loading} />

      {/* Filters */}
      <UserFilters
        q={q}
        role={role}
        status={status}
        onChangeQuery={(v) => { setQ(v); setPage(1); }}
        onChangeRole={(v) => { setRole(v); setPage(1); }}
        onChangeStatus={(v) => { setStatus(v); setPage(1); }}
      />

      {/* Table */}
      <UserTable
        loading={loading}
        items={rows}
        page={page}
        total={total}
        limit={LIMIT}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onView={openView}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      {/* Drawer (Create/Edit) */}
      <UserDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSubmit={handleSubmit}
      />

      {/* View Modal */}
      <ViewUserModal open={viewOpen} onClose={() => setViewOpen(false)} user={viewUser} />

      {/* Delete Confirm */}
      <DeleteConfirm
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={confirmDelete}
        name={delUser?.fullName}
      />
    </div>
  );
}
