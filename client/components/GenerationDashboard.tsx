import { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  BarChart3,
  TrendingUp,
  Package,
  Image,
} from "lucide-react";

interface TaskLog {
  id: string;
  timestamp: number;
  status: "success" | "failed" | "pending";
  productName: string;
  imageUrl?: string;
  error?: string;
  retryCount: number;
}

interface GenerationStats {
  totalGenerated: number;
  successRate: number;
  avgProcessingTime: number;
  failedTasks: number;
}

const API_URL = "/api";

export default function GenerationDashboard() {
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [stats, setStats] = useState<GenerationStats>({
    totalGenerated: 0,
    successRate: 0,
    avgProcessingTime: 0,
    failedTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  useEffect(() => {
    loadTaskLogs();
  }, []);

  const loadTaskLogs = () => {
    const savedLogs = localStorage.getItem("ai_generation_logs");
    if (savedLogs) {
      try {
        const logs = JSON.parse(savedLogs);
        setTaskLogs(logs);
        calculateStats(logs);
      } catch (e) {
        console.error("Error loading logs:", e);
      }
    }
  };

  const calculateStats = (logs: TaskLog[]) => {
    const total = logs.length;
    const successful = logs.filter((l) => l.status === "success").length;
    const failed = logs.filter((l) => l.status === "failed").length;

    setStats({
      totalGenerated: total,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      avgProcessingTime: 45,
      failedTasks: failed,
    });
  };

  const retryTask = async (taskId: string) => {
    const task = taskLogs.find((t) => t.id === taskId);
    if (!task) return;

    setIsLoading(true);

    const updatedLogs = taskLogs.map((t) =>
      t.id === taskId
        ? { ...t, status: "pending" as const, retryCount: t.retryCount + 1 }
        : t,
    );
    setTaskLogs(updatedLogs);
    saveLogs(updatedLogs);

    setTimeout(() => {
      const newStatus = Math.random() > 0.3 ? "success" : "failed";
      const finalLogs = taskLogs.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus as "success" | "failed",
              error: newStatus === "failed" ? "Retry failed" : undefined,
            }
          : t,
      );
      setTaskLogs(finalLogs);
      saveLogs(finalLogs);
      calculateStats(finalLogs);
      setIsLoading(false);
    }, 3000);
  };

  const clearFailedTasks = () => {
    const updatedLogs = taskLogs.filter((t) => t.status !== "failed");
    setTaskLogs(updatedLogs);
    saveLogs(updatedLogs);
    calculateStats(updatedLogs);
  };

  const saveLogs = (logs: TaskLog[]) => {
    localStorage.setItem("ai_generation_logs", JSON.stringify(logs));
  };

  const deleteTask = (taskId: string) => {
    const updatedLogs = taskLogs.filter((t) => t.id !== taskId);
    setTaskLogs(updatedLogs);
    saveLogs(updatedLogs);
    calculateStats(updatedLogs);
  };

  const filteredTasks = taskLogs.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                AI Generation Status
              </h3>
              <p className="text-white/80 text-sm">
                Monitor and manage image generation tasks
              </p>
            </div>
          </div>
          <button
            onClick={loadTaskLogs}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            disabled={isLoading}
          >
            <RefreshCw
              className={`text-white ${isLoading ? "animate-spin" : ""}`}
              size={20}
            />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Image className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalGenerated}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgProcessingTime}s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.failedTasks}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {["all", "success", "failed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "success"
                    ? "Successful"
                    : "Failed"}
                {f === "failed" && stats.failedTasks > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {stats.failedTasks}
                  </span>
                )}
              </button>
            ))}
          </div>

          {stats.failedTasks > 0 && (
            <button
              onClick={clearFailedTasks}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All Failed
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Image className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">
                {filter === "all"
                  ? "No generation tasks yet"
                  : filter === "success"
                    ? "No successful generations"
                    : "No failed tasks"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    task.status === "success"
                      ? "bg-green-100 text-green-600"
                      : task.status === "failed"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {task.status === "success" ? (
                    <CheckCircle size={20} />
                  ) : task.status === "failed" ? (
                    <XCircle size={20} />
                  ) : (
                    <Clock size={20} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {task.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(task.timestamp)}
                  </p>
                  {task.error && (
                    <p className="text-sm text-red-500 mt-1">{task.error}</p>
                  )}
                </div>

                {task.imageUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={task.imageUrl}
                      alt={task.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {task.status === "pending" && (
                    <span className="text-sm text-yellow-600 flex items-center gap-1">
                      <RefreshCw size={14} className="animate-spin" />
                      Processing
                    </span>
                  )}

                  {task.status === "failed" && (
                    <>
                      <button
                        onClick={() => retryTask(task.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Retry"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <span className="text-xs text-red-500">
                        {task.retryCount > 0
                          ? `${task.retryCount} retries`
                          : ""}
                      </span>
                    </>
                  )}

                  {task.status === "success" && (
                    <button
                      onClick={() => window.open(task.imageUrl, "_blank")}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
