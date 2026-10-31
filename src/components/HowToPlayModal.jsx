import React from "react";
import { X, Heart, Move, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import { NilavilakkuIcon } from "./KeralaMotif";

export function HowToPlayModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card how-to-play-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="title-with-icon">
            <NilavilakkuIcon size={28} />
            <div>
              <h3>How to Play</h3>
              <p className="subtext">Kerala Piravi – The Great Kerala Puzzle Challenge</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-icon-box gold">
              <Move size={24} />
            </div>
            <h4>1. Drag or Tap to Place</h4>
            <p>
              Drag jigsaw pieces from the bottom tray onto their correct board slots, or simply tap a
              piece to select it and tap a board slot!
            </p>
          </div>

          <div className="rule-card">
            <div className="rule-icon-box pink">
              <Heart size={24} />
            </div>
            <h4>2. Strict 3 Lives Rule</h4>
            <p>
              You get <strong>3 lives</strong> per level. Placing a piece onto an incorrect slot on the board
              deducts 1 life! Moving pieces inside the tray is safe.
            </p>
          </div>

          <div className="rule-card">
            <div className="rule-icon-box green">
              <CheckCircle size={24} />
            </div>
            <h4>3. Authentic Interlocking Jigsaw</h4>
            <p>
              Pieces have real jigsaw tabs and sockets. Match the interlocking edge contours and image
              details to find the right slot.
            </p>
          </div>

          <div className="rule-card">
            <div className="rule-icon-box blue">
              <Sparkles size={24} />
            </div>
            <h4>4. Progressive Levels</h4>
            <p>
              Advance from <strong>Level 1 (15 pieces)</strong> to <strong>Level 2 (20 pieces)</strong> and{" "}
              <strong>Level 3 (25 pieces)</strong> to earn the title of <strong>Kerala Puzzle Master</strong>!
            </p>
          </div>
        </div>

        <div className="modal-actions center">
          <button onClick={onClose} className="primary-btn glow-btn">
            Got It! Let's Play
          </button>
        </div>
      </div>
    </div>
  );
}

