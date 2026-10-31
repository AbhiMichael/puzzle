import React, { useRef, useEffect } from "react";
import { tracePiecePath } from "../utils/jigsawGenerator";
import { Eye } from "lucide-react";

export function PuzzleBoard({
  level,
  boardWidth,
  boardHeight,
  placedPieces = [],
  edgeGrid,
  isHintActive,
  hintTimeRemaining = 5,
  selectedPiece,
  onSlotClick,
  wrongSlotId,
  justPlacedId,
}) {
  const canvasRef = useRef(null);
  const { cols, rows } = level;
  const pw = boardWidth / cols;
  const ph = boardHeight / rows;

  // Draw light, modern pastel board background and jigsaw slot outlines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !edgeGrid) return;
    const ctx = canvas.getContext("2d");

    canvas.width = boardWidth;
    canvas.height = boardHeight;

    // 1. Fresh pastel green / cream board background
    const bgGrad = ctx.createLinearGradient(0, 0, boardWidth, boardHeight);
    bgGrad.addColorStop(0, "#F7FAF2");
    bgGrad.addColorStop(1, "#EBF4E7");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, boardWidth, boardHeight);

    // 2. Subtle cloth weave texture / Kerala kasavu motif
    ctx.fillStyle = "rgba(191, 227, 192, 0.25)";
    for (let x = 0; x < boardWidth; x += 12) {
      ctx.fillRect(x, 0, 1, boardHeight);
    }
    for (let y = 0; y < boardHeight; y += 12) {
      ctx.fillRect(0, y, boardWidth, 1);
    }

    // 3. Draw each slot's authentic jigsaw outline
    if (edgeGrid.hEdges && edgeGrid.vEdges) {
      const { hEdges, vEdges } = edgeGrid;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const top = r === 0 ? { dir: 0, depthRatio: 0 } : { dir: -hEdges[r - 1][c].dir, depthRatio: hEdges[r - 1][c].depthRatio };
          const right = c === cols - 1 ? { dir: 0, depthRatio: 0 } : { dir: vEdges[r][c].dir, depthRatio: vEdges[r][c].depthRatio };
          const bottom = r === rows - 1 ? { dir: 0, depthRatio: 0 } : { dir: hEdges[r][c].dir, depthRatio: hEdges[r][c].depthRatio };
          const left = c === 0 ? { dir: 0, depthRatio: 0 } : { dir: -vEdges[r][c - 1].dir, depthRatio: vEdges[r][c - 1].depthRatio };

          const edges = { top, right, bottom, left };
          const ox = c * pw;
          const oy = r * ph;

          // Slot outline in clean mint/forest dashed line
          ctx.save();
          tracePiecePath(ctx, ox, oy, pw, ph, edges);
          ctx.strokeStyle = "rgba(74, 122, 87, 0.35)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();

          // Slot center dot
          ctx.fillStyle = "rgba(74, 122, 87, 0.25)";
          ctx.beginPath();
          ctx.arc(ox + pw / 2, oy + ph / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Board outer border
    ctx.strokeStyle = "#BFE3C0";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, boardWidth, boardHeight);
  }, [boardWidth, boardHeight, level, edgeGrid]);

  return (
    <div className="board-container-wrapper">
      <div
        className="puzzle-board-container"
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
        }}
        data-board="true"
      >
        {/* Background canvas with slot lines */}
        <canvas
          ref={canvasRef}
          className="puzzle-board-canvas"
          style={{ width: `${boardWidth}px`, height: `${boardHeight}px` }}
        />

        {/* 5-Second Hint Image Overlay (Only visible when Hint button is triggered) */}
        {isHintActive && (
          <div className="hint-image-overlay">
            <img src={level.imageSrc} alt="Hint Preview" />
            <div className="hint-timer-chip">
              <Eye size={14} />
              <span>Hint: {hintTimeRemaining}s</span>
            </div>
            <div className="hint-countdown-bar-wrap">
              <div
                className="hint-countdown-bar"
                style={{ width: `${(hintTimeRemaining / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Interactive Slot Targets (for tap-to-place & drop hit-testing) */}
        <div className="board-slots-grid">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="board-row">
              {Array.from({ length: cols }).map((_, c) => {
                const slotKey = `${r}-${c}`;
                const isOccupied = placedPieces.some((p) => p.row === r && p.col === c);
                const isWrong = wrongSlotId === slotKey;

                return (
                  <div
                    key={c}
                    className={`board-slot ${isOccupied ? "occupied" : "empty"} ${
                      isWrong ? "wrong-shake" : ""
                    } ${selectedPiece && !isOccupied ? "highlight-target" : ""}`}
                    style={{
                      width: `${pw}px`,
                      height: `${ph}px`,
                      left: `${c * pw}px`,
                      top: `${r * ph}px`,
                    }}
                    data-row={r}
                    data-col={c}
                    data-slot-key={slotKey}
                    onClick={() => !isOccupied && onSlotClick && onSlotClick(r, c)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Render all correctly placed jigsaw pieces */}
        {placedPieces.map((piece) => {
          const isJustPlaced = justPlacedId === piece.id;
          const left = piece.col * pw - piece.pad;
          const top = piece.row * ph - piece.pad;

          return (
            <div
              key={piece.id}
              className={`placed-piece ${isJustPlaced ? "just-placed-anim" : ""}`}
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                width: `${piece.canvasW}px`,
                height: `${piece.canvasH}px`,
                pointerEvents: "none",
              }}
            >
              <img
                src={piece.dataUrl}
                alt={`Piece ${piece.row}-${piece.col}`}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
