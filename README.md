# Kerala Piravi Jigsaw Challenge 🌿🧩

An interactive, browser-based jigsaw puzzle game celebrating **Kerala Piravi (November 1)**. Players reconstruct authentic portrait photographs of legendary Kerala personalities across three progressive difficulty levels, with live cloud synchronization to Google Sheets.

---

## 🌟 Features

- **Kerala Piravi Cultural Theme:** Elegant pastel green and gold aesthetic celebrating Kerala's formation day.
- **Authentic Interlocking Jigsaw Pieces:** Irregular puzzle shapes generated via SVG Bézier curves with interlocking tabs and blanks, textured directly with the source photographs.
- **3 Progressive Levels:**
  - **Level 1 (Easy):** 15 interlocking pieces (5×3 grid)
  - **Level 2 (Medium):** 20 interlocking pieces (5×4 grid)
  - **Level 3 (Hard):** 25 interlocking pieces (5×5 grid)
- **Gameplay Mechanics:**
  - Drag-and-drop & click-to-place mechanics
  - Magnetic snapping into target grid positions
  - Reference preview toggle
  - Live piece counters and completion progress bar
  - Sound effects for placement, picks, and errors (with mute toggle)
  - Life system (3 lives with penalty for incorrect drops)
  - Victory celebration screen with confetti
- **Google Sheets Backend Integration:**
  - Powered by Google Apps Script Web App
  - Single tab `Players` database
  - Real-time save & restore of level, score, lives, and placed pieces
  - Dynamic live Leaderboard (Top 25 rankings)
  - Multi-state sync badge (`Cloud Synced`, `Syncing...`, `Offline`, `Sync Failed`)
  - Offline recovery with local storage fallback

---

## 🚀 Tech Stack

- **Frontend:** React 18, Vite, Lucide React (Icons), Canvas Confetti
- **Styling:** Custom CSS with responsive mobile-first pastel design
- **Backend / Database:** Google Apps Script Web App (`Code.gs`) + Google Spreadsheet

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AbhiMichael/puzzle.git
   cd puzzle
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📊 Google Sheets Setup

Refer to [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md) for full deployment instructions, column schema, and Google Apps Script configuration.

---

## 📄 License

MIT
