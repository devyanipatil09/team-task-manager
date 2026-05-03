import { useState, useEffect, useContext, useMemo } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import { Plus, X, Calendar, Clock, CheckCircle2, Circle, Trash2, Search, Filter, AlertTriangle } from "lucide-react";

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
  });
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects")
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      
      if (user?.role === "admin") {
        const usersRes = await api.get("/users");
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      addToast("Failed to fetch data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/tasks", formData);
      setShowModal(false);
      setFormData({ title: "", description: "", project: "", assignedTo: "", dueDate: "", priority: "Medium" });
      fetchData();
      addToast("Task Created Successfully!", "success");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      addToast("Task status updated.", "success");
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.taskId) return;
    try {
      await api.delete(`/tasks/${deleteModal.taskId}`);
      addToast("Task deleted successfully.", "success");
      setTasks(tasks.filter(t => t._id !== deleteModal.taskId));
    } catch (err) {
      addToast(err.response?.data?.msg || "Failed to delete task.", "error");
    } finally {
      setDeleteModal({ isOpen: false, taskId: null });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Done": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "In Progress": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-700/50 text-slate-300 border-slate-600";
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case "High": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">HIGH</span>;
      case "Medium": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">MED</span>;
      case "Low": return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">LOW</span>;
      default: return null;
    }
  };

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesProject = projectFilter === "All" || (task.project && task.project._id === projectFilter);
      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [tasks, searchQuery, statusFilter, projectFilter]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-slate-400">Track and update task progress.</p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            New Task
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="glass-panel p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-royal-blue"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 w-full outline-none focus:border-royal-blue"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All" className="bg-slate-800">All Status</option>
              <option value="To-Do" className="bg-slate-800">To-Do</option>
              <option value="In Progress" className="bg-slate-800">In Progress</option>
              <option value="Done" className="bg-slate-800">Done</option>
            </select>
          </div>
          <select
            className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 w-full sm:w-48 outline-none focus:border-royal-blue"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All" className="bg-slate-800">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id} className="bg-slate-800">{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-12 bg-slate-700/30 border-b border-slate-700"></div>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex p-4 border-b border-slate-700/50 gap-4">
              <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
              <div className="h-4 bg-slate-700/50 rounded w-1/5"></div>
              <div className="h-4 bg-slate-700/50 rounded w-1/6"></div>
              <div className="h-4 bg-slate-700/50 rounded w-24 ml-auto"></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <CheckCircle2 size={48} className="mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No tasks found.</h3>
          <p className="text-slate-400">
            Start by creating a new one!
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <Search size={48} className="mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No matching tasks</h3>
          <p className="text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-sm font-medium">
                  <th className="p-4 pl-6">Task Name</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  {user?.role === "admin" && <th className="p-4 text-right pr-6">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredTasks.map((task) => (
                  <tr 
                    key={task._id} 
                    className={`hover:bg-slate-800/30 transition-all ${
                      task.priority === "High" && task.status !== "Done" 
                        ? "shadow-[inset_4px_0_0_0_rgba(239,68,68,0.8)] bg-red-500/5" 
                        : ""
                    }`}
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        <div className="font-medium text-white">{task.title}</div>
                      </div>
                      {task.description && (
                        <div className="text-xs text-slate-400 mt-1 line-clamp-1 pl-11">{task.description}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {task.project?.name || "Unknown Project"}
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                          {task.assignedTo?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        {task.assignedTo?.name || "Unassigned"}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {task.dueDate ? (
                        <div className={`flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== "Done" ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                          <Calendar size={14} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`text-sm px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${getStatusColor(task.status)}`}
                        style={{ paddingRight: '2rem', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                      >
                        <option value="To-Do" className="bg-slate-800 text-white">To-Do</option>
                        <option value="In Progress" className="bg-slate-800 text-white">In Progress</option>
                        <option value="Done" className="bg-slate-800 text-white">Done</option>
                      </select>
                    </td>
                    {user?.role === "admin" && (
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, taskId: task._id })}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create New Task</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="E.g., Design Homepage"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Project</label>
                  <select
                    required
                    className="input-field"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  >
                    <option value="" disabled className="bg-slate-800 text-slate-400">Select Project</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id} className="bg-slate-800 text-white">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Assign To</label>
                  <select
                    className="input-field"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="" className="bg-slate-800 text-slate-400">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id} className="bg-slate-800 text-white">{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low" className="bg-slate-800 text-white">Low</option>
                    <option value="Medium" className="bg-slate-800 text-white">Medium</option>
                    <option value="High" className="bg-slate-800 text-white">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  className="input-field min-h-[80px]"
                  placeholder="Task details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, taskId: null })}
        confirmText="Delete Task"
      />
    </div>
  );
};

export default Tasks;
