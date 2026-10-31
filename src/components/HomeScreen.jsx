import React from "react";
import { Play, Lock, CheckCircle2, Trophy, HelpCircle, Volume2, VolumeX, Sparkles, Heart } from "lucide-react";
import { NilavilakkuIcon, KasavuBorder } from "./KeralaMotif";

export function HomeScreen({
  levels,
  unlockedLevels,
  completedLevels,
  onStartGame,
  onSelectLevel,
  onOpenHowToPlay,
  isMuted,
  onToggleSound,
}) {
  return (
    <div className="home-screen-container">
      {/* Kasavu Gold Decorative Top Bar */}
      <KasavuBorder />

      {/* Main Hero Header */}
      <header className="home-hero">
        <div className="hero-badge">
          <NilavilakkuIcon size={26} />
          <span>NOVEMBER 1 • KERALA PIRAVI 2026</span>
          <NilavilakkuIcon size={26} />
        </div>

        <h1 className="hero-title">
          <span className="title-top">THE GREAT</span>
          <span className="title-gold">KERALA PUZZLE</span>
          <span className="title-sub">CHALLENGE</span>
        </h1>

        <p className="hero-subtitle">
          "Celebrate the spirit of Kerala, one puzzle at a time."
        </p>

        <p className="hero-intro">
          Immerse yourself in authentic interlocking jigsaw puzzles featuring three iconic legends
          of God’s Own Country across Cinema, Literature, and World Athletics.
        </p>

        {/* Primary CTA Button */}
        <div className="hero-cta-group">
          <button
            onClick={() => onStartGame(unlockedLevels[unlockedLevels.length - 1] || 1)}
            className="play-now-btn"
          >
            <Play size={24} fill="#ffffff" />
            <span>PLAY NOW</span>
          </button>

          <button onClick={onOpenHowToPlay} className="how-to-play-hero-btn">
            <HelpCircle size={20} />
            <span>How to Play</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`sound-hero-btn ${isMuted ? "muted" : ""}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      {/* 3-Level Preview Section */}
      <section className="levels-preview-section">
        <div className="section-title-wrap">
          <h2 className="section-title">THE THREE CHALLENGE LEVELS</h2>
          <p className="section-sub">
            Conquer each stage to unlock the next and claim the title of Kerala Puzzle Master.
          </p>
        </div>

        <div className="levels-grid">
          {levels.map((lvl) => {
            const isUnlocked = unlockedLevels.includes(lvl.levelNumber);
            const isCompleted = completedLevels.includes(lvl.levelNumber);

            return (
              <div
                key={lvl.id}
                className={`level-card ${isUnlocked ? "unlocked" : "locked"} ${
                  isCompleted ? "completed" : ""
                }`}
                onClick={() => isUnlocked && onSelectLevel(lvl.levelNumber)}
                role="button"
                tabIndex={0}
              >
                {/* Level Card Image */}
                <div className="level-card-image-wrap">
                  <img
                    src={lvl.imageSrc}
                    alt={lvl.personality.name}
                    className="level-card-img"
                  />
                  <div className="level-badge-overlay">
                    <span className="level-num">LEVEL 0{lvl.levelNumber}</span>
                    <span className="level-diff">{lvl.difficulty}</span>
                  </div>

                  {isCompleted && (
                    <div className="completed-ribbon">
                      <CheckCircle2 size={16} /> COMPLETED
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="locked-overlay">
                      <Lock size={32} />
                      <span>Complete Level {lvl.levelNumber - 1} to Unlock</span>
                    </div>
                  )}
                </div>

                {/* Level Card Details */}
                <div className="level-card-body">
                  <div className="level-meta-row">
                    <span className="pieces-pill">{lvl.piecesCount} Jigsaw Pieces</span>
                    <span className="lives-pill">
                      <Heart size={14} fill="#ff3366" stroke="#ff3366" /> 3 Lives
                    </span>
                  </div>

                  <h3 className="card-personality-name">{lvl.personality.name}</h3>
                  <span className="card-category">{lvl.personality.category}</span>
                  <p className="card-tagline">{lvl.tagline}</p>

                  <button
                    className={`level-action-btn ${isUnlocked ? "active" : "disabled"}`}
                    disabled={!isUnlocked}
                  >
                    {isCompleted ? "Replay Puzzle" : isUnlocked ? "Play Level" : "Locked"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Kerala Piravi Tribute & Quick Rules Footer */}
      <footer className="home-footer">
        <KasavuBorder />
        <div className="footer-content">
          <div className="footer-rule">
            <span className="rule-number">1</span>
            <div>
              <strong>3 Lives Per Level</strong>
              <p>Wrong placements on the puzzle board consume 1 life.</p>
            </div>
          </div>
          <div className="footer-rule">
            <span className="rule-number">2</span>
            <div>
              <strong>Authentic Jigsaw Pieces</strong>
              <p>Real interlocking tabs & sockets, not simple grid rectangles.</p>
            </div>
          </div>
          <div className="footer-rule">
            <span className="rule-number">3</span>
            <div>
              <strong>Progressive Journey</strong>
              <p>Reconstruct all 3 Kerala icons to win the Master title.</p>
            </div>
          </div>
        </div>

        <div className="footer-credit">
          <span>KERALA PIRAVI 2026 • CELEBRATING 70 YEARS OF KERALA FORMATION (1956 - 2026)</span>
        </div>
      </footer>
    </div>
  );
}

