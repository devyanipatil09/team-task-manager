import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import { Plus, Users, FolderKanban, X, Trash2 } from "lucide-react";

const Projects = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null });

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      addToast("Failed to fetch projects.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects", formData);
      setShowModal(false);
      setFormData({ name: "", description: "" });
      fetchProjects();
      addToast("Project Created Successfully!", "success");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create project");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.projectId) return;
    try {
      await api.delete(`/projects/${deleteModal.projectId}`);
      addToast("Project and associated tasks deleted.", "success");
      setProjects(projects.filter(p => p._id !== deleteModal.projectId));
    } catch (err) {
      addToast(err.response?.data?.msg || "Failed to delete project.", "error");
    } finally {
      setDeleteModal({ isOpen: false, projectId: null });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">Manage your team's projects.</p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-slate-700/50 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-700/50 rounded-full w-12"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                  <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-700/50 rounded w-1/3 mt-4"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <FolderKanban size={48} className="mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No projects found.</h3>
          <p className="text-slate-400">
            {user?.role === "admin"
              ? "Start by creating a new one!"
              : "You haven't been added to any projects yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="glass-panel rounded-2xl p-6 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-royal-blue/10 relative group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white line-clamp-1 pr-8">
                  {project.name}
                </h3>
                <div className="bg-slate-800 rounded-full px-3 py-1 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Users size={14} />
                  {project.members?.length || 0}
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-3 mb-6 min-h-[60px]">
                {project.description || "No description provided."}
              </p>
              <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-700 pt-4">
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              
              {/* Delete Button (Admin only) */}
              {user?.role === "admin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal({ isOpen: true, projectId: project._id });
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="E.g., Website Redesign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="What is this project about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will also delete all associated tasks. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, projectId: null })}
        confirmText="Delete Project"
      />
    </div>
  );
};

export default Projects;
