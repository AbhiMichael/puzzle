import React, { useState, useEffect } from "react";
import { RegistrationScreen } from "./components/RegistrationScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { GameScreen } from "./components/GameScreen";
import { VictoryScreen } from "./components/VictoryScreen";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { ProfileModal } from "./components/ProfileModal";
import { LEVELS } from "./data/levelsData";
import { apiService } from "./services/apiService";
import { sounds } from "./utils/soundEffects";

export function App() {
  const [currentScreen, setCurrentScreen] = useState("loading"); // 'loading' | 'register' | 'dashboard' | 'game' | 'victory'
  const [player, setPlayer] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [currentLevelNumber, setCurrentLevelNumber] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [placedPiecesState, setPlacedPiecesState] = useState({}); // { [levelNumber]: [pieceIds...] }

  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [systemNotice, setSystemNotice] = useState(null);

  // Automatic Login & Session Restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      const session = apiService.getLocalSession();
      if (!session) {
        setCurrentScreen("register");
        return;
      }

      console.log("[App] Found saved session for player:", session.playerId);
      const res = await apiService.getProgress(session.playerId, session.token);

      if (res.success && res.player) {
        const resolvedId = res.player.playerId || session.playerId || "";
        const p = {
          ...res.player,
          playerId: resolvedId,
          token: session.token,
        };
        setPlayer(p);
        setSessionToken(session.token);

        const compLevels = Array.isArray(p.completedLevels) ? p.completedLevels : [];
        setCompletedLevels(compLevels);

        // Derive unlocked levels
        const unlocked = [1];
        if (compLevels.includes(1)) unlocked.push(2);
        if (compLevels.includes(2)) unlocked.push(3);
        setUnlockedLevels(unlocked);

        if (p.placedPieces) {
          setPlacedPiecesState(p.placedPieces);
        }

        // Attempt to sync any pending progress
        apiService.flushPendingSync();

        setCurrentScreen("dashboard");
      } else if (session?.data) {
        // Safe offline / pending restore: preserve local progress without clearing
        console.warn("[App] Cloud restoration pending. Using local progress fallback:", session.data);
        const p = session.data;
        setPlayer(p);
        setSessionToken(session.token || p.token || "");
        const compLevels = Array.isArray(p.completedLevels) ? p.completedLevels : [];
        setCompletedLevels(compLevels);
        const unlocked = [1];
        if (compLevels.includes(1)) unlocked.push(2);
        if (compLevels.includes(2)) unlocked.push(3);
        setUnlockedLevels(unlocked);
        if (p.placedPieces) setPlacedPiecesState(p.placedPieces);
        apiService.flushPendingSync();
        setCurrentScreen("dashboard");
      } else {
        console.warn("[App] Session restoration failed. Clearing session.");
        apiService.clearSession();
        setCurrentScreen("register");
      }
    };

    restoreSession();
  }, []);

  // Handle successful registration
  const handleRegisterSuccess = (newPlayer, token, notice) => {
    sounds.playPick();
    const session = apiService.getLocalSession();
    const activeToken = token || newPlayer?.token || session?.token || "";
    const activePlayerId = newPlayer?.playerId || session?.playerId || "";
    const playerWithToken = {
      ...newPlayer,
      playerId: activePlayerId,
      token: activeToken,
    };
    setPlayer(playerWithToken);
    setSessionToken(activeToken);
    setCompletedLevels(newPlayer.completedLevels || []);
    setUnlockedLevels([1]);
    setPlacedPiecesState({});
    if (notice) setSystemNotice(notice);
    setCurrentScreen("dashboard");
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Start / Select level from dashboard
  const handleSelectLevel = (levelNum) => {
    sounds.playPick();
    setCurrentLevelNumber(levelNum);
    setCurrentScreen("game");
    handleSaveProgress({
      currentLevel: levelNum,
      puzzleState: "in_progress",
    });
  };

  // Update Score in App state
  const handleScoreUpdate = (newScore) => {
    setPlayer((prev) => (prev ? { ...prev, score: newScore } : prev));
  };

  // Save Progress to API / LocalStorage
  const handleSaveProgress = async (progressData = {}) => {
    const activeSession = apiService.getLocalSession();
    const activeToken = sessionToken || player?.token || activeSession?.token || "";
    let activePlayerId = player?.playerId || activeSession?.playerId || "";
    const activeName = player?.name || activeSession?.data?.name || "";
    const activeMobile = player?.mobile || activeSession?.data?.mobile || "";

    if (!activePlayerId || activePlayerId === "KRP-0000" || activePlayerId === "undefined") {
      activePlayerId = activeSession?.data?.playerId || "";
    }

    if (progressData.placedPieces) {
      setPlacedPiecesState((prev) => ({ ...prev, ...progressData.placedPieces }));
    }

    const payload = {
      ...progressData,
      playerId: activePlayerId,
      token: activeToken,
      name: activeName,
      mobile: activeMobile,
      score: progressData.score !== undefined ? progressData.score : (player?.score || 0),
      currentLevel: progressData.currentLevel || currentLevelNumber,
      lives: progressData.lives !== undefined ? progressData.lives : (player?.lives !== undefined ? player.lives : 3),
      completedLevels: progressData.completedLevels
        ? Array.from(new Set([...completedLevels, ...progressData.completedLevels]))
        : completedLevels,
      placedPieces: { ...placedPiecesState, ...(progressData.placedPieces || {}) },
      puzzleState: progressData.puzzleState || "in_progress",
    };

    const res = await apiService.saveProgress(payload);
    // If the server returns or resolves the true playerId, update in state
    if (res?.res?.playerId) {
      setPlayer((prev) => (prev ? { ...prev, playerId: res.res.playerId } : prev));
    }
  };

  // Handle Level Complete
  const handleLevelComplete = (nextLevelNumber, updatedScore) => {
    const completedNum = currentLevelNumber;
    const newCompleted = Array.from(new Set([...completedLevels, completedNum]));
    setCompletedLevels(newCompleted);

    // Update unlocked levels
    const newUnlocked = [1];
    if (newCompleted.includes(1)) newUnlocked.push(2);
    if (newCompleted.includes(2)) newUnlocked.push(3);
    setUnlockedLevels(newUnlocked);

    const scoreToSet = updatedScore !== undefined ? updatedScore : (player?.score || 0);
    if (player) {
      setPlayer((prev) => ({ ...prev, score: scoreToSet }));
    }

    // Persist level completion state to Google Sheets
    handleSaveProgress({
      currentLevel: nextLevelNumber || currentLevelNumber,
      score: scoreToSet,
      completedLevels: newCompleted,
      puzzleState: "completed",
    });

    // If completed all 3 levels, go to Victory Screen!
    if (completedNum === 3) {
      setCurrentScreen("victory");
    } else if (nextLevelNumber && nextLevelNumber <= 3) {
      setCurrentLevelNumber(nextLevelNumber);
      setCurrentScreen("game");
    } else {
      setCurrentScreen("dashboard");
    }
  };

  // Logout action
  const handleLogout = () => {
    sounds.playPick();
    apiService.clearSession();
    setPlayer(null);
    setSessionToken(null);
    setCompletedLevels([]);
    setUnlockedLevels([1]);
    setPlacedPiecesState({});
    setShowProfile(false);
    setCurrentScreen("register");
  };

  const currentLevelConfig = LEVELS.find((l) => l.levelNumber === currentLevelNumber) || LEVELS[0];

  return (
    <div className="app-root-container">
      {/* Notice Banner (if any) */}
      {systemNotice && (
        <div className="system-notice-banner">
          <span>{systemNotice}</span>
          <button
            onClick={() => setSystemNotice(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 800, marginLeft: 8 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading state while checking session */}
      {currentScreen === "loading" && (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#6B7F72" }}>
          <div className="spinner" style={{ width: 40, height: 40, borderColor: "#BFE3C0", borderTopColor: "#4A7A57" }} />
          <p style={{ fontWeight: 600 }}>Loading Kerala Piravi Challenge...</p>
        </div>
      )}

      {/* Registration Screen */}
      {currentScreen === "register" && (
        <RegistrationScreen
          onRegisterSuccess={handleRegisterSuccess}
          systemNotice={systemNotice}
        />
      )}

      {/* Dashboard Screen */}
      {currentScreen === "dashboard" && player && (
        <DashboardScreen
          player={player}
          levels={LEVELS}
          unlockedLevels={unlockedLevels}
          completedLevels={completedLevels}
          placedPiecesState={placedPiecesState}
          onSelectLevel={handleSelectLevel}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenProfile={() => setShowProfile(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Game Screen */}
      {currentScreen === "game" && player && (
        <GameScreen
          key={currentLevelConfig.id}
          player={player}
          level={currentLevelConfig}
          onLevelComplete={handleLevelComplete}
          onBackToDashboard={() => setCurrentScreen("dashboard")}
          onScoreUpdate={handleScoreUpdate}
          onSaveProgress={handleSaveProgress}
          savedPlacedPieces={placedPiecesState}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Grand Victory Screen */}
      {currentScreen === "victory" && player && (
        <VictoryScreen
          player={player}
          levels={LEVELS}
          onPlayAgain={() => {
            setCurrentLevelNumber(1);
            setCurrentScreen("game");
          }}
          onHome={() => setCurrentScreen("dashboard")}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          currentPlayerId={player ? player.playerId : null}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Profile Modal */}
      {showProfile && player && (
        <ProfileModal
          player={player}
          completedLevels={completedLevels}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
