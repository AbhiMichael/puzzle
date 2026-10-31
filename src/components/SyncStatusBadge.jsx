import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, Check, AlertCircle, Loader2 } from "lucide-react";
import { apiService } from "../services/apiService";
import { SYNC_STATUS } from "../config/api";

export function SyncStatusBadge({ className = "", compact = false }) {
  const [status, setStatus] = useState(apiService.getSyncStatus());
  const [details, setDetails] = useState("");

  useEffect(() => {
    const unsubscribe = apiService.subscribeSyncStatus((newStatus, detailMsg) => {
      setStatus(newStatus);
      if (detailMsg) setDetails(detailMsg);
    });
    return unsubscribe;
  }, []);

  const getBadgeConfig = () => {
    switch (status) {
      case SYNC_STATUS.SYNCED:
        return {
          icon: <Check size={14} color="#2E7D32" strokeWidth={3} />,
          label: "Cloud Synced",
          bg: "#E8F5E9",
          border: "#C8E6C9",
          text: "#2E7D32",
        };
      case SYNC_STATUS.SYNCING:
        return {
          icon: <Loader2 size={14} color="#1976D2" className="spinner" />,
          label: "Syncing...",
          bg: "#E3F2FD",
          border: "#BBDEFB",
          text: "#1976D2",
        };
      case SYNC_STATUS.OFFLINE:
        return {
          icon: <CloudOff size={14} color="#757575" />,
          label: "Offline (Saved Locally)",
          bg: "#F5F5F5",
          border: "#E0E0E0",
          text: "#616161",
        };
      case SYNC_STATUS.FAILED:
      default:
        return {
          icon: <AlertCircle size={14} color="#C62828" />,
          label: "Sync Failed (Saved Locally)",
          bg: "#FFEBEE",
          border: "#FFCDD2",
          text: "#C62828",
        };
    }
  };

  const config = getBadgeConfig();

  const isRetryable = status === SYNC_STATUS.FAILED || status === SYNC_STATUS.OFFLINE;

  const handleRetry = async () => {
    if (isRetryable) {
      console.log("[SyncStatusBadge] User initiated sync retry...");
      await apiService.flushPendingSync();
    }
  };

  return (
    <div
      onClick={handleRetry}
      className={`sync-status-badge ${className} ${isRetryable ? "retryable" : ""}`}
      title={isRetryable ? `${details || config.label} — Click to retry sync` : (details || config.label)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: compact ? "2px 8px" : "4px 10px",
        borderRadius: 999,
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        fontSize: compact ? 11 : 12,
        fontWeight: 700,
        transition: "all 0.25s ease",
        cursor: isRetryable ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      {config.icon}
      <span>{compact ? (status === SYNC_STATUS.SYNCED ? "Synced" : config.label) : config.label}</span>
      {isRetryable && !compact && (
        <span style={{ fontSize: 10, textDecoration: "underline", marginLeft: 2, opacity: 0.85 }}>
          (Retry)
        </span>
      )}
    </div>
  );
}
