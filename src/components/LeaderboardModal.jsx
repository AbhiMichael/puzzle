import React, { useState, useEffect } from "react";
import { Trophy, X, RefreshCw, AlertCircle, Award } from "lucide-react";
import { apiService } from "../services/apiService";

export function LeaderboardModal({ currentPlayerId, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getLeaderboard();
      if (res.success) {
        setLeaderboard(res.leaderboard || []);
      } else {
        setError(res.message || "Failed to load leaderboard.");
      }
    } catch {
      setError("Network error loading scores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div className="modal-backdrop-pastel" onClick={onClose}>
      <div className="modal-card-pastel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title-wrap">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={22} color="#D4AF37" />
              <span>Kerala Hall of Fame</span>
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6B7F72" }}>
            <RefreshCw size={24} className="spinner" style={{ margin: "0 auto 12px" }} />
            <p>Fetching top scores from Google Sheets...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <AlertCircle size={32} color="#E63946" style={{ margin: "0 auto 10px" }} />
            <p style={{ color: "#E63946", fontSize: 14, marginBottom: 16 }}>{error}</p>
            <button onClick={fetchScores} className="submit-btn" style={{ padding: "8px 18px", fontSize: 13, margin: "0 auto" }}>
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 10px", color: "#6B7F72" }}>
            <Award size={36} color="#BFE3C0" style={{ margin: "0 auto 12px" }} />
            <h4>No Scores Recorded Yet</h4>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Be the first to solve a puzzle and claim the top rank!
            </p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((item) => {
              const isCurrent = currentPlayerId && item.playerId === currentPlayerId;
              const rankClass = item.rank <= 3 ? `rank-${item.rank}` : "";

              return (
                <div
                  key={item.rank + "-" + (item.playerId || item.name)}
                  className={`leaderboard-item ${rankClass} ${isCurrent ? "is-current-user" : ""}`}
                >
                  <div className="rank-badge">
                    {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : item.rank}
                  </div>
                  <div className="player-name-col">
                    <span>{item.name}</span>
                    {isCurrent && (
                      <span style={{ fontSize: 11, color: "#2E7D32", marginLeft: 6, fontWeight: 800 }}>
                        (You)
                      </span>
                    )}
                  </div>
                  <div className="player-score-col">{item.score} pts</div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onClose} className="submit-btn" style={{ width: "100%", padding: 12, marginTop: 10 }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

