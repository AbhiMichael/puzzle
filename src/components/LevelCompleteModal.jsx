import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, ArrowRight, RotateCcw, CheckCircle2, Award, Sparkles } from "lucide-react";
import { sounds } from "../utils/soundEffects";

export function LevelCompleteModal({
  level,
  score,
  onNextLevel,
  onReplay,
}) {
  useEffect(() => {
    sounds.playLevelWin();

    // Fresh pastel & gold celebration confetti
    const end = Date.now() + 1500;
    const colors = ["#BFE3C0", "#FFF0B8", "#F8D8C4", "#52B788", "#FFD700"];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="modal-backdrop-pastel">
      <div className="modal-card-pastel level-complete-content">
        <div className="level-complete-icon">
          <Trophy size={36} />
        </div>

        <span className="level-tag-badge" style={{ background: "#E8F5E9", color: "#2E7D32", marginBottom: 8 }}>
          LEVEL 0{level.levelNumber} COMPLETED!
        </span>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#34443A", marginTop: 4 }}>
          {level.personality.name}
        </h2>
        <p style={{ fontSize: 13, color: "#6B7F72" }}>{level.personality.title}</p>

        {/* Reconstructed Portrait Showcase */}
        <div className="level-complete-photo">
          <img src={level.imageSrc} alt={level.personality.name} />
        </div>

        <div style={{ background: "#F0F5E8", padding: 12, borderRadius: 12, margin: "14px 0", fontSize: 13, color: "#4A7A57", lineHeight: 1.5 }}>
          {level.personality.bio}
        </div>

        {/* Stats Chips */}
        <div className="complete-score-chips">
          <div className="score-chip">
            <span className="chip-label">LEVEL BONUS</span>
            <span className="chip-val" style={{ color: "#2E7D32" }}>+50 pts</span>
          </div>
          <div className="score-chip">
            <span className="chip-label">TOTAL SCORE</span>
            <span className="chip-val" style={{ color: "#7A5E0B" }}>{score} pts</span>
          </div>
          <div className="score-chip">
            <span className="chip-label">PIECES SOLVED</span>
            <span className="chip-val">{level.piecesCount}/{level.piecesCount}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={onReplay}
            className="submit-btn"
            style={{
              flex: 1,
              background: "#F0F5E8",
              color: "#34443A",
              border: "1px solid #DCEED5",
              boxShadow: "none",
            }}
          >
            <RotateCcw size={16} />
            <span>Replay</span>
          </button>

          <button
            onClick={onNextLevel}
            className="submit-btn"
            style={{ flex: 2 }}
          >
            <span>{level.levelNumber < 3 ? `Next Level 0${level.levelNumber + 1}` : "View Dashboard"}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
