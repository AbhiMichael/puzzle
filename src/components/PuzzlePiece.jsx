import React from "react";

export function PuzzlePiece({
  piece,
  isSelected,
  isDragging,
  isShaking,
  onPointerDown,
  onClick,
  style = {},
}) {
  return (
    <div
      className={`puzzle-piece-item ${isSelected ? "selected" : ""} ${
        isDragging ? "dragging" : ""
      } ${isShaking ? "shake-piece" : ""}`}
      style={{
        width: `${piece.canvasW}px`,
        height: `${piece.canvasH}px`,
        ...style,
      }}
      onPointerDown={(e) => onPointerDown && onPointerDown(e, piece)}
      onClick={(e) => onClick && onClick(e, piece)}
      role="button"
      tabIndex={0}
      data-piece-id={piece.id}
    >
      <img
        src={piece.dataUrl}
        alt={`Piece ${piece.index + 1}`}
        className="piece-image"
        draggable={false}
      />
      {isSelected && <div className="selected-glow" />}
    </div>
  );
}

