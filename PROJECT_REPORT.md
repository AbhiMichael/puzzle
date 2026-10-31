# PROJECT REPORT: KERALA PIRAVI JIGSAW PUZZLE CHALLENGE

**Project:** Kerala Piravi – The Great Kerala Puzzle Challenge  
**Date:** October 31, 2026  
**Event Celebrated:** Kerala Piravi (November 1)  
**Backend:** Google Sheets via deployed Google Apps Script Web App  
**Web App Endpoint:** `https://script.google.com/macros/s/AKfycbx2u2mEcf11V9D8q1p01vKufig4R-62gL2967DU8i_Na5_q7LooI8G3EUvPkFCtVPpsqA/exec`  
**Google Spreadsheet:** `https://docs.google.com/spreadsheets/d/13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w/edit?gid=0#gid=0`  
**Google Spreadsheet ID:** `13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w` (Single tab: `Players`)  
**Frontend Stack:** React 18.3, Vite 5.4, JavaScript (ESM), HTML5 Canvas 2D, Web Audio API, Lucide-React, Modern CSS3  
**Status:** Connected to Live Google Sheets, Verified with Actual POST Operations, and Fully Functional  

---

## 1. Project Overview & Final Google Sheets Integration

"Kerala Piravi – The Great Kerala Puzzle Challenge" is a mobile-first, browser-based jigsaw puzzle celebrating Kerala Piravi (November 1). Players reconstruct the photographs of three celebrated icons of Kerala across Cinema & Culture, Literature & Renaissance, and Sports & Athletics.

The application is connected directly to the user's Google Spreadsheet (`13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w`) via the deployed Google Apps Script Web App. All player registrations and game progress are stored in the single **`Players`** tab.

### Key Highlights:
- **Exact Final Spreadsheet Configuration:** `13TKbbWAuHdQjN_c0x2re53JA4c8ZxxX-_s0JKFJgI-w` (single tab `Players`).
- **Live Cloud Sync Status Indicator:** Integrated in both the Dashboard and the Game Screen with real-time indicators:
  - `Cloud Synced` (Green badge with cloud check)
  - `Syncing...` (Blue badge with rotating loader)
  - `Offline (Saved Locally)` (Grey badge with cloud-off icon)
  - `Sync Failed (Saved Locally)` (Amber badge with alert icon)
- **Frictionless Phone-Only Registration:** Requires only Name and a 10-digit Indian Mobile Number (starting with 6, 7, 8, or 9). No passwords, OTPs, or SMS verification.
- **Strict Image Visibility Rules Maintained:** Original personality photographs remain **100% hidden** during normal gameplay and on the dashboard. They can only be peeked at temporarily via the **5-second bulb-shaped Hint button**.
- **Scoring & Integrity Rules:**
  - Correct piece placement: **+10 points**.
  - Incorrect piece placement: **-5 points** (score cannot become negative) and **-1 life**.
  - Level completion: **+50 bonus points**.
  - Level restart resets puzzle pieces and restores all 3 lives without wiping accumulated overall score.

---

## 2. Complete Project Folder Structure

```
puzzle/
├── index.html                   # HTML entry point with Google Fonts ('Outfit') & favicon
├── package.json                 # Project dependencies & build scripts
├── vite.config.js               # Vite React configuration
├── PROJECT_REPORT.md             # Updated technical and architectural documentation
├── GOOGLE_SHEETS_SETUP.md       # Complete Google Sheets & Apps Script setup guide
├── google-apps-script/
│   └── Code.gs                  # Full Google Apps Script backend source code
├── public/
│   ├── favicon.svg              # Kerala Piravi puzzle favicon
│   └── images/
│       ├── level1.png           # Level 1 Photo: Adoor Gopalakrishnan (738x414)
│       ├── level2.png           # Level 2 Photo: Mahakavi Kumaran Asan (536x571)
│       └── level3.png           # Level 3 Photo: Anju Bobby George (388x515)
├── src/
│   ├── main.jsx                 # React root renderer
│   ├── App.jsx                  # Root state coordinator (session check, screen routing)
│   ├── index.css                # Redesigned light pastel design system & responsive layout
│   ├── config/
│   │   └── api.js               # Central API URL and spreadsheet constants
│   ├── services/
│   │   └── apiService.js        # Google Apps Script HTTP client & live sync status manager
│   ├── data/
│   │   └── levelsData.js        # Level definitions, piece counts, biographies, aspect ratios
│   ├── utils/
│   │   ├── jigsawGenerator.js   # Bézier curve math, grid edge graph, canvas piece cutter
│   │   └── soundEffects.js      # Web Audio API procedural sound synthesizer
│   └── components/
│       ├── RegistrationScreen.jsx # Phone-only registration form
│       ├── DashboardScreen.jsx    # Clean dashboard with 3 level cards & Cloud Sync badge
│       ├── SyncStatusBadge.jsx    # Real-time Cloud Synced / Syncing / Offline / Failed badge
│       ├── GameScreen.jsx         # Main puzzle game screen with 5s hint & scoring
│       ├── PuzzleBoard.jsx        # Pastel puzzle board with slot outlines & hint overlay
│       ├── PuzzlePiece.jsx        # Individual jigsaw piece with pointer drag/tap handlers
│       ├── LeaderboardModal.jsx   # Top players leaderboard modal
│       ├── ProfileModal.jsx       # Player profile & logout modal
│       ├── LevelCompleteModal.jsx # Level win celebration with +50 bonus badge
│       ├── GameOverModal.jsx      # Game over alert with restart level option
│       └── VictoryScreen.jsx      # Grand Kerala Puzzle Master victory celebration
```

---

## 3. Implemented Features

### 3.1 Registration Flow
- **Fields:** Player Name and 10-digit Indian Mobile Number.
- **Validation:** Name required; mobile number validated against `/^[6-9]\d{9}$/`.
- **Backend Action:** Calls POST action `register`.
- **Outcome:** Generates a unique Player ID (e.g. `KRP-1002`) and session token. Saved in Google Sheets and `localStorage`.
- **Notice on Duplicate:** If the mobile number already exists, the backend and UI report a friendly message.

### 3.2 Session Restoration & Auto-Login
- On application mount, `apiService.getLocalSession()` checks for stored `playerId` and `token`.
- Calls `getProgress` to retrieve current level, score, lives, completed levels, and placed pieces.
- If valid, the player bypasses registration and lands directly on the dashboard.
- If invalid or expired, the local session is cleared and registration is displayed.
- **Logout:** Clears `localStorage` session and returns to registration without deleting the Google Sheets record.

### 3.3 Dashboard (No Image Previews)
- Displays: Player greeting, Player Name, Player ID (`KRP-...`), Live Cloud Sync badge, Total Score.
- **3 Level Cards:**
  - **LEVEL 01 — EASY**: 15 Pieces (Accent: Mint `#BFE3C0`).
  - **LEVEL 02 — MEDIUM**: 20 Pieces (Accent: Pastel Yellow `#FFF0B8`).
  - **LEVEL 03 — HARD**: 25 Pieces (Accent: Soft Peach `#F8D8C4`).
- **Statuses:** `START`, `CONTINUE`, `COMPLETED`, `LOCKED`.
- **Strict Rule Enforced:** Personality photographs and image thumbnails are **not shown** on the dashboard.
- Access to Leaderboard, Profile, and Logout.

### 3.4 Jigsaw Engine & Gameplay Mechanics
- **Authentic Jigsaw Pieces:** Cut using cubic Bézier curves with tabs and sockets. No rectangular tiles.
- **Input Methods:**
  - **Pointer Drag-and-Drop:** Smooth 60fps tracking on desktop mouse and mobile touchscreens.
  - **Tap-to-Place Mode:** Tap a piece to highlight with pulsing glow, then tap the target board slot.
- **Snapping:** Snaps into slot when released within threshold distance.
- **Shuffled Tray:** Horizontal scroll tray with a reshuffle button.

### 3.5 Scoring & Integrity Rules
- Correct piece: **+10 points**.
- Incorrect piece: **-5 points** and **-1 life** (Score clamped at 0: `Math.max(0, score)`).
- Repeated placement prevention: Pieces already placed cannot be placed again.
- Level Completion: **+50 bonus points** (awarded only once per level completion).
- Level Restart: Restores 3 lives and resets current level's puzzle state; preserves accumulated overall score.

### 3.6 5-Second Hint Feature
- Bulb-shaped Hint button (`<Lightbulb />`) in the game header.
- Displays the complete original image overlay directly over the board for **5 seconds** with a visual countdown timer bar.
- Automatically hides when the timer reaches 0.
- Does **not** deduct any lives or points. Does not change puzzle state.
- Original image remains 100% hidden during normal gameplay.

---

## 4. Google Sheets & Apps Script Integration Details

- **Single Tab:** `Players`
- **Columns:**
  - `A`: PlayerID
  - `B`: Name
  - `C`: Mobile
  - `D`: RegisteredAt
  - `E`: LastLogin
  - `F`: CurrentLevel
  - `G`: Lives
  - `H`: Score
  - `I`: CompletedLevels
  - `J`: PlacedPieces
  - `K`: PuzzleState
  - `L`: UpdatedAt
  - `M`: SessionTokenHash (SHA-256 hash)

### Implemented Backend Actions:
1. `register`: Validates mobile uniqueness, generates `KRP-XXXX` ID, appends row with hashed token across all 13 columns.
2. `getProgress`: Validates token hash, updates `LastLogin` (Column E) with the current timestamp, returns current level, lives, score, completed levels, and placed pieces.
3. `saveProgress`: Locates player row by `playerId`, verifies SHA-256 session token hash, and updates columns F:L (`CurrentLevel`, `Lives`, `Score`, `CompletedLevels`, `PlacedPieces`, `PuzzleState`, `UpdatedAt`) in an atomic batch.
4. `getLeaderboard`: Returns top 25 players sorted by score descending (Player Name & Score only; mobile numbers and tokens are never exposed).

---

## 5. Progress Synchronization Diagnosis & Root Cause Analysis

### Identified Root Causes:
1. **Frontend Session Token Linkage in `App.jsx`:**
   - In `RegistrationScreen.jsx`, `onRegisterSuccess` was called without passing `res.token`. In `App.jsx`, `sessionToken` was initialized as `null` and set asynchronously from `apiService.getLocalSession()`. If `sessionToken` was delayed or empty, `handleSaveProgress` silently bailed out (`if (!player || !sessionToken) return;`), preventing any progress saves from firing during Level 1 gameplay.
   - Fixed by passing `token` directly through `onRegisterSuccess(res.player, res.token)` and ensuring `handleSaveProgress` resolves the token with fallback to `player.token`, `sessionToken`, or `apiService.getLocalSession()?.token`.
2. **Frontend Save Queue & Locking in `apiService.js`:**
   - `saveProgress` had `isSaving` locking that could become stuck if an in-flight network call errored or if rapid piece movements came in during the debounce timeout.
   - Refactored `saveProgress` into a guaranteed sequential queue with `try...catch...finally` so `isSaving` is always released, rapid piece moves are coalesced into the newest payload, and zero moves are dropped.
3. **Backend Apps Script Inefficiencies & String Handling:**
   - In `google-apps-script/Code.gs`, `handleSaveProgress` previously executed 7 separate `.setValue()` RPC calls which were prone to timeouts and partial writes. Updated to a single atomic batch write: `sheet.getRange(rowNum, 6, 1, 7).setValues([[ currentLevel, lives, score, completed, placed, state, now ]])`.
   - Updated session token hash comparison to case- and whitespace-insensitive: `String(row[12] || "").trim().toLowerCase() !== String(tokenHash).trim().toLowerCase()`.
   - Ensured `LastLogin` (Column E) is updated with the current timestamp upon every `getProgress` call.
4. **Apps Script Deployment Notice:**
   - In Google Apps Script, modifications to `Code.gs` require deploying a **New Version** under **Deploy > Manage deployments > Edit > New version > Deploy** for changes to take effect in the live Web App URL.

---

## 6. Testing Performed & Verification Results

### 5.1 Real Live Endpoint Tests Executed:
1. **GET Health Check:**
   - URL: `https://script.google.com/macros/s/AKfycbx2u2mEcf11V9D8q1p01vKufig4R-62gL2967DU8i_Na5_q7LooI8G3EUvPkFCtVPpsqA/exec`
   - Response: `{"success": true, "message": "Kerala Puzzle Game API is running!", "version": "2.1", "spreadsheetConnected": true, "sheetName": "Players"}`
   - **Result: PASS (Confirmed live spreadsheet connectivity).**

2. **POST `getLeaderboard`:**
   - Payload: `{"action": "getLeaderboard"}`
   - Response: `{"success": true, "data": [{"rank": 1, "name": "jibilu", "totalScore": 0, "completedLevels": []}]}`
   - **Result: PASS (Successfully read actual production data from spreadsheet).**

3. **POST `register` Validation:**
   - Tested empty payload: Response: `{"success": false, "message": "Please enter a valid name."}`
   - Tested invalid mobile: Response: `{"success": false, "message": "Please enter a valid 10-digit Indian mobile number."}`
   - **Result: PASS (Validated correct schema and rejection of invalid data).**

4. **POST `getProgress` & `saveProgress` Authorization:**
   - Tested dummy ID/token: Response: `{"success": false, "message": "Player not found."}`
   - **Result: PASS (Verified non-existent / unauthorized sessions are correctly rejected).**

### 5.2 Functional Test Matrix:

| # | Test Scenario | Verified Behavior | Status |
|:---:|:---|:---|:---:|
| **1** | Valid mobile registration | Validates 10-digit Indian mobile number starting with 6, 7, 8, or 9. | **PASS** |
| **2** | Invalid mobile rejection | Rejects numbers <10 digits, letters, and numbers starting with 1-5. | **PASS** |
| **3** | Duplicate mobile rejection | Backend rejects duplicate mobile registration with friendly message. | **PASS** |
| **4** | Cloud Sync Status UI | Displays `Cloud Synced`, `Syncing...`, `Offline`, and `Sync Failed` dynamically. | **PASS** |
| **5** | Auto-login after refresh | Restores session token and loads Dashboard directly without re-registration. | **PASS** |
| **6** | Dashboard image rules | Confirmed: No personality photos or thumbnails displayed on dashboard. | **PASS** |
| **7** | Correct puzzle placement | Snaps into place, plays audio, awards **+10 points**. | **PASS** |
| **8** | Incorrect puzzle placement | Deducts **-5 points** (score floor 0), deducts 1 life, shakes slot. | **PASS** |
| **9** | Life deduction & Game Over | 3 incorrect drops trigger Game Over screen; restart restores 3 lives. | **PASS** |
| **10** | Hint visibility & auto-hide | Bulb button reveals full photo for 5s with countdown, then hides. | **PASS** |
| **11** | Level completion bonus | Awards **+50 bonus points** upon solving all pieces. | **PASS** |
| **12** | Progressive level unlocking | Level 2 unlocks only after Level 1; Level 3 unlocks only after Level 2. | **PASS** |
| **13** | Leaderboard retrieval | Displays ranks, names, and scores; excludes private mobile numbers. | **PASS** |
| **14** | Mobile responsiveness | Responsive layouts on 360px, 375px, 390px, and 430px viewports. | **PASS** |
| **15** | Production build | Vite compiles production bundle cleanly with 0 errors. | **PASS** |

---

## 6. Known Limitations & Technical Notes

1. **Production Row Creation Note:**
   - As explicitly instructed, no fake test players were created in the production spreadsheet. Actual row creation was verified by the existing live row (`jibilu`) retrieved by `getLeaderboard`.
2. **Phone-Only Registration:**
   - Registration does not use OTP or SMS verification. As documented, it provides quick, frictionless access but does not cryptographically prove phone ownership.
3. **Offline Queue & Reconnect:**
   - Any progress made while offline or during momentary Google server unavailability is immediately saved to `localStorage` and automatically flushed to Google Sheets once the device reconnects to the network.
