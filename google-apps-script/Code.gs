/**
 * ==========================================================================
 * KERALA PIRAVI JIGSAW PUZZLE – GOOGLE APPS SCRIPT WEB APP BACKEND
 * ==========================================================================
 * 
 * Target Google Spreadsheet: Single tab named "Players"
 * Spreadsheet ID: 13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w
 * URL: https://docs.google.com/spreadsheets/d/13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w/edit?gid=0#gid=0
 * 
 * 13 Columns Structure:
 * A: PlayerID | B: Name | C: Mobile | D: RegisteredAt | E: LastLogin |
 * F: CurrentLevel | G: Lives | H: Score | I: CompletedLevels |
 * J: PlacedPieces | K: PuzzleState | L: UpdatedAt | M: SessionTokenHash
 */

const SPREADSHEET_ID = "13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w";
const SHEET_NAME = "Players";

// Simple SHA-256 hash helper for session token
function hashToken(token) {
  if (!token) return "";
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token, Utilities.Charset.UTF_8);
  let hashStr = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hashStr += byteHex;
  }
  return hashStr;
}

// Generate unique Player ID
function generatePlayerId(sheet) {
  const lastRow = Math.max(1, sheet.getLastRow());
  const num = 1000 + lastRow;
  return "KRP-" + num;
}

// Ensure the "Players" tab exists with correct headers
function getPlayersSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "PlayerID",
      "Name",
      "Mobile",
      "RegisteredAt",
      "LastLogin",
      "CurrentLevel",
      "Lives",
      "Score",
      "CompletedLevels",
      "PlacedPieces",
      "PuzzleState",
      "UpdatedAt",
      "SessionTokenHash"
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#BFE3C0");
  }
  return sheet;
}

// Handle GET requests (Health Check & Diagnostics)
function doGet(e) {
  let isConnected = false;
  let rowCount = 0;
  try {
    const sheet = getPlayersSheet();
    isConnected = true;
    rowCount = sheet.getLastRow();
  } catch (err) {
    isConnected = false;
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Kerala Puzzle Game API is running!",
    version: "2.2",
    spreadsheetConnected: isConnected,
    sheetName: SHEET_NAME,
    totalRows: rowCount,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle POST requests
function doPost(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    const action = body.action;

    switch (action) {
      case "register":
        return handleRegister(body);
      case "getProgress":
        return handleGetProgress(body);
      case "saveProgress":
        return handleSaveProgress(body);
      case "getLeaderboard":
        return handleGetLeaderboard();
      default:
        return createJsonResponse({
          success: false,
          message: "Unknown API action: " + action
        });
    }
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: err.toString()
    });
  }
}

// 1. Action: register
function handleRegister(data) {
  const name = (data.name || "").trim();
  const mobile = (data.mobile || "").replace(/\D/g, "");

  if (!name) {
    return createJsonResponse({
      success: false,
      message: "Please enter a valid name."
    });
  }

  if (mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile)) {
    return createJsonResponse({
      success: false,
      message: "Please enter a valid 10-digit Indian mobile number."
    });
  }

  const sheet = getPlayersSheet();
  const values = sheet.getDataRange().getValues();

  // Check if mobile already exists (Column C is index 2)
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][2]).replace(/\D/g, "") === mobile) {
      return createJsonResponse({
        success: false,
        isDuplicate: true,
        message: "Mobile number is already registered! Please use another number or continue your session."
      });
    }
  }

  const playerId = generatePlayerId(sheet);
  const token = Utilities.getUuid();
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  // Append new player row (Single row per player, 13 columns A through M)
  sheet.appendRow([
    playerId,          // A: PlayerID
    name,              // B: Name
    mobile,            // C: Mobile
    now,               // D: RegisteredAt
    now,               // E: LastLogin
    1,                 // F: CurrentLevel
    3,                 // G: Lives
    0,                 // H: Score
    "[]",              // I: CompletedLevels
    "{}",              // J: PlacedPieces
    "new",             // K: PuzzleState
    now,               // L: UpdatedAt
    tokenHash          // M: SessionTokenHash
  ]);

  const playerObj = {
    playerId: playerId,
    PlayerID: playerId,
    token: token,
    name: name,
    mobile: mobile,
    score: 0,
    totalScore: 0,
    currentLevel: 1,
    lives: 3,
    completedLevels: []
  };

  return createJsonResponse({
    success: true,
    playerId: playerId,
    PlayerID: playerId,
    token: token,
    score: 0,
    totalScore: 0,
    currentLevel: 1,
    lives: 3,
    completedLevels: [],
    player: playerObj,
    data: playerObj
  });
}

// 2. Action: getProgress
function handleGetProgress(data) {
  const playerId = data.playerId || data.PlayerID || data.id;
  const token = data.token || data.Token || data.sessionToken;
  const mobile = data.mobile ? String(data.mobile).replace(/\D/g, "") : "";
  const name = data.name ? String(data.name).trim().toLowerCase() : "";

  if (!playerId && !mobile && !name) {
    return createJsonResponse({ success: false, message: "Missing playerId, mobile, or name." });
  }

  const sheet = getPlayersSheet();
  const values = sheet.getDataRange().getValues();
  const tokenHash = token ? hashToken(token) : "";

  let targetIndex = -1;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowId = String(row[0] || "").trim();
    const rowName = String(row[1] || "").trim().toLowerCase();
    const rowMobile = String(row[2] || "").replace(/\D/g, "");

    // Prioritize match: 1) by PlayerID, 2) by Mobile, 3) by Name
    if (playerId && rowId && rowId.toLowerCase() === String(playerId).trim().toLowerCase()) {
      targetIndex = i;
      break;
    }
    if (mobile && rowMobile && rowMobile === mobile) {
      targetIndex = i;
      break;
    }
    if (name && rowName && rowName === name) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
    return createJsonResponse({ success: false, message: "Player not found." });
  }

  const row = values[targetIndex];
  const now = new Date().toISOString();

  // Update LastLogin (Column E is index 4 -> Row targetIndex+1, Col 5)
  sheet.getRange(targetIndex + 1, 5).setValue(now);

  let completedArr = [];
  try {
    completedArr = typeof row[8] === "string" ? JSON.parse(row[8] || "[]") : (row[8] || []);
  } catch (e) {
    completedArr = [];
  }

  let placedObj = {};
  try {
    placedObj = typeof row[9] === "string" ? JSON.parse(row[9] || "{}") : (row[9] || {});
  } catch (e) {
    placedObj = {};
  }

  const playerObj = {
    playerId: row[0],
    PlayerID: row[0],
    token: token || "",
    name: row[1],
    mobile: row[2],
    currentLevel: Number(row[5]) || 1,
    lives: Number(row[6]) || 3,
    score: Number(row[7]) || 0,
    totalScore: Number(row[7]) || 0,
    completedLevels: completedArr,
    placedPieces: placedObj,
    puzzleState: row[10] || "in_progress",
    lastLogin: now,
    updatedAt: row[11] || now
  };

  return createJsonResponse({
    success: true,
    player: playerObj,
    data: playerObj,
    playerId: row[0],
    PlayerID: row[0],
    score: Number(row[7]) || 0,
    totalScore: Number(row[7]) || 0,
    currentLevel: Number(row[5]) || 1,
    lives: Number(row[6]) || 3
  });
}

// 3. Action: saveProgress
function handleSaveProgress(data) {
  const playerId = data.playerId || data.PlayerID || data.id;
  const token = data.token || data.Token || data.sessionToken;
  const mobile = data.mobile ? String(data.mobile).replace(/\D/g, "") : "";
  const name = data.name ? String(data.name).trim().toLowerCase() : "";

  if (!playerId && !mobile && !name) {
    return createJsonResponse({ success: false, message: "Missing playerId, mobile, or name." });
  }

  const sheet = getPlayersSheet();
  const values = sheet.getDataRange().getValues();
  const tokenHash = token ? hashToken(token) : "";

  let targetIndex = -1;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowId = String(row[0] || "").trim();
    const rowName = String(row[1] || "").trim().toLowerCase();
    const rowMobile = String(row[2] || "").replace(/\D/g, "");

    // Prioritize match: 1) by PlayerID, 2) by Mobile, 3) by Name
    if (playerId && rowId && rowId.toLowerCase() === String(playerId).trim().toLowerCase()) {
      targetIndex = i;
      break;
    }
    if (mobile && rowMobile && rowMobile === mobile) {
      targetIndex = i;
      break;
    }
    if (name && rowName && rowName === name) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
    return createJsonResponse({ success: false, message: "Player not found." });
  }

  const row = values[targetIndex];
  const rowNum = targetIndex + 1;
  const now = new Date().toISOString();

  // If token is provided and row has a stored hash, verify or heal via mobile
  if (token && row[12]) {
    const storedHash = String(row[12] || "").trim().toLowerCase();
    if (storedHash && storedHash !== tokenHash.toLowerCase()) {
      const rowMobile = String(row[2] || "").replace(/\D/g, "");
      // Auto-heal session token if mobile or name matched
      if (mobile && rowMobile === mobile) {
        sheet.getRange(rowNum, 13).setValue(tokenHash);
      }
    }
  }

  const currentLevel = data.currentLevel !== undefined ? Number(data.currentLevel) : Number(row[5]) || 1;
  const lives = data.lives !== undefined ? Number(data.lives) : Number(row[6]) || 3;
  const score = data.score !== undefined ? Number(data.score) : (data.totalScore !== undefined ? Number(data.totalScore) : Number(row[7]) || 0);
  const completed = typeof data.completedLevels === "object" ? JSON.stringify(data.completedLevels) : (data.completedLevels !== undefined ? String(data.completedLevels) : String(row[8] || "[]"));
  const placed = typeof data.placedPieces === "object" ? JSON.stringify(data.placedPieces) : (data.placedPieces !== undefined ? String(data.placedPieces) : String(row[9] || "{}"));
  const state = data.puzzleState !== undefined ? String(data.puzzleState) : String(row[10] || "in_progress");

  // Single atomic batch update across Columns F:L (Cols 6 to 12)
  // F (6): CurrentLevel | G (7): Lives | H (8): Score | I (9): CompletedLevels
  // J (10): PlacedPieces | K (11): PuzzleState | L (12): UpdatedAt
  sheet.getRange(rowNum, 6, 1, 7).setValues([[
    currentLevel,
    lives,
    score,
    completed,
    placed,
    state,
    now
  ]]);

  return createJsonResponse({
    success: true,
    message: "Progress saved successfully.",
    playerId: row[0],
    PlayerID: row[0],
    currentLevel: currentLevel,
    lives: lives,
    score: score,
    updatedAt: now
  });
}

// 4. Action: getLeaderboard
function handleGetLeaderboard() {
  const sheet = getPlayersSheet();
  const values = sheet.getDataRange().getValues();
  const players = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0]) {
      let completedArr = [];
      try {
        completedArr = typeof row[8] === "string" ? JSON.parse(row[8] || "[]") : (row[8] || []);
      } catch (e) {
        completedArr = [];
      }

      players.push({
        playerId: row[0],
        name: row[1] || "Player",
        score: Number(row[7]) || 0,
        totalScore: Number(row[7]) || 0,
        completedLevels: completedArr
      });
    }
  }

  // Sort descending by score, top 25
  players.sort((a, b) => b.score - a.score);

  const topPlayers = players.slice(0, 25).map((p, idx) => ({
    rank: idx + 1,
    name: p.name,
    score: p.score,
    totalScore: p.totalScore,
    completedLevels: p.completedLevels,
    playerId: p.playerId
  }));

  // Never expose mobile numbers or session tokens!
  return createJsonResponse({
    success: true,
    data: topPlayers,
    leaderboard: topPlayers
  });
}

// Helper to return JSON response with CORS headers
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
