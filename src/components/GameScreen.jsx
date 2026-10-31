import React, { useState, useEffect, useRef, useCallback } from "react";
import { PuzzleBoard } from "./PuzzleBoard";
import { PuzzlePiece } from "./PuzzlePiece";
import { LevelCompleteModal } from "./LevelCompleteModal";
import { GameOverModal } from "./GameOverModal";
import { createJigsawPieces } from "../utils/jigsawGenerator";
import { sounds } from "../utils/soundEffects";
import {
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Heart,
  Shuffle,
  Volume2,
  VolumeX,
  Award,
  Sparkles,
} from "lucide-react";
import { SyncStatusBadge } from "./SyncStatusBadge";

export function GameScreen({
  player,
  level,
  onLevelComplete,
  onBackToDashboard,
  onScoreUpdate,
  onSaveProgress,
  savedPlacedPieces = {},
  isMuted,
  onToggleSound,
}) {
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(player.score || 0);
  const [pieces, setPieces] = useState([]);
  const [trayPieces, setTrayPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState([]);
  const [edgeGrid, setEdgeGrid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Layout sizing
  const [boardSize, setBoardSize] = useState({ width: 360, height: 260 });
  const boardAreaRef = useRef(null);

  // UX states
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isLivesShaking, setIsLivesShaking] = useState(false);
  const [wrongSlotId, setWrongSlotId] = useState(null);
  const [justPlacedId, setJustPlacedId] = useState(null);
  const [scoreDelta, setScoreDelta] = useState(null); // { value: '+10' | '-5', type: 'plus' | 'minus' }

  // 5-Second Hint System (Bulb button)
  const [isHintActive, setIsHintActive] = useState(false);
  const [hintTimer, setHintTimer] = useState(5);
  const hintIntervalRef = useRef(null);

  // Dragging state
  const [dragState, setDragState] = useState(null);
  const dragRef = useRef(null);
  const isProcessingPlacementRef = useRef(false);

  // Measure and compute optimal board dimensions based on viewport
  const computeBoardDimensions = useCallback(() => {
    if (!boardAreaRef.current) return;
    const container = boardAreaRef.current;
    const availableW = Math.min(container.clientWidth - 16, 520);
    let targetW = Math.max(availableW, 260);
    let targetH = Math.round(targetW / level.aspectRatio);

    const maxH = window.innerHeight < 700 ? 280 : 380;
    if (targetH > maxH) {
      targetH = maxH;
      targetW = Math.round(targetH * level.aspectRatio);
    }

    setBoardSize({ width: targetW, height: targetH });
  }, [level.aspectRatio]);

  useEffect(() => {
    computeBoardDimensions();
    const handleResize = () => computeBoardDimensions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computeBoardDimensions]);

  // Clean up hint interval on unmount
  useEffect(() => {
    return () => {
      if (hintIntervalRef.current) clearInterval(hintIntervalRef.current);
    };
  }, []);

  // Trigger 5-Second Hint
  const handleTriggerHint = () => {
    if (isHintActive) return;
    sounds.playPick();

    setIsHintActive(true);
    setHintTimer(5);

    if (hintIntervalRef.current) clearInterval(hintIntervalRef.current);

    let count = 5;
    hintIntervalRef.current = setInterval(() => {
      count -= 1;
      setHintTimer(count);
      if (count <= 0) {
        clearInterval(hintIntervalRef.current);
        setIsHintActive(false);
      }
    }, 1000);
  };

  // Load level image and carve authentic jigsaw pieces
  const initializeLevel = useCallback(async () => {
    setIsLoading(true);
    setLives(3);
    setSelectedPiece(null);
    setShowLevelComplete(false);
    setShowGameOver(false);
    setWrongSlotId(null);
    setJustPlacedId(null);

    const img = new Image();
    img.src = level.imageSrc;
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        const { width, height } = boardSize;
        const { pieces: generatedPieces, hEdges, vEdges } = await createJigsawPieces(
          img,
          level,
          width,
          height
        );

        setPieces(generatedPieces);
        setEdgeGrid({ hEdges, vEdges });

        // Restore previously saved placed pieces for this level if any
        const previouslyPlacedIds = savedPlacedPieces[level.levelNumber] || [];
        const restoredPlaced = [];
        const remainingTray = [];

        generatedPieces.forEach((p) => {
          if (previouslyPlacedIds.includes(p.id)) {
            restoredPlaced.push({ ...p, isPlaced: true });
          } else {
            remainingTray.push(p);
          }
        });

        setPlacedPieces(restoredPlaced);
        // Shuffle remaining pieces
        setTrayPieces(remainingTray.sort(() => Math.random() - 0.5));
        setIsLoading(false);
      } catch (err) {
        console.error("Error creating jigsaw pieces:", err);
        setIsLoading(false);
      }
    };

    img.onerror = (err) => {
      console.error("Error loading level image:", err);
      setIsLoading(false);
    };
  }, [level, boardSize, savedPlacedPieces]);

  useEffect(() => {
    initializeLevel();
  }, [level.id, boardSize.width, boardSize.height]);

  // Restart Level: resets current level puzzle state & lives, keeps overall score
  const handleRestartLevel = () => {
    sounds.playPick();
    setLives(3);
    setSelectedPiece(null);
    setShowGameOver(false);
    setShowLevelComplete(false);
    setWrongSlotId(null);
    setJustPlacedId(null);
    setPlacedPieces([]);

    const shuffled = [...pieces].sort(() => Math.random() - 0.5);
    setTrayPieces(shuffled);

    // Save reset state for this level
    onSaveProgress({
      currentLevel: level.levelNumber,
      lives: 3,
      score,
      placedPieces: { [level.levelNumber]: [] },
      puzzleState: "restarted",
    });
  };

  // Trigger floating score delta animation (+10 or -5)
  const triggerScoreDelta = (val, type) => {
    setScoreDelta({ value: val, type });
    setTimeout(() => setScoreDelta(null), 1000);
  };

  // Handle Correct Piece Placement (+10 Points)
  const handlePieceSuccess = (piece) => {
    if (showGameOver || showLevelComplete) return;

    // Check if piece already placed to prevent duplicate scoring
    if (placedPieces.some((p) => p.id === piece.id)) return;

    sounds.playSnap();
    setJustPlacedId(piece.id);
    setTimeout(() => setJustPlacedId(null), 600);

    const newPlaced = [...placedPieces, piece];
    const newTray = trayPieces.filter((p) => p.id !== piece.id);
    setPlacedPieces(newPlaced);
    setTrayPieces(newTray);
    setSelectedPiece(null);

    // Scoring: +10 points
    const newScore = score + 10;
    setScore(newScore);
    onScoreUpdate(newScore);
    triggerScoreDelta("+10", "plus");

    const updatedPlacedIds = newPlaced.map((p) => p.id);

    // Check if level completed!
    if (newPlaced.length === pieces.length) {
      // Award +50 Level Completion Bonus!
      const finalScore = newScore + 50;
      setScore(finalScore);
      onScoreUpdate(finalScore);
      triggerScoreDelta("+50 BONUS", "plus");

      setTimeout(() => {
        setShowLevelComplete(true);
        onLevelComplete(level.levelNumber, finalScore);
      }, 500);

      onSaveProgress({
        currentLevel: level.levelNumber,
        lives,
        score: finalScore,
        placedPieces: { [level.levelNumber]: updatedPlacedIds },
        completedLevels: [level.levelNumber],
        puzzleState: "completed",
      });
    } else {
      // Save progress to backend
      onSaveProgress({
        currentLevel: level.levelNumber,
        lives,
        score: newScore,
        placedPieces: { [level.levelNumber]: updatedPlacedIds },
        puzzleState: "in_progress",
      });
    }
  };

  // Handle Incorrect Placement (-5 Points & -1 Life)
  const handleWrongPlacement = (slotRow, slotCol) => {
    if (showGameOver || showLevelComplete) return;

    sounds.playError();
    const nextLives = Math.max(0, lives - 1);
    const nextScore = Math.max(0, score - 5); // Prevent negative score

    setLives(nextLives);
    setScore(nextScore);
    onScoreUpdate(nextScore);
    triggerScoreDelta("-5", "minus");
    setSelectedPiece(null);

    setIsLivesShaking(true);
    setTimeout(() => setIsLivesShaking(false), 500);

    setWrongSlotId(`${slotRow}-${slotCol}`);
    setTimeout(() => setWrongSlotId(null), 500);

    // Save progress after mistake
    onSaveProgress({
      currentLevel: level.levelNumber,
      lives: nextLives,
      score: nextScore,
      placedPieces: { [level.levelNumber]: placedPieces.map((p) => p.id) },
      puzzleState: nextLives <= 0 ? "game_over" : "in_progress",
    });

    if (nextLives <= 0) {
      setTimeout(() => {
        setShowGameOver(true);
      }, 350);
    }
  };

  // Pointer drag events for smooth 60fps tracking
  const handlePiecePointerDown = (e, piece) => {
    if (showGameOver || showLevelComplete) return;
    if (e.button && e.button !== 0) return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const dragInfo = {
      piece,
      startX: e.clientX,
      startY: e.clientY,
      offsetX,
      offsetY,
      currentX: e.clientX,
      currentY: e.clientY,
      hasMoved: false,
    };

    setDragState(dragInfo);
    dragRef.current = dragInfo;

    const onPointerMove = (moveEvt) => {
      if (!dragRef.current) return;
      const dist = Math.hypot(
        moveEvt.clientX - dragRef.current.startX,
        moveEvt.clientY - dragRef.current.startY
      );
      if (dist > 5) {
        dragRef.current.hasMoved = true;
      }
      dragRef.current.currentX = moveEvt.clientX;
      dragRef.current.currentY = moveEvt.clientY;
      setDragState({ ...dragRef.current });
    };

    const onPointerUp = (upEvt) => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      const activeDrag = dragRef.current;
      setDragState(null);
      dragRef.current = null;

      if (!activeDrag) return;

      // Tap-to-select mode toggle
      if (!activeDrag.hasMoved) {
        sounds.playPick();
        setSelectedPiece((curr) => (curr && curr.id === piece.id ? null : piece));
        return;
      }

      // Drag drop resolution
      handleDrop(activeDrag.piece, upEvt.clientX, upEvt.clientY);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Evaluate dropped piece on board
  const handleDrop = (piece, clientX, clientY) => {
    if (isProcessingPlacementRef.current) return;
    isProcessingPlacementRef.current = true;

    setTimeout(() => {
      isProcessingPlacementRef.current = false;
    }, 300);

    const boardEl = document.querySelector('[data-board="true"]');
    if (!boardEl) return;

    const boardRect = boardEl.getBoundingClientRect();
    const { cols, rows } = level;
    const pw = boardSize.width / cols;
    const ph = boardSize.height / rows;

    const pieceCenterX = clientX - boardRect.left;
    const pieceCenterY = clientY - boardRect.top;

    // Check if drop is over board area
    const isOverBoard =
      pieceCenterX >= -pw * 0.35 &&
      pieceCenterX <= boardSize.width + pw * 0.35 &&
      pieceCenterY >= -ph * 0.35 &&
      pieceCenterY <= boardSize.height + ph * 0.35;

    if (!isOverBoard) {
      // Safe drop outside board (no life lost)
      return;
    }

    const targetCol = Math.max(0, Math.min(cols - 1, Math.floor(pieceCenterX / pw)));
    const targetRow = Math.max(0, Math.min(rows - 1, Math.floor(pieceCenterY / ph)));

    const slotCenterX = targetCol * pw + pw / 2;
    const slotCenterY = targetRow * ph + ph / 2;
    const distToSlot = Math.hypot(pieceCenterX - slotCenterX, pieceCenterY - slotCenterY);
    const snapThreshold = Math.max(pw, ph) * 0.7;

    const isOccupied = placedPieces.some((p) => p.row === targetRow && p.col === targetCol);
    if (isOccupied) return;

    if (piece.row === targetRow && piece.col === targetCol && distToSlot <= snapThreshold) {
      handlePieceSuccess(piece);
    } else {
      handleWrongPlacement(targetRow, targetCol);
    }
  };

  // Tap-to-Place handler
  const handleSlotClick = (slotRow, slotCol) => {
    if (!selectedPiece || isProcessingPlacementRef.current) return;
    isProcessingPlacementRef.current = true;
    setTimeout(() => {
      isProcessingPlacementRef.current = false;
    }, 300);

    if (selectedPiece.row === slotRow && selectedPiece.col === slotCol) {
      handlePieceSuccess(selectedPiece);
    } else {
      handleWrongPlacement(slotRow, slotCol);
    }
  };

  const handleShuffleTray = () => {
    sounds.playPick();
    setTrayPieces((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const progressPercent = pieces.length > 0 ? Math.round((placedPieces.length / pieces.length) * 100) : 0;

  return (
    <div className="game-screen-wrapper">
      {/* Score Delta Float Alert (+10 / -5) */}
      {scoreDelta && (
        <div className={`score-delta-popup ${scoreDelta.type}`}>
          {scoreDelta.value}
        </div>
      )}

      {/* Top Header */}
      <header className="game-header-pastel">
        <div className="game-header-inner">
          <div className="header-left-actions">
            <button
              onClick={onBackToDashboard}
              className="header-icon-btn"
              title="Return to Dashboard"
              aria-label="Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="game-level-indicator">
              L0{level.levelNumber} • {level.piecesCount}P
            </span>
            <SyncStatusBadge compact={true} />
          </div>

          <div className="header-status-group">
            {/* 3 Lives Track */}
            <div className={`lives-pill-pastel ${isLivesShaking ? "shake-hearts" : ""}`}>
              {Array.from({ length: 3 }).map((_, i) => {
                const isAlive = i < lives;
                return (
                  <div
                    key={i}
                    className={`heart-unit ${isAlive ? "active" : "lost"} ${
                      i === lives ? "just-lost" : ""
                    }`}
                  >
                    <Heart
                      size={17}
                      fill={isAlive ? "#FF6B81" : "transparent"}
                      stroke={isAlive ? "#FF6B81" : "#A6B5AC"}
                    />
                  </div>
                );
              })}
            </div>

            {/* Score */}
            <div className="game-score-badge">
              <Award size={15} />
              <span>{score}</span>
            </div>

            {/* 5-Second Hint Button (Bulb Icon) */}
            <button
              onClick={handleTriggerHint}
              className={`hint-btn-bulb ${isHintActive ? "active" : ""}`}
              title="Peek at original image for 5 seconds (No penalty)"
              disabled={isHintActive}
            >
              <Lightbulb size={16} />
              <span>{isHintActive ? `${hintTimer}s` : "Hint"}</span>
            </button>

            {/* Restart Level */}
            <button
              onClick={handleRestartLevel}
              className="header-icon-btn"
              title="Restart Level"
              aria-label="Restart"
            >
              <RotateCcw size={16} />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="header-icon-btn"
              title={isMuted ? "Unmute" : "Mute"}
              aria-label="Sound"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Play Arena */}
      <main className="game-arena">
        <section className="board-container-wrapper" ref={boardAreaRef}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7F72" }}>
              <Sparkles size={28} className="spinner" style={{ margin: "0 auto 12px" }} />
              <p>Preparing jigsaw pieces...</p>
            </div>
          ) : (
            <PuzzleBoard
              level={level}
              boardWidth={boardSize.width}
              boardHeight={boardSize.height}
              placedPieces={placedPieces}
              edgeGrid={edgeGrid}
              isHintActive={isHintActive}
              hintTimeRemaining={hintTimer}
              selectedPiece={selectedPiece}
              onSlotClick={handleSlotClick}
              wrongSlotId={wrongSlotId}
              justPlacedId={justPlacedId}
            />
          )}
        </section>
      </main>

      {/* Bottom Pieces Tray */}
      <section className="tray-section">
        <div className="tray-header-row">
          <div className="tray-title-text">
            <span>PIECES</span>
            <span className="tray-pieces-remaining">
              ({placedPieces.length}/{level.piecesCount} Placed • {progressPercent}%)
            </span>
          </div>

          <button onClick={handleShuffleTray} className="tray-shuffle-btn">
            <Shuffle size={14} />
            <span>Shuffle</span>
          </button>
        </div>

        <div className="pieces-tray-scroll">
          {trayPieces.map((piece) => {
            const isSelected = selectedPiece && selectedPiece.id === piece.id;
            const isBeingDragged = dragState && dragState.piece.id === piece.id;

            return (
              <PuzzlePiece
                key={piece.id}
                piece={piece}
                isSelected={isSelected}
                isDragging={isBeingDragged}
                onPointerDown={handlePiecePointerDown}
              />
            );
          })}
          {trayPieces.length === 0 && !isLoading && (
            <div style={{ textAlign: "center", width: "100%", color: "#2E7D32", fontWeight: 700, padding: 20 }}>
              🎉 Puzzle Assembled!
            </div>
          )}
        </div>
      </section>

      {/* Floating Dragging Clone */}
      {dragState && (
        <div
          className="floating-drag-piece"
          style={{
            left: `${dragState.currentX - dragState.offsetX}px`,
            top: `${dragState.currentY - dragState.offsetY}px`,
            width: `${dragState.piece.canvasW}px`,
            height: `${dragState.piece.canvasH}px`,
          }}
        >
          <img
            src={dragState.piece.dataUrl}
            alt="Dragging piece"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      )}

      {/* Level Complete Modal */}
      {showLevelComplete && (
        <LevelCompleteModal
          level={level}
          score={score}
          onNextLevel={() => {
            setShowLevelComplete(false);
            if (level.levelNumber < 3) {
              onLevelComplete(level.levelNumber + 1, score);
            } else {
              onBackToDashboard();
            }
          }}
          onReplay={handleRestartLevel}
        />
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <GameOverModal
          level={level}
          score={score}
          onRestart={handleRestartLevel}
          onBackToDashboard={onBackToDashboard}
        />
      )}
    </div>
  );
}
