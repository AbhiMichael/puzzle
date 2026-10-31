import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Award, RotateCcw, Home, Sparkles } from "lucide-react";
import { sounds } from "../utils/soundEffects";

export function VictoryScreen({ player, levels, onPlayAgain, onHome }) {
  useEffect(() => {
    sounds.playVictory();

    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#BFE3C0", "#FFF0B8", "#F8D8C4", "#52B788", "#FFD700"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="dash-container" style={{ padding: "30px 16px", textAlign: "center" }}>
      <div className="reg-badge" style={{ margin: "0 auto 16px" }}>
        <Sparkles size={16} />
        <span>KERALA PIRAVI 2026 • CHAMPION</span>
      </div>

      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF0B8", color: "#B38600", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Trophy size={44} />
      </div>

      <h1 style={{ fontSize: clamp(28, "6vw", 38), fontWeight: 900, color: "#34443A", marginBottom: 6 }}>
        KERALA PUZZLE MASTER!
      </h1>
      <p style={{ fontSize: 15, color: "#6B7F72", maxWidth: 480, margin: "0 auto 20px" }}>
        Congratulations, <strong>{player.name}</strong>! You have successfully reconstructed the portraits of Kerala's icons across Cinema, Literature, and World Athletics.
      </p>

      {/* Score Card */}
      <div style={{ background: "#FFFFFF", border: "2px solid #BFE3C0", borderRadius: 16, padding: "16px 24px", maxWidth: 360, margin: "0 auto 28px", boxShadow: "0 4px 16px rgba(52, 68, 58, 0.08)" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#6B7F72", textTransform: "uppercase" }}>FINAL CHAMPIONSHIP SCORE</span>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#4A7A57", marginTop: 4 }}>
          {player.score || 0} pts
        </div>
      </div>

      {/* Gallery of 3 Icons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {levels.map((lvl) => (
          <div key={lvl.id} style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #DCEED5", overflow: "hidden", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ height: 140, overflow: "hidden" }}>
              <img src={lvl.imageSrc} alt={lvl.personality.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#4A7A57" }}>LEVEL 0{lvl.levelNumber}</span>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: "#34443A", margin: "2px 0" }}>{lvl.personality.name}</h4>
              <p style={{ fontSize: 12, color: "#6B7F72" }}>{lvl.personality.category}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={onHome}
          className="submit-btn"
          style={{
            background: "#F0F5E8",
            color: "#34443A",
            border: "1px solid #DCEED5",
            boxShadow: "none",
            padding: "14px 24px",
          }}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </button>

        <button onClick={onPlayAgain} className="submit-btn" style={{ padding: "14px 28px" }}>
          <RotateCcw size={18} />
          <span>Play Again from Level 1</span>
        </button>
      </div>
    </div>
  );
}

function clamp(min, pref, max) {
  return `clamp(${min}px, ${pref}, ${max}px)`;
}
