import React, { useEffect, useMemo, useState } from "react";
import {
  listSubscribers,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
} from "./api/subscribers.service";
import SubscribersTable from "./components/SubscribersTable";
import SubscriberDrawer from "./components/SubscriberDrawer";
import DeleteConfirm from "../users/components/DeleteConfirm";

const LIMIT = 10;

export default function SubscribersList() {
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delSub, setDelSub] = useState(null);

  const params = useMemo(
    () => ({ page, limit: LIMIT, q, plan, status }),
    [page, q, plan, status]
  );

  async function fetchData() {
    setLoading(true);
    try {
      const res = await listSubscribers(params);
      setRows(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, plan, status]);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(s) {
    setEditing(s);
    setDrawerOpen(true);
  }

  async function handleSubmit(model) {
    if (editing?._id) {
      await updateSubscriber(editing._id, model);
    } else {
      await createSubscriber(model);
      setPage(1);
    }
    await fetchData();
  }

  function askDelete(s) {
    setDelSub(s);
    setDelOpen(true);
  }
  async function confirmDelete() {
    if (!delSub) return;
    await deleteSubscriber(delSub._id);
    setDelOpen(false);
    setDelSub(null);
    const newCount = total - 1;
    const lastPage = Math.max(1, Math.ceil(newCount / LIMIT));
    if (page > lastPage) setPage(lastPage);
    await fetchData();
  }

  return (
    <div className="space-y-5">
      {/* Filters / actions */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block">
              <span className="text-sm text-muted">Search</span>
              <input
                className="input mt-1"
                placeholder="Search name or email…"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Plan</span>
              <select
                className="input mt-1"
                value={plan}
                onChange={(e) => {
                  setPage(1);
                  setPlan(e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-muted">Status</span>
              <select
                className="input mt-1"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
              </select>
            </label>

            <div className="flex sm:justify-end items-end">
              <button className="btn w-full sm:w-auto" onClick={openCreate}>
                Add Subscriber
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <SubscribersTable
        loading={loading}
        items={rows}
        page={page}
        total={total}
        limit={LIMIT}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      {/* Drawer / Modal */}
      <SubscriberDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <DeleteConfirm
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={confirmDelete}
        name={delSub?.name}
      />
    </div>
  );
}
