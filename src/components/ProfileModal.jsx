import React from "react";
import { User, X, LogOut, Volume2, VolumeX, Award, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ProfileModal({
  player,
  completedLevels = [],
  isMuted,
  onToggleSound,
  onLogout,
  onClose,
}) {
  const completedStr = completedLevels.length > 0
    ? completedLevels.map((l) => `Level 0${l}`).join(", ")
    : "None yet";

  return (
    <div className="modal-backdrop-pastel" onClick={onClose}>
      <div className="modal-card-pastel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title-wrap">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <User size={20} color="#4A7A57" />
              <span>Player Profile</span>
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="profile-info-grid">
          <div className="profile-field-row">
            <span className="profile-field-label">Player Name</span>
            <span className="profile-field-val">{player.name || "Anonymous"}</span>
          </div>

          <div className="profile-field-row">
            <span className="profile-field-label">Player ID</span>
            <span className="profile-field-val" style={{ fontFamily: "monospace", color: "#4A7A57" }}>
              {player.playerId || "KRP-0000"}
            </span>
          </div>

          <div className="profile-field-row">
            <span className="profile-field-label">Kerala Piravi Score</span>
            <span className="profile-field-val" style={{ color: "#7A5E0B" }}>
              {player.score || 0} pts
            </span>
          </div>

          <div className="profile-field-row">
            <span className="profile-field-label">Completed Levels</span>
            <span className="profile-field-val" style={{ color: "#2E7D32" }}>
              {completedStr}
            </span>
          </div>

          <div className="profile-field-row" style={{ alignItems: "center" }}>
            <span className="profile-field-label">Sound Effects</span>
            <button
              onClick={onToggleSound}
              style={{
                background: isMuted ? "#FFEBEE" : "#E8F5E9",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                color: isMuted ? "#C62828" : "#2E7D32",
              }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? "Muted" : "Enabled"}</span>
            </button>
          </div>
        </div>

        <div style={{ background: "#F0F5E8", padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 12, color: "#6B7F72" }}>
          <ShieldCheck size={16} color="#4A7A57" style={{ verticalAlign: "middle", marginRight: 6 }} />
          Session is backed up locally and syncs to Google Sheets. Logging out clears the local session on this device.
        </div>

        <button onClick={onLogout} className="logout-action-btn">
          <LogOut size={16} />
          <span>Logout from this Device</span>
        </button>
      </div>
    </div>
  );
}

