import React from "react";
import { Maximize2, Sparkles, HelpCircle } from "lucide-react";

export function ReferencePreview({
  level,
  onEnlarge,
  showGhostHint,
  onToggleGhostHint,
}) {
  return (
    <div className="reference-card">
      <div className="reference-header">
        <span className="ref-badge">REFERENCE TARGET</span>
        <button
          onClick={onToggleGhostHint}
          className={`ghost-hint-btn ${showGhostHint ? "active" : ""}`}
          title="Toggle faint background guide on the board"
        >
          <Sparkles size={14} />
          <span>{showGhostHint ? "Guide: ON" : "Guide: OFF"}</span>
        </button>
      </div>

      <div className="reference-thumb-box" onClick={onEnlarge} role="button" tabIndex={0}>
        <img
          src={level.imageSrc}
          alt={level.personality.name}
          className="reference-thumb-img"
        />
        <div className="thumb-hover-overlay">
          <Maximize2 size={20} />
          <span>Enlarge</span>
        </div>
      </div>

      <div className="reference-meta">
        <h4 className="personality-name">{level.personality.name}</h4>
        <p className="personality-sub">{level.personality.category}</p>
      </div>
    </div>
  );
}

