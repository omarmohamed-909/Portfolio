import React, { useState, useEffect } from "react";
import styles from "./DashboardBlockHistory.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Shield, ShieldOff, AlertTriangle, RefreshCw, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

const DashboardBlockHistory = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (!isAuthenticated) {
        window.location.href = "/denied";
        return;
      }
    };
    checkAuth();
  }, []);

  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, listRes] = await Promise.all([
        axios.get(`${Backend_Root_Url}/api/admin/block-history/stats`, {
          withCredentials: true,
        }),
        axios.get(`${Backend_Root_Url}/api/admin/block-history/list?page=${page}&limit=20`, {
          withCredentials: true,
        }),
      ]);

      setStats(statsRes.data);
      setRecords(listRes.data.records || []);
      setTotalPages(listRes.data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch block history:", err);
      setError("Failed to load block history data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleUnblock = async (key) => {
    try {
      setError("");
      setSuccess("");
      await axios.post(
        `${Backend_Root_Url}/api/admin/block-history/unblock/${encodeURIComponent(key)}`,
        {},
        { withCredentials: true }
      );
      setSuccess("Unblocked successfully");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to unblock. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredRecords = searchTerm
    ? records.filter(
        (r) =>
          (r.key && r.key.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.metadata?.ip && r.metadata.ip.includes(searchTerm)) ||
          (r.metadata?.email && r.metadata.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : records;

  return (
    <div className={styles.container}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Shield size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.totalRecords ?? "-"}</span>
            <span className={styles.statLabel}>Total Records</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.warning}`}><AlertTriangle size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.currentlyBlocked ?? "-"}</span>
            <span className={styles.statLabel}>Currently Blocked</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.danger}`}><ShieldOff size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.permanentBans ?? "-"}</span>
            <span className={styles.statLabel}>Permanent Bans</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.info}`}><Search size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {stats?.suspiciousScore?.avgScore != null
                ? stats.suspiciousScore.avgScore.toFixed(1)
                : "-"}
            </span>
            <span className={styles.statLabel}>Avg Suspicious Score</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by IP, email, or key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button className={styles.clearBtn} onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spin : ""} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && <div className={styles.errorMsg}>{error}</div>}
      {success && <div className={styles.successMsg}>{success}</div>}

      {/* Records Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>Loading block history...</div>
        ) : filteredRecords.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield size={32} />
            <p>{searchTerm ? "No records match your search." : "No block history records found."}</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Key</th>
                <th>IP</th>
                <th>Email</th>
                <th>Strikes</th>
                <th>Suspicious Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record._id}>
                  <td className={styles.keyCell} title={record.key}>
                    {record.key?.length > 30
                      ? record.key.substring(0, 30) + "..."
                      : record.key || "-"}
                  </td>
                  <td>{record.metadata?.ip || "-"}</td>
                  <td>{record.metadata?.email || "-"}</td>
                  <td>
                    <span className={`${styles.strikeBadge} ${record.strikes >= 5 ? styles.permanent : record.strikes >= 3 ? styles.high : ""}`}>
                      {record.strikes ?? 0}/5
                    </span>
                  </td>
                  <td>{record.suspiciousScore ?? 0}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${record.lastBlockedAt ? styles.blocked : styles.active}`}>
                      {record.lastBlockedAt ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.unblockBtn}
                      onClick={() => handleUnblock(record.key)}
                      disabled={!record.lastBlockedAt}
                      title={record.lastBlockedAt ? "Unblock" : "Not blocked"}
                    >
                      <ShieldOff size={14} />
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !searchTerm && (
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardBlockHistory;
