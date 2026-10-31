# GOOGLE SHEETS & APPS SCRIPT SETUP GUIDE — FINAL CONFIGURATION

**Project:** Kerala Piravi Jigsaw Puzzle Challenge  
**Target Spreadsheet:** Single Tab named `Players`  
**Spreadsheet URL:** `https://docs.google.com/spreadsheets/d/13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w/edit?gid=0#gid=0`  
**Spreadsheet ID:** `13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w`  
**Deployed Web App Endpoint:**  
`https://script.google.com/macros/s/AKfycbx2u2mEcf11V9D8q1p01vKufig4R-62gL2967DU8i_Na5_q7LooI8G3EUvPkFCtVPpsqA/exec`

---

## 1. Single Spreadsheet Tab Configuration

The application uses **only one tab** named `Players`. Do not create multiple tabs or spreadsheets.

### Required Header Row (Row 1, Columns A to M):

| Column | Header Name | Type | Description |
|:---:|:---|:---|:---|
| **A** | `PlayerID` | String | Unique player identifier (e.g., `KRP-1002`) |
| **B** | `Name` | String | Player full name (from registration) |
| **C** | `Mobile` | String | 10-digit Indian mobile number (unique index) |
| **D** | `RegisteredAt` | ISO String | Initial registration timestamp |
| **E** | `LastLogin` | ISO String | Last active / session restoration timestamp |
| **F** | `CurrentLevel` | Integer | Active level number (1, 2, or 3) |
| **G** | `Lives` | Integer | Remaining lives in the current level (0 - 3) |
| **H** | `Score` | Integer | Total accumulated score |
| **I** | `CompletedLevels` | JSON Array | Array of completed level numbers (e.g., `[1, 2]`) |
| **J** | `PlacedPieces` | JSON Object | Object mapping level numbers to placed piece IDs |
| **K** | `PuzzleState` | String | Game state (`new`, `in_progress`, `completed`, `restarted`) |
| **L** | `UpdatedAt` | ISO String | Last progress save timestamp |
| **M** | `SessionTokenHash` | String | SHA-256 hash of the browser session token |

--- 




## 2. Google Apps Script Source Code & Deployment

The complete Apps Script code is maintained in the project repository at:
`google-apps-script/Code.gs`

### Configuration Constants in `Code.gs`:
```javascript
const SPREADSHEET_ID = "13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w";
const SHEET_NAME = "Players";
```

### Steps to Deploy or Update in Google Apps Script Editor:
1. Open your Google Spreadsheet:
   `https://docs.google.com/spreadsheets/d/13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w/edit?gid=0#gid=0`
2. In the top menu, select **Extensions** > **Apps Script**.
3. Replace the entire code in `Code.gs` with the updated code from `google-apps-script/Code.gs`.
4. Click the **Save** icon (diskette).
5. Deploy as a new version:
   - Click **Deploy** > **Manage deployments** (top right).
   - Click the **pencil icon (Edit)** on your active Web App deployment.
   - Set **Version** to **New version**.
   - Ensure **Execute as:** `Me (your Google account)`.
   - Ensure **Who has access:** `Anyone`.
   - Click **Deploy**.
6. The deployment URL remains:
   `https://script.google.com/macros/s/AKfycbx2u2mEcf11V9D8q1p01vKufig4R-62gL2967DU8i_Na5_q7LooI8G3EUvPkFCtVPpsqA/exec`

---

## 3. Web App API Actions Description

All requests are dispatched via HTTP `POST` with `Content-Type: text/plain;charset=utf-8` to ensure direct browser compatibility without CORS preflight redirects.

### Action 1: `register`
Creates a new player row if the mobile number is not already registered.
- **Request Body:**
  ```json
  {
    "action": "register",
    "name": "Player Name",
    "mobile": "9876543210"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "playerId": "KRP-1002",
    "token": "79b37c05-...",
    "score": 0,
    "currentLevel": 1,
    "lives": 3,
    "completedLevels": []
  }
  ```
- **Duplicate Mobile Response:**
  ```json
  {
    "success": false,
    "isDuplicate": true,
    "message": "Mobile number is already registered! Please use another number or continue your session."
  }
  ```

---

### Action 2: `getProgress`
Restores saved progress for an existing session token.
- **Request Body:**
  ```json
  {
    "action": "getProgress",
    "playerId": "KRP-1002",
    "token": "79b37c05-..."
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "player": {
      "playerId": "KRP-1002",
      "name": "Player Name",
      "mobile": "9876543210",
      "currentLevel": 2,
      "lives": 3,
      "score": 190,
      "completedLevels": [1],
      "placedPieces": "{\"1\":[\"lvl1_p_0_0\", ...]}",
      "puzzleState": "in_progress"
    }
  }
  ```

---

### Action 3: `saveProgress`
Updates the player's existing row in place (never appends duplicate rows).
- **Request Body:**
  ```json
  {
    "action": "saveProgress",
    "playerId": "KRP-1002",
    "token": "79b37c05-...",
    "currentLevel": 2,
    "lives": 2,
    "score": 200,
    "completedLevels": "[1]",
    "placedPieces": "{\"2\":[\"lvl2_p_0_1\"]}",
    "puzzleState": "in_progress"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Progress saved successfully.",
    "updatedAt": "2026-10-31T06:15:00.000Z"
  }
  ```

---

### Action 4: `getLeaderboard`
Retrieves top 25 players sorted by score descending. Never exposes mobile numbers or session tokens.
- **Request Body:**
  ```json
  {
    "action": "getLeaderboard"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "data": [
      { "rank": 1, "name": "jibilu", "totalScore": 0, "completedLevels": [] }
    ]
  }
  ```

---

## 4. Live Cloud Sync Statuses in Frontend

The frontend interface reflects the true state of Google Sheets connectivity:
- **Cloud Synced** (Green Pill): Confirmed HTTP 200 `success: true` response from Google Apps Script.
- **Syncing...** (Blue Pill with spinner): Request in progress.
- **Offline (Saved Locally)** (Grey Pill): Device has lost internet connection. Progress is safely queued in `localStorage` and will auto-flush upon reconnecting.
- **Sync Failed (Saved Locally)** (Amber/Red Pill): Remote Google server error. Progress is preserved locally and never discarded.
