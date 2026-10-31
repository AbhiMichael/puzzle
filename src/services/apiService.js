import { API_URL, STORAGE_KEYS, SYNC_STATUS } from "../config/api";

/**
 * Robust Google Sheets API Service for Kerala Piravi Jigsaw Puzzle
 * Connects directly to deployed Google Apps Script Web App.
 * Tracks live Cloud Sync status: Cloud Synced | Syncing | Offline | Sync Failed.
 */

// Helper to make POST request with text/plain (CORS compliant for Google Apps Script)
async function postToAppsScript(payload) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Apps Script Request Error]:", error);
    return {
      success: false,
      error: true,
      message: error.message || "Network request failed",
    };
  }
}

// Fallback ID generator when strictly offline
function generateLocalPlayerId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-4);
  return `KRP-${rand}${time}`;
}

function generateLocalToken(playerId) {
  return `local_tok_${playerId}_${Date.now()}`;
}

class ApiService {
  constructor() {
    this.pendingSavePayload = null;
    this.isSaving = false;
    this.hasQueuedSave = false;
    this.syncStatus = typeof navigator !== "undefined" && !navigator.onLine
      ? SYNC_STATUS.OFFLINE
      : SYNC_STATUS.SYNCED;
    this.syncSubscribers = new Set();

    // Listen to browser online/offline events for auto-resync
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("[Sync] Browser back online. Attempting pending sync...");
        this.flushPendingSync();
      });
      window.addEventListener("offline", () => {
        console.warn("[Sync] Browser went offline.");
        this.setSyncStatus(SYNC_STATUS.OFFLINE, "Network connection lost.");
      });
    }
  }

  // Subscribe to live sync status changes
  subscribeSyncStatus(callback) {
    this.syncSubscribers.add(callback);
    callback(this.syncStatus);
    return () => this.syncSubscribers.delete(callback);
  }

  setSyncStatus(status, details = "") {
    this.syncStatus = status;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_STATUS, status);
    } catch (e) {}
    this.syncSubscribers.forEach((cb) => {
      try {
        cb(status, details);
      } catch (err) {
        console.error("Error in sync subscriber:", err);
      }
    });
  }

  getSyncStatus() {
    return this.syncStatus;
  }

  // Get current session from localStorage (with auto-healing for undefined/null strings)
  getLocalSession() {
    try {
      const playerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
      const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
      const rawData = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
      let data = rawData ? JSON.parse(rawData) : null;

      const isValidId = playerId && playerId !== "undefined" && playerId !== "null" && playerId.trim() !== "";
      const isValidTok = token && token !== "undefined" && token !== "null" && token.trim() !== "";

      if (isValidId && isValidTok) {
        if (data) {
          if (!data.playerId) data.playerId = playerId;
          if (!data.token) data.token = token;
        }
        return { playerId, token, data };
      }

      // If data object has valid player info, auto-heal corrupted localStorage keys
      if (data && data.playerId && data.playerId !== "undefined" && data.token && data.token !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.PLAYER_ID, data.playerId);
        localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.token);
        return { playerId: data.playerId, token: data.token, data };
      }

      return null;
    } catch (e) {
      console.error("Error reading local session:", e);
      return null;
    }
  }

  // Set local session (guarantees non-empty and non-"undefined" strings)
  setLocalSession(playerId, token, data = {}) {
    try {
      const cleanId = (playerId && playerId !== "undefined" && playerId !== "null")
        ? String(playerId).trim()
        : (data?.playerId && data?.playerId !== "undefined" ? String(data.playerId).trim() : "");
      const cleanTok = (token && token !== "undefined" && token !== "null")
        ? String(token).trim()
        : (data?.token && data?.token !== "undefined" ? String(data.token).trim() : "");

      const enrichedData = {
        ...data,
        playerId: cleanId || data?.playerId || "",
        token: cleanTok || data?.token || "",
      };

      if (cleanId) localStorage.setItem(STORAGE_KEYS.PLAYER_ID, cleanId);
      if (cleanTok) localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, cleanTok);
      localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(enrichedData));
    } catch (e) {
      console.error("Error saving local session:", e);
    }
  }

  // Clear local session (logout)
  clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
      localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
      localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
      this.setSyncStatus(SYNC_STATUS.SYNCED);
    } catch (e) {
      console.error("Error clearing local session:", e);
    }
  }

  /**
   * Register a new player with Google Sheets backend
   * @param {string} name - Player name
   * @param {string} mobile - 10-digit Indian mobile number
   */
  async register(name, mobile) {
    const trimmedName = (name || "").trim();
    const cleanMobile = (mobile || "").replace(/\D/g, "");

    if (!trimmedName) {
      return { success: false, message: "Please enter your name." };
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return {
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).",
      };
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.setSyncStatus(SYNC_STATUS.OFFLINE, "Network offline");
      return {
        success: false,
        offline: true,
        message: "You appear to be offline. Please connect to the internet to register.",
      };
    }

    this.setSyncStatus(SYNC_STATUS.SYNCING, "Registering player in Google Sheets...");
    console.log(`[API] Registering player in Google Sheets: ${trimmedName} (${cleanMobile})`);

    const result = await postToAppsScript({
      action: "register",
      name: trimmedName,
      mobile: cleanMobile,
    });

    console.log("[API] Register response from Google Apps Script:", result);

    if (result && result.success) {
      const pid =
        result.playerId ||
        result.PlayerID ||
        result.player_id ||
        result.id ||
        result.data?.playerId ||
        result.data?.PlayerID ||
        result.data?.id ||
        result.player?.playerId ||
        result.player?.PlayerID ||
        result.player?.id ||
        generateLocalPlayerId();

      const tok =
        result.token ||
        result.Token ||
        result.sessionToken ||
        result.SessionToken ||
        result.data?.token ||
        result.data?.Token ||
        result.player?.token ||
        result.player?.Token ||
        generateLocalToken(pid);

      const playerData = {
        playerId: pid,
        token: tok,
        name: trimmedName,
        mobile: cleanMobile,
        score: Number(result.score ?? result.totalScore) || 0,
        currentLevel: Number(result.currentLevel) || 1,
        lives: Number(result.lives) || 3,
        completedLevels: result.completedLevels || [],
        registeredAt: new Date().toISOString(),
        isCloudSynced: true,
      };

      this.setLocalSession(pid, tok, playerData);
      this.setSyncStatus(SYNC_STATUS.SYNCED, "Registered and synced with Google Sheets");

      return {
        success: true,
        player: playerData,
        token: tok,
        isCloudSynced: true,
      };
    }

    // Handle duplicate mobile error from Google Sheets
    if (result && !result.success && result.isDuplicate) {
      this.setSyncStatus(SYNC_STATUS.SYNCED);
      return {
        success: false,
        isDuplicate: true,
        message: result.message || "This mobile number is already registered in Google Sheets!",
      };
    }

    // Backend returned an error or network failed
    const errorMsg = result && result.message ? result.message : "Registration failed. Google Apps Script unreachable.";
    this.setSyncStatus(SYNC_STATUS.FAILED, errorMsg);

    // Fallback: Store locally so player isn't completely blocked, but mark as Sync Failed!
    console.warn("[Backend Notice] Cloud registration failed. Storing local draft:", errorMsg);
    const fallbackPlayerId = generateLocalPlayerId();
    const fallbackToken = generateLocalToken(fallbackPlayerId);
    const fallbackData = {
      playerId: fallbackPlayerId,
      name: trimmedName,
      mobile: cleanMobile,
      score: 0,
      currentLevel: 1,
      lives: 3,
      completedLevels: [],
      placedPieces: {},
      registeredAt: new Date().toISOString(),
      isCloudSynced: false,
      syncError: errorMsg,
    };

    this.setLocalSession(fallbackPlayerId, fallbackToken, fallbackData);

    return {
      success: true,
      fallback: true,
      player: fallbackData,
      token: fallbackToken,
      notice: `Cloud registration pending: ${errorMsg}. Progress is preserved locally.`,
    };
  }

  /**
   * Restore player progress from Google Sheets
   */
  async getProgress(playerId, token) {
    if (!playerId || !token) {
      return { success: false, message: "Missing playerId or token." };
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.setSyncStatus(SYNC_STATUS.OFFLINE, "Network offline");
      const local = this.getLocalSession();
      if (local && local.data) {
        return { success: true, player: local.data, isLocal: true };
      }
      return { success: false, message: "Offline and no local data found." };
    }

    this.setSyncStatus(SYNC_STATUS.SYNCING, "Retrieving progress from Google Sheets...");
    console.log(`[API] Restoring progress from Google Sheets for ${playerId}...`);

    const result = await postToAppsScript({
      action: "getProgress",
      playerId,
      token,
    });

    console.log("[API] getProgress response from Google Apps Script:", result);

    if (result && result.success && (result.player || result.data)) {
      const p = result.player || result.data;
      const parsedCompleted = Array.isArray(p.completedLevels)
        ? p.completedLevels
        : typeof p.completedLevels === "string"
        ? JSON.parse(p.completedLevels || "[]")
        : [];

      const parsedPlaced = typeof p.placedPieces === "string"
        ? JSON.parse(p.placedPieces || "{}")
        : p.placedPieces || {};

      const playerObj = {
        playerId: p.playerId || playerId,
        token: token,
        name: p.name || "Kerala Player",
        mobile: p.mobile || "",
        currentLevel: Number(p.currentLevel) || 1,
        lives: Number(p.lives) || 3,
        score: Number(p.score ?? p.totalScore) || 0,
        completedLevels: parsedCompleted,
        placedPieces: parsedPlaced,
        puzzleState: p.puzzleState || "",
        isCloudSynced: true,
      };

      this.setLocalSession(playerId, token, playerObj);
      this.setSyncStatus(SYNC_STATUS.SYNCED, "Cloud Synced with Google Sheets");
      return { success: true, player: playerObj, isCloudSynced: true };
    }

    // Fallback: check local storage
    const localSession = this.getLocalSession();
    if (localSession && localSession.playerId === playerId && localSession.data) {
      console.log("[API] Restored progress from local storage fallback:", localSession.data);
      this.setSyncStatus(SYNC_STATUS.FAILED, "Loaded from local storage (Cloud sync failed)");
      return { success: true, player: localSession.data, fallback: true };
    }

    this.setSyncStatus(SYNC_STATUS.FAILED, result ? result.message : "Failed to load player session.");
    return {
      success: false,
      message: result ? result.message : "Failed to restore player session.",
    };
  }

  /**
   * Save player progress to Google Sheets (Guaranteed sequential queue)
   */
  async saveProgress(progressData = {}) {
    const session = this.getLocalSession();
    let effectivePlayerId =
      progressData.playerId ||
      session?.playerId ||
      session?.data?.playerId ||
      (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEYS.PLAYER_ID) : null);

    let effectiveToken =
      progressData.token ||
      session?.token ||
      session?.data?.token ||
      (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) : null);

    // If corrupted into literal string "undefined", heal it
    if (effectivePlayerId === "undefined" || effectivePlayerId === "null" || !effectivePlayerId) {
      effectivePlayerId = session?.data?.playerId || generateLocalPlayerId();
    }
    if (effectiveToken === "undefined" || effectiveToken === "null" || !effectiveToken) {
      effectiveToken = session?.data?.token || generateLocalToken(effectivePlayerId);
    }

    const effectiveName = progressData.name || session?.data?.name || "";
    const effectiveMobile = progressData.mobile || session?.data?.mobile || "";

    const payload = {
      ...progressData,
      playerId: effectivePlayerId,
      PlayerID: effectivePlayerId,
      token: effectiveToken,
      name: effectiveName,
      mobile: effectiveMobile,
      score: progressData.score !== undefined ? progressData.score : (session?.data?.score || 0),
      currentLevel: progressData.currentLevel || session?.data?.currentLevel || 1,
      lives: progressData.lives !== undefined ? progressData.lives : 3,
      completedLevels: progressData.completedLevels || session?.data?.completedLevels || [],
      placedPieces: progressData.placedPieces || session?.data?.placedPieces || {},
      puzzleState: progressData.puzzleState || "in_progress",
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately update localStorage for zero data loss
    try {
      const updated = {
        ...(session?.data || {}),
        ...payload,
        playerId: effectivePlayerId,
        token: effectiveToken,
      };
      this.setLocalSession(effectivePlayerId, effectiveToken, updated);
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(payload));
    } catch (e) {
      console.error("[API] Local save error:", e);
    }

    // Check offline state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.setSyncStatus(SYNC_STATUS.OFFLINE, "Offline (Saved locally)");
      return { success: false, offline: true, message: "Offline. Progress saved locally." };
    }

    // 2. Queue payload
    this.pendingSavePayload = payload;

    return this._dispatchSaveQueue();
  }

  async _dispatchSaveQueue() {
    if (this.isSaving) {
      this.hasQueuedSave = true;
      return { queued: true };
    }

    if (!this.pendingSavePayload) {
      return { success: true };
    }

    this.isSaving = true;
    this.hasQueuedSave = false;
    const currentPayload = this.pendingSavePayload;
    this.pendingSavePayload = null;

    this.setSyncStatus(SYNC_STATUS.SYNCING, "Syncing progress to Google Sheets...");

    try {
      console.log(`[API] Dispatching saveProgress to Google Sheets for ${currentPayload.playerId} (${currentPayload.name}, Score: ${currentPayload.score})...`);

      const res = await postToAppsScript({
        action: "saveProgress",
        playerId: currentPayload.playerId,
        PlayerID: currentPayload.playerId,
        token: currentPayload.token,
        name: currentPayload.name,
        mobile: currentPayload.mobile,
        currentLevel: currentPayload.currentLevel,
        lives: currentPayload.lives,
        score: currentPayload.score,
        totalScore: currentPayload.score,
        completedLevels: typeof currentPayload.completedLevels === "object"
          ? JSON.stringify(currentPayload.completedLevels)
          : currentPayload.completedLevels,
        placedPieces: typeof currentPayload.placedPieces === "object"
          ? JSON.stringify(currentPayload.placedPieces)
          : currentPayload.placedPieces,
        puzzleState: currentPayload.puzzleState || "in_progress",
      });

      console.log("[API] saveProgress response from Google Apps Script:", res);

      if (res && res.success) {
        try {
          localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
          const s = this.getLocalSession();
          if (s && s.data) {
            s.data.isCloudSynced = true;
            this.setLocalSession(s.playerId, s.token, s.data);
          }
        } catch (e) {}
        this.setSyncStatus(SYNC_STATUS.SYNCED, "Cloud Synced");
        return { success: true, res };
      } else {
        const errMsg = res && res.message ? res.message : "Sync failed. Progress saved locally.";
        console.error("[API] Google Apps Script saveProgress error:", errMsg);
        this.setSyncStatus(SYNC_STATUS.FAILED, errMsg);
        return { success: false, message: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || "Network error while saving progress.";
      console.error("[API] saveProgress network error:", err);
      this.setSyncStatus(SYNC_STATUS.FAILED, errMsg);
      return { success: false, message: errMsg };
    } finally {
      this.isSaving = false;
      // If another save came in while the request was in flight, process next
      if (this.hasQueuedSave || this.pendingSavePayload) {
        this._dispatchSaveQueue();
      }
    }
  }

  // Flush any pending unsaved progress when network reconnects or on manual retry
  async flushPendingSync() {
    try {
      const rawPending = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      if (rawPending) {
        const payload = JSON.parse(rawPending);
        console.log("[Sync] Flushing pending changes to Google Sheets:", payload);
        return await this.saveProgress(payload);
      }
      const session = this.getLocalSession();
      if (session?.data) {
        console.log("[Sync] Flushing session data to Google Sheets:", session.data);
        return await this.saveProgress(session.data);
      }
    } catch (e) {
      console.error("Error flushing pending sync:", e);
    }
  }

  /**
   * Fetch Leaderboard from Google Sheets
   */
  async getLeaderboard() {
    console.log("[API] Fetching leaderboard from Google Sheets...");
    const result = await postToAppsScript({
      action: "getLeaderboard",
    });

    console.log("[API] getLeaderboard response:", result);

    const list = (result && result.success && (Array.isArray(result.data) ? result.data : Array.isArray(result.leaderboard) ? result.leaderboard : null));

    if (list) {
      return {
        success: true,
        leaderboard: list.map((item, idx) => ({
          rank: item.rank || idx + 1,
          name: item.name || "Player",
          score: Number(item.totalScore ?? item.score) || 0,
          completedLevels: item.completedLevels || [],
          playerId: item.playerId || "",
        })),
        isCloudSynced: true,
      };
    }

    // If backend failed, return error and local data fallback
    return {
      success: false,
      leaderboard: [],
      message: result ? result.message : "Failed to load leaderboard from Google Sheets.",
    };
  }
}

export const apiService = new ApiService();
