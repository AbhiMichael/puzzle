import React from "react";
import { Heart, RotateCcw, Volume2, VolumeX, Home, HelpCircle, Eye } from "lucide-react";
import { NilavilakkuIcon } from "./KeralaMotif";

export function GameHeader({
  level,
  lives,
  maxLives = 3,
  onRestart,
  onHome,
  onToggleSound,
  isMuted,
  onToggleReference,
  onOpenHowToPlay,
  isLivesShaking,
}) {
  return (
    <header className="game-header">
      <div className="header-top-row">
        {/* Kerala Piravi Brand */}
        <div className="brand-group" onClick={onHome} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <NilavilakkuIcon size={32} />
          </div>
          <div className="brand-text">
            <div className="brand-badge">
              <span className="dot" /> NOVEMBER 1 • KERALA PIRAVI
            </div>
            <h1 className="brand-title">THE GREAT KERALA PUZZLE</h1>
          </div>
        </div>

        {/* Level & Lives Status */}
        <div className="status-group">
          {/* Level Pill */}
          <div className="level-pill">
            <span className="level-tag">LEVEL 0{level.levelNumber}</span>
            <span className="level-sep">|</span>
            <span className="level-name">{level.difficulty}</span>
            <span className="level-count">({level.piecesCount} Pieces)</span>
          </div>

          {/* 3 Lives System with Heart Icons */}
          <div className={`lives-container ${isLivesShaking ? "shake-hearts" : ""}`}>
            <span className="lives-label">LIVES:</span>
            <div className="hearts-track">
              {Array.from({ length: maxLives }).map((_, index) => {
                const isAlive = index < lives;
                return (
                  <div
                    key={index}
                    className={`heart-wrapper ${isAlive ? "active" : "lost"} ${
                      index === lives ? "just-lost" : ""
                    }`}
                    title={isAlive ? "Life active" : "Life lost"}
                  >
                    <Heart
                      size={22}
                      className="heart-icon"
                      fill={isAlive ? "#ff3366" : "transparent"}
                      stroke={isAlive ? "#ff3366" : "rgba(255, 255, 255, 0.3)"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-group">
          <button
            onClick={onToggleReference}
            className="header-btn"
            title="View Original Reference Photograph"
          >
            <Eye size={18} />
            <span className="btn-text">Reference</span>
          </button>

          <button
            onClick={onRestart}
            className="header-btn restart-btn"
            title="Restart Level (Restores 3 lives & reshuffles pieces)"
          >
            <RotateCcw size={18} />
            <span className="btn-text">Restart</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`header-btn icon-only ${isMuted ? "muted" : ""}`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="header-btn icon-only"
            title="How to Play"
          >
            <HelpCircle size={18} />
          </button>

          <button
            onClick={onHome}
            className="header-btn icon-only"
            title="Return to Home"
          >
            <Home size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

