import React, { useState, useEffect } from "react";
import styles from "./DashboardActivityLog.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Trash2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

const actionMeta = {
  create: { label: "Create", className: styles.actionCreate },
  update: { label: "Update", className: styles.actionUpdate },
  delete: { label: "Delete", className: styles.actionDelete },
};

const DashboardActivityLog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (!isAuthenticated) {
        window.location.href = "/denied";
        return;
      }
      fetchLogs();
    };
    checkAuth();
  }, [navigate, page, filterAction, filterResource]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 30 };
      if (filterAction) params.action = filterAction;
      if (filterResource) params.resource = filterResource;
      const res = await axios.get(`${Backend_Root_Url}/api/activity-logs`, {
        params,
        withCredentials: true,
      });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all activity logs?")) return;
    try {
      await axios.delete(`${Backend_Root_Url}/api/activity-logs/clear`, {
        withCredentials: true,
      });
      setLogs([]);
      setPage(1);
      setTotalPages(1);
    } catch {
      // silent
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderDetails = (log) => {
    const d = log.details || {};
    const parts = [];
    if (d.title) parts.push(d.title);
    if (d.name) parts.push(d.name);
    return parts.length > 0 ? parts.join(" ") : "-";
  };

  return (
    <div className={styles.logSection}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className={styles.filterSelect}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <select
            value={filterResource}
            onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
            className={styles.filterSelect}
          >
            <option value="">All Resources</option>
            <option value="blog">Blog</option>
            <option value="project">Project</option>
            <option value="message">Message</option>
            <option value="skill">Skill</option>
            <option value="experience">Experience</option>
          </select>
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.refreshBtn} onClick={fetchLogs} title="Refresh">
            <RotateCw size={15} />
          </button>
          <button className={styles.clearBtn} onClick={clearLogs} title="Clear all logs">
            <Trash2 size={15} /> Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingMessage}>Loading activity logs...</div>
      ) : logs.length === 0 ? (
        <div className={styles.emptyMessage}>No activity logs found.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className={styles.timeCell}>{formatTime(log.createdAt)}</td>
                  <td>
                    <span className={`${styles.actionBadge} ${actionMeta[log.action]?.className || ""}`}>
                      {actionMeta[log.action]?.label || log.action}
                    </span>
                  </td>
                  <td className={styles.resourceCell}>{log.resource}</td>
                  <td className={styles.detailCell}>{renderDetails(log)}</td>
                  <td className={styles.adminCell}>{log.adminId?.substring(0, 8) || "?"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardActivityLog;
