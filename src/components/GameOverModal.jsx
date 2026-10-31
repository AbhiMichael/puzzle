import React, { useEffect } from "react";
import { RotateCcw, ArrowLeft, HeartCrack } from "lucide-react";
import { sounds } from "../utils/soundEffects";

export function GameOverModal({ level, score, onRestart, onBackToDashboard }) {
  useEffect(() => {
    sounds.playGameOver();
  }, []);

  return (
    <div className="modal-backdrop-pastel">
      <div className="modal-card-pastel game-over-content">
        <div className="game-over-icon">
          <HeartCrack size={38} />
        </div>

        <h2 className="game-over-title">Out of Lives!</h2>
        <p className="game-over-desc">
          You made 3 incorrect placements on Level 0{level.levelNumber} ({level.personality.name}).
          The spirit of Kerala Piravi is all about perseverance! Try again and piece together the puzzle.
        </p>

        <div style={{ background: "#F7FAEF", padding: 12, borderRadius: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: "#6B7F72" }}>Your current score is preserved: </span>
          <strong style={{ color: "#7A5E0B" }}>{score} pts</strong>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onBackToDashboard}
            className="submit-btn"
            style={{
              flex: 1,
              background: "#F0F5E8",
              color: "#34443A",
              border: "1px solid #DCEED5",
              boxShadow: "none",
            }}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={onRestart}
            className="submit-btn"
            style={{
              flex: 2,
              background: "linear-gradient(135deg, #FF8090 0%, #FF6B81 100%)",
              color: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(255, 107, 129, 0.35)",
            }}
          >
            <RotateCcw size={18} />
            <span>Restart Level (3 Lives)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
