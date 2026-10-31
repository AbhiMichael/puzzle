/**
 * Central API Configuration for Google Apps Script Web App
 * Target Google Spreadsheet: Single tab named "Players"
 * Spreadsheet ID: 13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w
 */

export const API_URL = "https://script.google.com/macros/s/AKfycbx2u2mEcf11V9D8q1p01vKufig4R-62gL2967DU8i_Na5_q7LooI8G3EUvPkFCtVPpsqA/exec";
export const SPREADSHEET_ID = "13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w";
export const SHEET_NAME = "Players";

// Local storage session & sync keys
export const STORAGE_KEYS = {
  PLAYER_ID: "kerala_puzzle_player_id",
  SESSION_TOKEN: "kerala_puzzle_session_token",
  PLAYER_DATA: "kerala_puzzle_player_data",
  LOCAL_PLAYERS: "kerala_puzzle_local_players",
  PENDING_SYNC: "kerala_puzzle_pending_sync",
  LAST_SYNC_STATUS: "kerala_puzzle_last_sync_status",
};

// Sync Status Types
export const SYNC_STATUS = {
  SYNCED: "Cloud Synced",
  SYNCING: "Syncing...",
  OFFLINE: "Offline",
  FAILED: "Sync Failed",
};
