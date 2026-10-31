import React from "react";
import { Trophy, User, LogOut, Play, Lock, CheckCircle2, RotateCcw, Award } from "lucide-react";
import { SyncStatusBadge } from "./SyncStatusBadge";

export function DashboardScreen({
  player,
  levels,
  unlockedLevels,
  completedLevels,
  placedPiecesState,
  onSelectLevel,
  onOpenLeaderboard,
  onOpenProfile,
  onLogout,
}) {
  const getLevelStatus = (lvl) => {
    const isUnlocked = unlockedLevels.includes(lvl.levelNumber);
    const isCompleted = completedLevels.includes(lvl.levelNumber);

    if (!isUnlocked) return { label: "LOCKED", type: "locked" };
    if (isCompleted) return { label: "COMPLETED", type: "completed" };

    const placedCount = placedPiecesState && placedPiecesState[lvl.levelNumber]
      ? Object.keys(placedPiecesState[lvl.levelNumber]).length
      : 0;

    if (placedCount > 0) return { label: "CONTINUE", type: "continue" };
    return { label: "START", type: "start" };
  };

  const getCardAccentClass = (lvlNum) => {
    if (lvlNum === 1) return "lvl-1";
    if (lvlNum === 2) return "lvl-2";
    return "lvl-3";
  };

  return (
    <div className="dash-container">
      {/* Dashboard Top Header */}
      <header className="dash-header">
        <div className="dash-top-row">
          <div className="player-greeting-box">
            <div className="player-avatar">
              {player.name ? player.name.charAt(0).toUpperCase() : "K"}
            </div>
            <div className="greeting-text">
              <h2>Namaskaram, {player.name || "Friend"}! 🌿</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                <span className="player-id-pill">ID: {player.playerId || "KRP-0000"}</span>
                <SyncStatusBadge />
              </div>
            </div>
          </div>

          <div className="dash-header-actions">
            <button
              onClick={onOpenLeaderboard}
              className="icon-action-btn"
              title="View Leaderboard"
              aria-label="Leaderboard"
            >
              <Trophy size={18} />
            </button>
            <button
              onClick={onOpenProfile}
              className="icon-action-btn"
              title="Player Profile & Settings"
              aria-label="Profile"
            >
              <User size={18} />
            </button>
            <button
              onClick={onLogout}
              className="icon-action-btn"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Total Score Badge */}
        <div className="score-banner">
          <div className="score-title">
            <Award size={18} />
            <span>KERALA PIRAVI SCORE</span>
          </div>
          <div className="score-value">{player.score || 0} pts</div>
        </div>
      </header>

      {/* Main Content: The Three Level Cards (NO photos or preview thumbnails!) */}
      <main className="dash-content">
        <div className="section-label-row">
          <span className="section-label">CHALLENGE LEVELS</span>
          <span className="levels-sublabel">Progressively unlock 3 authentic jigsaw puzzles</span>
        </div>

        {levels.map((lvl) => {
          const status = getLevelStatus(lvl);
          const isUnlocked = status.type !== "locked";

          return (
            <div
              key={lvl.id}
              className={`dashboard-level-card ${getCardAccentClass(lvl.levelNumber)} ${
                isUnlocked ? "unlocked" : "locked"
              }`}
            >
              <div className="card-top-header">
                <span className="level-tag-badge">
                  LEVEL 0{lvl.levelNumber} — {lvl.difficulty.toUpperCase()}
                </span>
                <span className={`status-badge ${status.type}`}>
                  {status.type === "completed" && <CheckCircle2 size={13} />}
                  {status.type === "locked" && <Lock size={13} />}
                  {status.label}
                </span>
              </div>

              <div className="card-center-info">
                <div className="card-title-text">
                  <h3>{lvl.personality.category}</h3>
                  <p className="card-desc">Authentic interlocking jigsaw puzzle</p>
                </div>
                <div className="pieces-count-pill">{lvl.piecesCount} Pieces</div>
              </div>

              <button
                className={`card-play-btn ${isUnlocked ? "btn-active" : "btn-locked"}`}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectLevel(lvl.levelNumber)}
              >
                {status.type === "completed" ? (
                  <>
                    <RotateCcw size={16} /> Replay Level
                  </>
                ) : status.type === "continue" ? (
                  <>
                    <Play size={16} fill="currentColor" /> Continue Puzzle
                  </>
                ) : status.type === "start" ? (
                  <>
                    <Play size={16} fill="currentColor" /> Start Puzzle
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Complete Level 0{lvl.levelNumber - 1} to Unlock
                  </>
                )}
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}

