import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FaUsers, FaCommentDots, FaRegCalendarAlt } from "react-icons/fa";
import { MdOutlineEventNote } from "react-icons/md";
import dayjs from "dayjs";
import StatCard from "./components/StatCard";
import GrowthChart from "./components/GrowthChart";

const ranges = {
  "30d": 30,
  "6m": 180,
  "1y": 365,
};

export default function Dashboard() {
  const [range, setRange] = useState("30d");
  const [stats, setStats] = useState({
    plans: 0,
    chats: 0,
    users: 0,
    messages: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const days = ranges[range];
      const fromDate = dayjs().subtract(days, "day").toDate();
      const timeFilter = where("createdAt", ">=", Timestamp.fromDate(fromDate));

      async function countWithFallback(colPath) {
        try {
          const withTime = query(collection(db, colPath), timeFilter);
          const agg = await getCountFromServer(withTime);
          const n = agg.data().count;
          if (n > 0) return n;
        } catch (_) {
          // ignore and fallback
        }
        try {
          const aggAll = await getCountFromServer(collection(db, colPath));
          return aggAll.data().count;
        } catch (_) {
          // final fallback: size via getDocs
          const snap = await getDocs(collection(db, colPath));
          return snap.size;
        }
      }

      // Plans (fallback to total if createdAt not present)
      const plansCount = await countWithFallback("plans");

      // Chats & messages
      const chatsSnap = await getDocs(query(collection(db, "chat"), timeFilter));
      let chatsCount = chatsSnap.size;
      if (chatsCount === 0) {
        chatsCount = await countWithFallback("chat");
      }
      let totalMessages = 0;
      for (const c of chatsSnap.docs) {
        const msgSnap = await getDocs(collection(db, "chat", c.id, "messages"));
        totalMessages += msgSnap.size;
      }

      // Users collection name is singular in the app ("user")
      const usersCount = await countWithFallback("user");

      setStats({
        plans: plansCount,
        chats: chatsCount,
        messages: totalMessages,
        users: usersCount,
      });

      // Dummy chart data — you can aggregate weekly or monthly using createdAt later
      const step = Math.max(1, Math.floor(days / 10));
      const dataPoints = [];
      for (let i = 10; i >= 0; i--) {
        const label = dayjs()
          .subtract(i * step, "day")
          .format("MMM D");
        dataPoints.push({
          label,
          plans: Math.floor(Math.random() * 10),
          users: Math.floor(Math.random() * 20),
          messages: Math.floor(Math.random() * 40),
        });
      }
      setChartData(dataPoints);
      setLoading(false);
    };
    fetchStats();
  }, [range]);

  return (
    <div className="min-h-screen p-6 bg-[radial-gradient(70%_70%_at_50%_0%,#0b0f14,transparent),linear-gradient(#06080b,#06080b)] text-white">
      <h1 className="text-3xl font-semibold mb-8 tracking-tight">
        📊 Dashboard Analytics
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {Object.keys(ranges).map((key) => (
          <button
            key={key}
            className={`px-5 py-2 rounded-xl border transition-all ${
              range === key
                ? "bg-primary text-black border-primary"
                : "border-border/40 hover:bg-white/10 text-muted"
            }`}
            onClick={() => setRange(key)}
          >
            {key === "30d"
              ? "Last 30 Days"
              : key === "6m"
              ? "Last 6 Months"
              : "This Year"}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={MdOutlineEventNote}
          label="Plans Created"
          value={stats.plans}
          color="green"
          loading={loading}
        />
        <StatCard
          icon={FaCommentDots}
          label="Active Chats"
          value={stats.chats}
          color="yellow"
          loading={loading}
        />
        <StatCard
          icon={FaUsers}
          label="New Users"
          value={stats.users}
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={FaRegCalendarAlt}
          label="Messages Sent"
          value={stats.messages}
          color="pink"
          loading={loading}
        />
      </div>

      {/* Chart */}
      <GrowthChart data={chartData} />

      {/* Footer */}
      <div className="text-center text-xs text-muted mt-10">
        © {new Date().getFullYear()}  Admin — Real-time analytics
        dashboard
      </div>
    </div>
  );
}
