import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";
import ComposeDrawer from "./components/ComposeDrawer";
import CampaignsTable from "./components/CampaignsTable";
import Svc from "./api/notifications.service";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const list = await Svc.listCampaigns();
      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload) {
    try {
      await Svc.createCampaign(payload);
      toast.success("Campaign created");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create");
      throw e;
    }
  }

  async function handleEditSave(payload) {
    try {
      if (!editing?._id) return;
      await Svc.updateCampaign(editing._id, payload);
      toast.success("Campaign updated");
      setEditing(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update");
      throw e;
    }
  }

  async function handleSend(c) {
    try {
      toast.loading("Sending…", { id: "send" });
      await Svc.sendCampaignNow(c._id);
      toast.success("Sent", { id: "send" });
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Send failed", { id: "send" });
    }
  }

  async function handleDelete(c) {
    if (!confirm(`Delete "${c.title}"?`)) return;
    try {
      await Svc.deleteCampaign(c._id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  }

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((x) => x.status === "completed").length;
    const failed = items.filter((x) => x.status === "failed").length;
    const scheduled = items.filter((x) => x.status === "scheduled").length;
    return { total, completed, failed, scheduled };
  }, [items]);

  return (
    <div className="space-y-5">
      {/* Header + CTA */}
      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted">Communicate with your users</div>
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <button
          className="btn"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-sm text-muted">Total</div>
          <div className="text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Completed</div>
          <div className="text-2xl font-semibold text-emerald-400">
            {stats.completed}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Failed</div>
          <div className="text-2xl font-semibold text-red-400">
            {stats.failed}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Scheduled</div>
          <div className="text-2xl font-semibold text-amber-400">
            {stats.scheduled}
          </div>
        </div>
      </div>

      {/* Table */}
      <CampaignsTable
        items={items}
        loading={loading}
        onSend={handleSend}
        onDelete={handleDelete}
        onEdit={(c) => {
          setEditing(c);
          setDrawerOpen(true);
        }}
        onView={(c) => {
          setEditing(c);
          setDrawerOpen(true);
        }}
      />

      {/* Drawer */}
      <ComposeDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={editing ? handleEditSave : handleCreate}
      />
    </div>
  );
}
