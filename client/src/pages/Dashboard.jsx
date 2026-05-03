import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  CheckCircle,
  Clock,
  ListTodo,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="glass-panel p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden group">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-5 group-hover:opacity-10 transition-opacity`}
    ></div>
    <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/tasks/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-slate-400">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<BarChart3 size={28} className="text-blue-500" />}
          colorClass="from-blue-500 to-blue-600"
        />
        <StatCard
          title="To Do"
          value={stats.todo}
          icon={<ListTodo size={28} className="text-slate-300" />}
          colorClass="from-slate-400 to-slate-500"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock size={28} className="text-amber-500" />}
          colorClass="from-amber-400 to-amber-600"
        />
        <StatCard
          title="Done"
          value={stats.done}
          icon={<CheckCircle size={28} className="text-emerald-500" />}
          colorClass="from-emerald-400 to-emerald-600"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={<AlertTriangle size={28} className="text-red-500" />}
          colorClass="from-red-400 to-red-600"
        />
      </div>

      {stats.overdue > 0 && (
        <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-red-400 font-semibold text-lg mb-1">
              Attention Required
            </h3>
            <p className="text-slate-300">
              You have {stats.overdue} overdue task(s). Please review your Tasks page and update their status or due date.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
