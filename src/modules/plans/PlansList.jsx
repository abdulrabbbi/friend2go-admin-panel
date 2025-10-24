import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import PlansService from "./api/plans.service";
import PlansTable from "./components/PlansTable";
import PlanDrawer from "./components/PlanDrawer";
import DeleteConfirm from "./components/DeleteConfirm";
import PlanStats from "./components/PlanStats";

export default function PlansList() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [q, setQ] = useState("");
  const LIMIT = 10;
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view");
  const [selected, setSelected] = useState(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delPlan, setDelPlan] = useState(null);

  async function fetchPlans() {
    setLoading(true);
    try {
      const items = await PlansService.listPlans();
      setPlans(items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return plans;
    return plans.filter((p) =>
      [p.title, p.category, p.location, p.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [q, plans]);

  useEffect(() => {
    const total = filtered.length || 0;
    const last = Math.max(1, Math.ceil(total / LIMIT));
    if (page > last) setPage(last);
  }, [filtered.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageItems = useMemo(() => {
    const start = (page - 1) * LIMIT;
    return filtered.slice(start, start + LIMIT);
  }, [filtered, page]);

  function openEdit(plan) {
    setSelected(plan);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }

  function openView(plan) {
    setSelected(plan);
    setDrawerMode("view");
    setDrawerOpen(true);
  }

  function askDelete(plan) {
    setDelPlan(plan);
    setDelOpen(true);
  }

  async function confirmDelete() {
    if (!delPlan) return;
    try {
      await PlansService.deletePlan(delPlan._id);
      toast.success("Plan deleted");
      setDelOpen(false);
      setDelPlan(null);
      await fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  }

  async function handleSave(model) {
    try {
      if (selected?._id) {
        await PlansService.updatePlan(selected._id, model);
        toast.success("Plan updated");
      } else if (PlansService.createPlan) {
        await PlansService.createPlan(model);
        toast.success("Plan created");
      }
      await fetchPlans();
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan");
    }
  }

  return (
    <div className="space-y-5">
      {/* ===== Stats ===== */}
      <PlanStats plans={plans} loading={loading} />

      {/* Header / Search */}
      <div className="card p-4">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="text-sm text-muted">Search</span>
            <input
              className="input mt-1 w-full"
              placeholder="Search by title, category or location…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-1 flex sm:justify-end">
            {/* <button className="btn w-full sm:w-auto">Add New Plan</button> */}
          </div>
        </div>
      </div>

      {/* Table */}
      <PlansTable
        loading={loading}
        data={pageItems}
        page={page}
        total={filtered.length}
        limit={LIMIT}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onView={openView}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      {/* Drawer (View/Edit) */}
      <PlanDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={selected}
        mode={drawerMode}
        onSubmit={handleSave}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirm
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={confirmDelete}
        name={delPlan?.title}
      />
    </div>
  );
}
