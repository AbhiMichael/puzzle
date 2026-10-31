/**
 * Jigsaw Puzzle Piece Generation Engine
 * Creates authentic interlocking jigsaw shapes with matching tabs and sockets
 */

// Draw a single jigsaw edge from (x1, y1) to (x2, y2)
export function traceJigsawEdge(ctx, x1, y1, x2, y2, dir, depthRatio = 0.22) {
  if (dir === 0) {
    ctx.lineTo(x2, y2);
    return;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  if (L === 0) return;

  // Normal vector: for clockwise traversal, outward is (dy/L, -dx/L)
  // When dir = +1: points outward (tab)
  // When dir = -1: points inward (socket)
  const nx = (dy / L) * dir;
  const ny = (-dx / L) * dir;
  const d = L * depthRatio;
  const c = 0.5; // Centered tab for perfect symmetry

  const pt = (u, v) => ({
    x: x1 + u * dx + v * d * nx,
    y: y1 + u * dy + v * d * ny,
  });

  // Smooth, authentic jigsaw tab with neck pinch and bulbous head
  const p1 = pt(c - 0.14, 0);
  const cp1 = pt(c - 0.12, -0.06);
  const cp2 = pt(c - 0.16, 0.20);
  const p2 = pt(c - 0.12, 0.45);

  const cp3 = pt(c - 0.08, 0.85);
  const cp4 = pt(c - 0.06, 1.05);
  const p3 = pt(c, 1.0);

  const cp5 = pt(c + 0.06, 1.05);
  const cp6 = pt(c + 0.08, 0.85);
  const p4 = pt(c + 0.12, 0.45);

  const cp7 = pt(c + 0.16, 0.20);
  const cp8 = pt(c + 0.12, -0.06);
  const p5 = pt(c + 0.14, 0);

  ctx.lineTo(p1.x, p1.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
  ctx.bezierCurveTo(cp3.x, cp3.y, cp4.x, cp4.y, p3.x, p3.y);
  ctx.bezierCurveTo(cp5.x, cp5.y, cp6.x, cp6.y, p4.x, p4.y);
  ctx.bezierCurveTo(cp7.x, cp7.y, cp8.x, cp8.y, p5.x, p5.y);
  ctx.lineTo(x2, y2);
}

// Generate the global edge structure for a given grid
export function generateEdgeGrid(rows, cols) {
  // Horizontal interior edges: (rows - 1) x cols
  const hEdges = [];
  for (let r = 0; r < rows - 1; r++) {
    hEdges[r] = [];
    for (let c = 0; c < cols; c++) {
      hEdges[r][c] = {
        dir: Math.random() < 0.5 ? 1 : -1,
        depthRatio: 0.20 + Math.random() * 0.04, // 0.20 - 0.24
      };
    }
  }

  // Vertical interior edges: rows x (cols - 1)
  const vEdges = [];
  for (let r = 0; r < rows; r++) {
    vEdges[r] = [];
    for (let c = 0; c < cols - 1; c++) {
      vEdges[r][c] = {
        dir: Math.random() < 0.5 ? 1 : -1,
        depthRatio: 0.20 + Math.random() * 0.04,
      };
    }
  }

  return { hEdges, vEdges };
}

// Trace the 4-sided closed path for a specific piece
export function tracePiecePath(ctx, originX, originY, pw, ph, edges) {
  const { top, right, bottom, left } = edges;

  ctx.beginPath();
  // Start at top-left
  ctx.moveTo(originX, originY);

  // 1. Top edge: Left to Right
  traceJigsawEdge(ctx, originX, originY, originX + pw, originY, top.dir, top.depthRatio);

  // 2. Right edge: Top to Bottom
  traceJigsawEdge(ctx, originX + pw, originY, originX + pw, originY + ph, right.dir, right.depthRatio);

  // 3. Bottom edge: Right to Left
  traceJigsawEdge(ctx, originX + pw, originY + ph, originX, originY + ph, bottom.dir, bottom.depthRatio);

  // 4. Left edge: Bottom to Top
  traceJigsawEdge(ctx, originX, originY + ph, originX, originY, left.dir, left.depthRatio);

  ctx.closePath();
}

/**
 * Cut an image into authentic jigsaw pieces
 */
export async function createJigsawPieces(imageElement, levelConfig, boardWidth, boardHeight) {
  const { cols, rows, levelNumber } = levelConfig;
  const pw = boardWidth / cols;
  const ph = boardHeight / rows;
  const maxEdge = Math.max(pw, ph);
  const pad = Math.ceil(maxEdge * 0.32 + 4);

  const { hEdges, vEdges } = generateEdgeGrid(rows, cols);
  const pieces = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Determine the 4 edge directions and depths
      const top = r === 0 ? { dir: 0, depthRatio: 0 } : { dir: -hEdges[r - 1][c].dir, depthRatio: hEdges[r - 1][c].depthRatio };
      const right = c === cols - 1 ? { dir: 0, depthRatio: 0 } : { dir: vEdges[r][c].dir, depthRatio: vEdges[r][c].depthRatio };
      const bottom = r === rows - 1 ? { dir: 0, depthRatio: 0 } : { dir: hEdges[r][c].dir, depthRatio: hEdges[r][c].depthRatio };
      const left = c === 0 ? { dir: 0, depthRatio: 0 } : { dir: -vEdges[r][c - 1].dir, depthRatio: vEdges[r][c - 1].depthRatio };

      const edges = { top, right, bottom, left };

      // Create offscreen canvas for this individual piece
      const canvas = document.createElement("canvas");
      const canvasW = Math.round(pw + 2 * pad);
      const canvasH = Math.round(ph + 2 * pad);
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");

      // Smooth anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Origin inside piece canvas
      const ox = pad;
      const oy = pad;

      // Step 1: Trace jigsaw piece outline
      tracePiecePath(ctx, ox, oy, pw, ph, edges);

      // Step 2: Clip to piece shape and draw image slice
      ctx.save();
      ctx.clip();
      // Draw image scaled to full board, translated so only this piece's portion appears
      ctx.drawImage(
        imageElement,
        0, 0, imageElement.naturalWidth, imageElement.naturalHeight,
        ox - c * pw, oy - r * ph, boardWidth, boardHeight
      );

      // Step 3: Subtle inner shadow for 3D depth
      const grad = ctx.createLinearGradient(ox, oy, ox + pw, oy + ph);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 0.0)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Step 4: Draw physical piece border & bevel stroke
      tracePiecePath(ctx, ox, oy, pw, ph, edges);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      tracePiecePath(ctx, ox + 0.6, oy + 0.6, pw, ph, edges);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = 1.0;
      ctx.stroke();

      const dataUrl = canvas.toDataURL("image/png");

      pieces.push({
        id: `lvl${levelNumber}_p_${r}_${c}`,
        levelNumber,
        row: r,
        col: c,
        index: r * cols + c,
        boardX: c * pw,
        boardY: r * ph,
        pw,
        ph,
        pad,
        canvasW,
        canvasH,
        dataUrl,
        edges,
        isPlaced: false,
      });
    }
  }

  return { pieces, hEdges, vEdges };
}

