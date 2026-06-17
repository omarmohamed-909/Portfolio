import React, { useState, useEffect } from "react";
import styles from "./DashboardMessages.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Mail, MailOpen, Reply, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const DashboardMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await verifyJWTToken();
      if (!isAuthenticated) {
        window.location.href = "/denied";
        return;
      }
      fetchMessages();
    };
    checkAuth();
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Backend_Root_Url}/api/messages`, {
        withCredentials: true,
      });
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${Backend_Root_Url}/api/messages/read/${id}`, {}, {
        withCredentials: true,
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: "read" } : m))
      );
      if (selectedMessage?._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: "read" }));
      }
    } catch {
      toast.error("Failed to update message");
    }
  };

  const markAsReplied = async (id) => {
    try {
      await axios.put(`${Backend_Root_Url}/api/messages/replied/${id}`, {}, {
        withCredentials: true,
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: "replied" } : m))
      );
      if (selectedMessage?._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: "replied" }));
      }
    } catch {
      toast.error("Failed to update message");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${Backend_Root_Url}/api/messages/delete/${id}`, {
        withCredentials: true,
      });
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = filteredMessages.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === "unread") {
      markAsRead(msg._id);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "unread": return <Mail size={15} className={styles.statusUnread} />;
      case "read": return <MailOpen size={15} className={styles.statusRead} />;
      case "replied": return <Reply size={15} className={styles.statusReplied} />;
      default: return null;
    }
  };

  return (
    <div className={styles.messagesSection}>
      {/* Filters */}
      <div className={styles.filterBar}>
        {["all", "unread", "read", "replied"].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className={styles.filterCount}>
                {messages.filter((m) => m.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.messageLayout}>
        {/* List */}
        <div className={styles.messageList}>
          {loading ? (
            <div className={styles.loadingMessage}>Loading messages...</div>
          ) : paginatedMessages.length === 0 ? (
            <div className={styles.emptyMessage}>No messages found.</div>
          ) : (
            paginatedMessages.map((msg) => (
              <div
                key={msg._id}
                className={`${styles.messageItem} ${
                  selectedMessage?._id === msg._id ? styles.messageItemActive : ""
                } ${msg.status === "unread" ? styles.messageUnread : ""}`}
                onClick={() => handleSelectMessage(msg)}
              >
                <div className={styles.messageItemHeader}>
                  {statusIcon(msg.status)}
                  <span className={styles.messageItemName}>{msg.fullname}</span>
                  <span className={styles.messageItemDate}>
                    {new Date(msg.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    })}
                  </span>
                </div>
                <p className={styles.messageItemSubject}>{msg.subject}</p>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className={styles.messageDetail}>
          {selectedMessage ? (
            <>
              <div className={styles.detailHeader}>
                <div className={styles.detailInfo}>
                  <h3 className={styles.detailName}>{selectedMessage.fullname}</h3>
                  <a href={`mailto:${selectedMessage.email}`} className={styles.detailEmail}>
                    {selectedMessage.email}
                  </a>
                  <span className={styles.detailDate}>
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
                <div className={styles.detailActions}>
                  {selectedMessage.status !== "replied" && (
                    <button
                      className={styles.actionBtn}
                      onClick={() => {
                        window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                        markAsReplied(selectedMessage._id);
                      }}
                      title="Mark as replied"
                    >
                      <Reply size={16} />
                    </button>
                  )}
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => deleteMessage(selectedMessage._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className={styles.detailSubject}>{selectedMessage.subject}</div>
              <p className={styles.detailBody}>{selectedMessage.message}</p>
            </>
          ) : (
            <div className={styles.detailEmpty}>
              <Mail size={40} />
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
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

export default DashboardMessages;
