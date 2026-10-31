import React from "react";
import { X, Sparkles } from "lucide-react";

export function EnlargedReferenceModal({ level, onClose }) {
  if (!level) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card reference-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div>
            <span className="modal-eyebrow">REFERENCE PHOTOGRAPH</span>
            <h3>{level.personality.name}</h3>
            <p className="subtext">{level.personality.title}</p>
          </div>
          <button className="close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="enlarged-image-wrap">
          <img
            src={level.imageSrc}
            alt={level.personality.name}
            className="enlarged-photo"
          />
        </div>

        <div className="reference-footer-info">
          <div className="category-tag">{level.personality.category}</div>
          <p className="bio-snippet">{level.personality.bio}</p>
        </div>

        <div className="modal-actions center">
          <button onClick={onClose} className="secondary-btn">
            Back to Puzzle
          </button>
        </div>
      </div>
    </div>
  );
}

