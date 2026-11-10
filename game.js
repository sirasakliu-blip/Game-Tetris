(() => {
  'use strict';

  // ==========================================
  // ระบบความปลอดภัยและป้องกันการลอกเลียนแบบ (Anti-Tamper & Security Suite)
  // ==========================================
  function initSecurityProtection() {
    // 1. ปิดคลิกขวา (Context Menu) ทั่วทั้งหน้าเกม
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    }, { capture: true });

    // 2. ปิดการลาก (Drag) องค์ประกอบ กราฟิก และบล็อกในเกม
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    }, { capture: true });

    // 3. ป้องกันการคลุมดำ/ไฮไลต์ข้อความ (ยกเว้นช่องกรอก Feedback และชื่อผู้เล่น)
    document.addEventListener('selectstart', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
      e.preventDefault();
      return false;
    });

    // 4. บล็อกปุ่มลัดตรวจดู Source Code และเปิด Developer Tools
    window.addEventListener('keydown', (e) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code || '';

      if (
        e.keyCode === 123 || // F12
        key === 'f12' ||
        (isCtrlOrMeta && isShift && (key === 'i' || key === 'j' || key === 'c' || code === 'KeyI' || code === 'KeyJ' || code === 'KeyC')) ||
        (isCtrlOrMeta && (key === 'u' || key === 's' || key === 'p' || code === 'KeyU' || code === 'KeyS' || code === 'KeyP'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, { capture: true });

    // 5. แสดงข้อความเตือนความปลอดภัยใน Console
    try {
      const titleStyle = 'color: #ff3b1e; font-size: 20px; font-weight: 900; text-shadow: 0 0 8px rgba(255,59,30,0.5);';
      const textStyle = 'color: #f3f5f8; font-size: 13px; font-weight: bold; background: #222630; padding: 6px 10px; border-radius: 4px;';
      console.log('%c⛔ คำเตือนด้านความปลอดภัย & ลิขสิทธิ์', titleStyle);
      console.log('%cระบบและซอร์สโค้ดนี้ได้รับการคุ้มครองสิทธิ์ ห้ามคัดลอก ดัดแปลง หรือเจาะระบบโดยไม่ได้รับอนุญาต', textStyle);
    } catch (e) {}

    // 6. เฝ้าระวังและล้าง Console อัตโนมัติหากมีการเปิดเครื่องมือตรวจโค้ด
    let devToolsOpen = false;
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          try { console.clear(); } catch (e) {}
          console.log('%c⛔ ไม่อนุญาตให้เปิดเครื่องมือตรวจสอบโค้ด', 'color: #ff3b1e; font-size: 16px; font-weight: bold;');
        }
      } else {
        devToolsOpen = false;
      }
    };
    window.addEventListener('resize', checkDevTools);
    setInterval(checkDevTools, 1500);
  }

  // URL Google Apps Script ปลายทาง (เข้ารหัสแบบ Reverse + Base64 เพื่อป้องกันไม่ให้ผู้เล่นเห็น URL ในโค้ดโดยตรง)
  const _APP_ENDPOINT = "==wYlhXZvkkSLhVd6RVS4QURZV2Xt5GcZFkeT1mZ61kValzX3J1UohXd5IVYNlHa5JDdnN2ZzYlRPdzczNzYNFETvdnQLJmZ3J2Y5Z2SB9ycvM3byNWYt9SbvNmLlx2Zv92ZuQHcpJ3Yz9yL6MHc0RHa";

  const COLS = 10;
  const VISIBLE_ROWS = 20;
  const HIDDEN_ROWS = 2;
  const TOTAL_ROWS = VISIBLE_ROWS + HIDDEN_ROWS;

// ==========================================
  // ระบบโหมดลากวางบล็อก 3 ชิ้น (Block Blast Mode Engine)
  // ==========================================
  const BLOCK_BLAST_SHAPES = [
    // 1-cell (ลดโอกาสออกบล็อก 1 ช่อง ไม่ให้เกมง่ายเกินไปตามคำขอของผู้ใช้)
    { name: 'dot', matrix: [[1]], weight: 2 },

    // 2-cells (ลดโอกาสบล็อก 2 ช่อง ไม่ให้ออกถี่เกินไป)
    { name: 'line2h', matrix: [[1, 1]], weight: 4 },
    { name: 'line2v', matrix: [[1], [1]], weight: 4 },

    // 3-cells
    { name: 'line3h', matrix: [[1, 1, 1]], weight: 10 },
    { name: 'line3v', matrix: [[1], [1], [1]], weight: 10 },
    { name: 'corner3_1', matrix: [[1, 1], [1, 0]], weight: 9 },
    { name: 'corner3_2', matrix: [[1, 1], [0, 1]], weight: 9 },
    { name: 'corner3_3', matrix: [[1, 0], [1, 1]], weight: 9 },
    { name: 'corner3_4', matrix: [[0, 1], [1, 1]], weight: 9 },

    // 4-cells (Tetrominoes & Squares)
    { name: 'square2', matrix: [[1, 1], [1, 1]], weight: 12 },
    { name: 'line4h', matrix: [[1, 1, 1, 1]], weight: 10 },
    { name: 'line4v', matrix: [[1], [1], [1], [1]], weight: 10 },
    { name: 'L1', matrix: [[1, 0], [1, 0], [1, 1]], weight: 9 },
    { name: 'L2', matrix: [[0, 1], [0, 1], [1, 1]], weight: 9 },
    { name: 'L3', matrix: [[1, 1, 1], [1, 0, 0]], weight: 9 },
    { name: 'L4', matrix: [[1, 1, 1], [0, 0, 1]], weight: 9 },
    { name: 'T1', matrix: [[1, 1, 1], [0, 1, 0]], weight: 9 },
    { name: 'T2', matrix: [[0, 1, 0], [1, 1, 1]], weight: 9 },
    { name: 'T3', matrix: [[1, 0], [1, 1], [1, 0]], weight: 9 },
    { name: 'T4', matrix: [[0, 1], [1, 1], [0, 1]], weight: 9 },
    { name: 'S1', matrix: [[0, 1, 1], [1, 1, 0]], weight: 8 },
    { name: 'S2', matrix: [[1, 0], [1, 1], [0, 1]], weight: 8 },
    { name: 'Z1', matrix: [[1, 1, 0], [0, 1, 1]], weight: 8 },
    { name: 'Z2', matrix: [[0, 1], [1, 1], [1, 0]], weight: 8 },

    // 5-cells & Big Solid Shapes (No hollow U-shapes)
    { name: 'line5h', matrix: [[1, 1, 1, 1, 1]], weight: 8 },
    { name: 'line5v', matrix: [[1], [1], [1], [1], [1]], weight: 8 },
    { name: 'square3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 8 }, // 3x3 big square (9 blocks)
    { name: 'rect2x3', matrix: [[1, 1, 1], [1, 1, 1]], weight: 8 },             // 2x3 solid (6 blocks)
    { name: 'rect3x2', matrix: [[1, 1], [1, 1], [1, 1]], weight: 8 },             // 3x2 solid (6 blocks)
    { name: 'bigL1', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], weight: 8 },     // 3x3 big corner (5 blocks)
    { name: 'bigL2', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], weight: 8 },
    { name: 'bigL3', matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], weight: 8 },
    { name: 'bigL4', matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], weight: 8 }
  ];

  let bbBoard = Array.from({ length: 10 }, () => Array(10).fill(null));
  let bbPieces = [];
  let isDraggingBB = false;
  let bbDragSlot = -1;
  let bbHoverPos = null;
  let bbSelectedSlot = null;
  let bbLineClearEffects = [];
  let bbPlacedAnim = null; // { cells: [{r, c}], timer: 140, maxTimer: 140 }

  // ตัวแปรสำหรับ RAF Dragging (Decoupled 60/120fps Drag Movement)
  let dragTargetX = 0, dragTargetY = 0, dragIsTouch = false;
  let dragNeedsUpdate = false;
  let cachedBoardRect = null;

  // คำนวณพิกัดมุมซ้ายบนของชิ้นส่วนลอย พร้อม Clamp ให้อยู่ในหน้าจอโทรศัพท์/แท็บเล็ตเสมอ
  function getDragTopLeft(clientX, clientY, pieceW, pieceH, isTouch) {
    let dragLeft = clientX - pieceW / 2;
    let dragTop = isTouch ? (clientY - pieceH - Math.max(26, (cellSize || 30) * 0.85)) : (clientY - pieceH / 2);

    const minX = 4;
    const maxX = Math.max(minX, (window.innerWidth || 360) - pieceW - 4);
    dragLeft = Math.max(minX, Math.min(maxX, dragLeft));

    const minY = 6;
    const maxY = Math.max(minY, (window.innerHeight || 600) - pieceH - 6);
    dragTop = Math.max(minY, Math.min(maxY, dragTop));

    return { dragLeft, dragTop };
  }

  function canShapeFitAt(matrix, rStart, cStart) {
    const sRows = matrix.length;
    const sCols = matrix[0].length;
    if (rStart < 0 || rStart + sRows > 10 || cStart < 0 || cStart + sCols > 10) return false;
    for (let r = 0; r < sRows; r++) {
      for (let c = 0; c < sCols; c++) {
        if (matrix[r][c] && bbBoard[rStart + r][cStart + c] !== null) {
          return false;
        }
      }
    }
    return true;
  }

  function canShapeFitAnywhere(matrix) {
    const sRows = matrix.length;
    const sCols = matrix[0].length;
    for (let r = 0; r <= 10 - sRows; r++) {
      for (let c = 0; c <= 10 - sCols; c++) {
        if (canShapeFitAt(matrix, r, c)) return true;
      }
    }
    return false;
  }

  function getPotentialClears(mat, targetRow, targetCol) {
    const tempBoard = bbBoard.map(row => [...row]);
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[0].length; c++) {
        if (mat[r][c]) {
          const rr = targetRow + r;
          const cc = targetCol + c;
          if (rr >= 0 && rr < 10 && cc >= 0 && cc < 10) {
            tempBoard[rr][cc] = '#fff';
          }
        }
      }
    }
    const fullRows = [];
    for (let r = 0; r < 10; r++) {
      if (tempBoard[r] && tempBoard[r].every(cell => cell !== null && cell !== undefined)) {
        fullRows.push(r);
      }
    }
    const fullCols = [];
    for (let c = 0; c < 10; c++) {
      let colFull = true;
      for (let r = 0; r < 10; r++) {
        if (!tempBoard[r] || tempBoard[r][c] === null || tempBoard[r][c] === undefined) {
          colFull = false;
          break;
        }
      }
      if (colFull) fullCols.push(c);
    }
    return { fullRows, fullCols };
  }

  // ระบบสุ่มอัจฉริยะ (Smart Spawning: ตรวจสอบกระดานเสมอ การันตีสุ่มชิ้นที่วางลงได้)
  function sampleWeightedShape(shapeList) {
    let totalWeight = 0;
    for (let i = 0; i < shapeList.length; i++) {
      totalWeight += (shapeList[i].weight || 10);
    }
    let r = Math.random() * totalWeight;
    for (let i = 0; i < shapeList.length; i++) {
      const w = shapeList[i].weight || 10;
      if (r < w) return shapeList[i];
      r -= w;
    }
    return shapeList[shapeList.length - 1];
  }

  function generateSmartBlockBlastPieces() {
    const colors = ['#e8334a', '#38bdf8', '#ffd700', '#10b981', '#ec4899', '#f97316', '#a855f7'];
    const validShapes = BLOCK_BLAST_SHAPES.filter(s => canShapeFitAnywhere(s.matrix));

    const pieces = [];
    for (let i = 0; i < 3; i++) {
      let shape;
      if (i === 0 && validShapes.length > 0) {
        // Guarantee at least 1 piece can fit on current board so round is playable
        shape = sampleWeightedShape(validShapes);
      } else {
        // Other 2 pieces are sampled from the full shape pool with realistic weights
        // Higher chance of interesting / large / standard shapes, low chance of 1-2 block bailouts
        if (Math.random() < 0.35 && validShapes.length > 0) {
          shape = sampleWeightedShape(validShapes);
        } else {
          shape = sampleWeightedShape(BLOCK_BLAST_SHAPES);
        }
      }

      const color = colors[Math.floor(Math.random() * colors.length)];
      pieces.push({
        name: shape.name,
        matrix: shape.matrix,
        color: color,
        used: false
      });
    }
    return pieces;
  }

  function initBlockBlastGame() {
    gameMode = 'BlockBlast';
    gameState = 'PLAYING';
    activePiece = null;
    loadSavedData();
    applyModeUIRules();
    closeOverlays();

    bbBoard = Array.from({ length: 10 }, () => Array(10).fill(null));
    bbPieces = generateSmartBlockBlastPieces();
    isDraggingBB = false;
    bbDragSlot = -1;
    bbHoverPos = null;
    bbSelectedSlot = null;
    bbLineClearEffects = [];
    bbPlacedAnim = null;
    dragNeedsUpdate = false;
    cachedBoardRect = null;
    score = 0;
    lines = 0;
    comboCount = 0;

    const dragCanvas = document.getElementById('bbDragCanvas');
    if (dragCanvas) dragCanvas.style.display = 'none';

    const modeBadge = document.getElementById('modeBadge');
    if (modeBadge) modeBadge.textContent = 'BLOCK BLAST';
    const scoreVal = document.getElementById('scoreVal');
    if (scoreVal) scoreVal.textContent = '0';
    const linesVal = document.getElementById('linesVal');
    if (linesVal) linesVal.textContent = '0';
    const timerBadge = document.getElementById('gameTimerBadge');
    if (timerBadge) {
      timerBadge.classList.add('hidden');
      timerBadge.style.display = 'none';
    }
    updateComboUI();

    const gestureHint = document.getElementById('gestureHint');
    if (gestureHint) {
      gestureHint.textContent = '🧩 ลากบล็อกด้านล่าง 3 ชิ้น หรือแตะเลือกแล้วแตะบนกระดาน';
      gestureHint.classList.remove('fade-out');
      gestureHint.style.display = 'block';
    }

    resizeCanvases();
    requestAnimationFrame(() => {
      resizeCanvases();
      renderBlockBlastDock();
    });
  }

  function renderBlockBlastDock() {
    for (let i = 0; i < 3; i++) {
      const slotEl = document.querySelector(`.bb-dock-slot[data-slot="${i}"]`);
      const canvas = document.getElementById(`bbDockCanvas${i}`);
      if (!canvas || !slotEl) continue;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = slotEl.getBoundingClientRect();
      const w = Math.round(rect.width || slotEl.offsetWidth || 130);
      const h = Math.round(rect.height || slotEl.offsetHeight || 80);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const piece = bbPieces[i];
      if (!piece || piece.used) {
        slotEl.classList.add('empty');
        slotEl.classList.remove('selected', 'dragging-source', 'unplaceable');
        slotEl.style.transform = '';
        continue;
      }
      slotEl.classList.remove('empty');
      slotEl.classList.toggle('selected', bbSelectedSlot === i);

      const mat = piece.matrix;
      const canFit = canShapeFitAnywhere(mat);
      slotEl.classList.toggle('unplaceable', !canFit);

      const mRows = mat.length;
      const mCols = mat[0].length;

      const pad = 12;
      const availW = w - pad * 2;
      const availH = h - pad * 2;
      const mSize = Math.min(availW / mCols, availH / mRows, 28);
      const startX = (w - mCols * mSize) / 2;
      const startY = (h - mRows * mSize) / 2;

      for (let r = 0; r < mRows; r++) {
        for (let c = 0; c < mCols; c++) {
          if (mat[r][c]) {
            drawBlockBlastCell(ctx, startX + c * mSize, startY + r * mSize, mSize, piece.color);
          }
        }
      }
    }
  }

  const BB_COLOR_TO_TYPE = {
    '#38bdf8': 'I',
    '#ffd700': 'O',
    '#a855f7': 'T',
    '#10b981': 'S',
    '#e8334a': 'Z',
    '#ec4899': 'J',
    '#f97316': 'L'
  };

  function drawBlockBlastCell(ctx, x, y, size, colorHex, alpha = 1) {
    if (size <= 2 || alpha <= 0) return;
    const type = BB_COLOR_TO_TYPE[colorHex] || 'I';
    drawWoodenBlock(ctx, x, y, size, type, false, alpha);
  }

  function renderBlockBlastBoard() {
    const width = 10 * cellSize, height = 10 * cellSize;
    boardCtx.clearRect(0, 0, width, height);

    let sX = 0, sY = 0;
    if (shakeTimer > 0 && !reducedEffects && shakeDuration > 0) {
      const progress = shakeTimer / shakeDuration;
      const currentAmp = shakeIntensity * progress;
      sX = (Math.random() * 2 - 1) * currentAmp;
      sY = (Math.random() * 2 - 1) * currentAmp;
    }

    boardCtx.save();
    boardCtx.translate(sX, sY);

    // 1. ตารางพื้นหลัง 10x10 สไตล์นีออนมิดไนท์
    const bgGrad = boardCtx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#131724');
    bgGrad.addColorStop(1, '#0a0d15');
    boardCtx.fillStyle = bgGrad;
    boardCtx.fillRect(0, 0, width, height);

    // 2. เบ้าช่องตารางเซลล์พื้นหลัง (Sleek Cell Sockets)
    const socketPad = Math.max(1, cellSize * 0.05);
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const sx = c * cellSize + socketPad;
        const sy = r * cellSize + socketPad;
        const sw = cellSize - socketPad * 2;
        const sh = cellSize - socketPad * 2;
        roundRectPath(boardCtx, sx, sy, sw, sh, Math.max(3, cellSize * 0.12));
        boardCtx.fillStyle = 'rgba(255, 255, 255, 0.025)';
        boardCtx.fill();
        boardCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        boardCtx.lineWidth = 1;
        boardCtx.stroke();
      }
    }

    // 3. วาดบล็อกที่วางอยู่บนกระดาน 10x10 พร้อมเอฟเฟกต์เด้งลงล็อกสมูท (Juicy Squash)
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const val = bbBoard[r][c];
        if (!val) continue;

        let scale = 1;
        let flash = 0;
        if (bbPlacedAnim) {
          const match = bbPlacedAnim.cells.find(cell => cell.r === r && cell.c === c);
          if (match) {
            const p = Math.max(0, bbPlacedAnim.timer / bbPlacedAnim.maxTimer);
            scale = 1 + Math.sin(p * Math.PI) * 0.14;
            flash = p * 0.45;
          }
        }

        if (scale !== 1) {
          boardCtx.save();
          boardCtx.translate((c + 0.5) * cellSize, (r + 0.5) * cellSize);
          boardCtx.scale(scale, scale);
          drawBlockBlastCell(boardCtx, -cellSize / 2, -cellSize / 2, cellSize, val);
          if (flash > 0) {
            roundRectPath(boardCtx, -cellSize / 2 + 1, -cellSize / 2 + 1, cellSize - 2, cellSize - 2, Math.max(3, cellSize * 0.18));
            boardCtx.fillStyle = `rgba(255, 255, 255, ${flash})`;
            boardCtx.fill();
          }
          boardCtx.restore();
        } else {
          drawBlockBlastCell(boardCtx, c * cellSize, r * cellSize, cellSize, val);
        }
      }
    }

    // 4. เอฟเฟกต์ลำแสงล้างแถว (Radiant Sweep Beams)
    for (const effect of bbLineClearEffects) {
      const p = Math.max(0, effect.timer / effect.maxTimer);
      boardCtx.save();
      effect.fullRows.forEach(r => {
        const beamY = (r + 0.5) * cellSize;
        const beamH = cellSize * (1.2 - (1 - p) * 0.8);
        const grad = boardCtx.createLinearGradient(0, beamY - beamH / 2, 0, beamY + beamH / 2);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * p})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        boardCtx.fillStyle = grad;
        boardCtx.fillRect(0, beamY - beamH / 2, width, beamH);
      });
      effect.fullCols.forEach(c => {
        const beamX = (c + 0.5) * cellSize;
        const beamW = cellSize * (1.2 - (1 - p) * 0.8);
        const grad = boardCtx.createLinearGradient(beamX - beamW / 2, 0, beamX + beamW / 2, 0);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * p})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        boardCtx.fillStyle = grad;
        boardCtx.fillRect(beamX - beamW / 2, 0, beamW, height);
      });
      boardCtx.restore();
    }

    // 5. พรีวิวตำแหน่งที่จะวาง (Ghost Placement Highlight) + แสงเตือนแถวที่จะถูกล้าง (Anticipation Glow)
    const activeSlot = (isDraggingBB ? bbDragSlot : bbSelectedSlot);
    if (activeSlot !== null && activeSlot !== undefined && bbHoverPos && bbPieces[activeSlot] && !bbPieces[activeSlot].used) {
      const mat = bbPieces[activeSlot].matrix;
      const color = bbPieces[activeSlot].color;

      const { fullRows, fullCols } = getPotentialClears(mat, bbHoverPos.row, bbHoverPos.col);

      // ไฮไลต์แถวนอน/แถวตั้งที่จะถูกล้างด้วยแสงออร่าทองคำนีออนเร้าใจ!
      if (fullRows.length > 0 || fullCols.length > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.015);
        boardCtx.save();
        boardCtx.fillStyle = `rgba(255, 215, 0, ${0.18 + pulse * 0.16})`;
        fullRows.forEach(r => {
          boardCtx.fillRect(0, r * cellSize, width, cellSize);
        });
        fullCols.forEach(c => {
          boardCtx.fillRect(c * cellSize, 0, cellSize, height);
        });
        boardCtx.restore();
      }

      // วาดบล็อกเงาโปร่งแสงตรงตำแหน่งที่จะวาง (ตรงเป๊ะ 100% พร้อมขอบแสงเนียนตา)
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.012);
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[0].length; c++) {
          if (mat[r][c]) {
            const hx = (bbHoverPos.col + c) * cellSize;
            const hy = (bbHoverPos.row + r) * cellSize;
            drawBlockBlastCell(boardCtx, hx, hy, cellSize, color, 0.48);
            boardCtx.save();
            const rad = Math.max(3, cellSize * 0.18);
            roundRectPath(boardCtx, hx + 1.5, hy + 1.5, cellSize - 3, cellSize - 3, rad);
            boardCtx.strokeStyle = `rgba(255, 255, 255, ${0.75 + pulse * 0.25})`;
            boardCtx.lineWidth = 2.2;
            boardCtx.stroke();
            boardCtx.restore();
          }
        }
      }
    }

    // 6. ละอองเอฟเฟกต์และตัวหนังสือลอยคะแนน
    particles.forEach(p => p.draw(boardCtx));
    floatingTexts.forEach(t => t.draw(boardCtx));

    boardCtx.restore();

    // 7. ซิงค์การลากชิ้นส่วนลอยผ่าน VSync (RAF Update) เพื่อความสมูท 60-120fps
    if (isDraggingBB && dragNeedsUpdate && bbPieces[bbDragSlot]) {
      const piece = bbPieces[bbDragSlot];
      const mat = piece.matrix;
      const pieceW = mat[0].length * cellSize;
      const pieceH = mat.length * cellSize;
      const dragCanvas = document.getElementById('bbDragCanvas');

      const { dragLeft, dragTop } = getDragTopLeft(dragTargetX, dragTargetY, pieceW, pieceH, dragIsTouch);

      if (dragCanvas) {
        dragCanvas.style.transform = `translate3d(${dragLeft}px, ${dragTop}px, 0)`;
      }

      if (cachedBoardRect) {
        const relLeft = dragLeft - cachedBoardRect.left;
        const relTop = dragTop - cachedBoardRect.top;
        const col = Math.round(relLeft / cellSize);
        const row = Math.round(relTop / cellSize);
        if (canShapeFitAt(mat, row, col)) {
          bbHoverPos = { row, col };
        } else {
          bbHoverPos = null;
        }
      }
      dragNeedsUpdate = false;
    }
  }

  function executeBlockBlastPlacement(slotIdx, targetRow, targetCol) {
    const piece = bbPieces[slotIdx];
    if (!piece || piece.used) return false;
    const mat = piece.matrix;
    if (!canShapeFitAt(mat, targetRow, targetCol)) return false;

    const color = piece.color;
    let placedCount = 0;
    const placedCells = [];
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[0].length; c++) {
        if (mat[r][c]) {
          bbBoard[targetRow + r][targetCol + c] = color;
          placedCells.push({ r: targetRow + r, c: targetCol + c, color });
          placedCount++;
        }
      }
    }

    piece.used = true;
    audioMgr.playSnap();
    score += placedCount * 10;

    // แอนิเมชันเด้งลงล็อกสมูทนุ่มนวล
    bbPlacedAnim = {
      cells: placedCells,
      timer: 140,
      maxTimer: 140
    };

    const fullRows = [];
    for (let r = 0; r < 10; r++) {
      if (bbBoard[r] && bbBoard[r].every(cell => cell !== null && cell !== undefined)) {
        fullRows.push(r);
      }
    }
    const fullCols = [];
    for (let c = 0; c < 10; c++) {
      let colFull = true;
      for (let r = 0; r < 10; r++) {
        if (!bbBoard[r] || bbBoard[r][c] === null || bbBoard[r][c] === undefined) {
          colFull = false;
          break;
        }
      }
      if (colFull) fullCols.push(c);
    }

    const totalCleared = fullRows.length + fullCols.length;
    if (totalCleared > 0) {
      comboCount++;
      const comboBonus = totalCleared * 100 * comboCount;
      score += comboBonus;
      lines += totalCleared;

      const cellsToClear = [];
      const seen = new Set();
      fullRows.forEach(r => {
        for (let c = 0; c < 10; c++) {
          const key = `${r},${c}`;
          if (!seen.has(key)) {
            seen.add(key);
            cellsToClear.push({ r, c, color: bbBoard[r][c] || '#38bdf8' });
          }
        }
      });
      fullCols.forEach(c => {
        for (let r = 0; r < 10; r++) {
          const key = `${r},${c}`;
          if (!seen.has(key)) {
            seen.add(key);
            cellsToClear.push({ r, c, color: bbBoard[r][c] || '#38bdf8' });
          }
        }
      });

      // ระเบิดละอองอนุภาคตรงจุดที่บล็อกแตก
      cellsToClear.forEach(({ r, c, color: cellColor }) => {
        const cX = (c + 0.5) * cellSize;
        const cY = (r + 0.5) * cellSize;
        const count = reducedEffects ? 3 : 6;
        for (let i = 0; i < count; i++) {
          if (particles.length < 400) {
            particles.push(new WoodParticle(
              cX + (Math.random() - 0.5) * (cellSize * 0.7),
              cY + (Math.random() - 0.5) * (cellSize * 0.7),
              cellColor
            ));
            if (Math.random() < 0.45) {
              particles.push(new SparkleParticle(cX, cY, '#ffffff'));
            }
          }
        }
      });

      // ล้างบล็อกออกจากตรรกะกระดานทันที (ไม่บล็อกการลากบล็อกถัดไป)
      cellsToClear.forEach(({ r, c }) => {
        bbBoard[r][c] = null;
      });

      // เพิ่มเอฟเฟกต์ลำแสงลอยสวยงาม 260ms
      bbLineClearEffects.push({
        fullRows,
        fullCols,
        timer: 260,
        maxTimer: 260
      });

      triggerShake(Math.min(12, 4 + totalCleared * 2.5), 250);
      audioMgr.playClear(totalCleared, true, comboCount);
      updateComboUI();

      let clearText = `+${comboBonus}`;
      if (totalCleared === 2) clearText = `DOUBLE! +${comboBonus}`;
      else if (totalCleared === 3) clearText = `TRIPLE! +${comboBonus}`;
      else if (totalCleared >= 4) clearText = `MEGA BLAST! +${comboBonus}`;
      if (comboCount > 1) clearText += ` (×${comboCount})`;

      const avgR = cellsToClear.reduce((acc, curr) => acc + curr.r, 0) / cellsToClear.length;
      const avgC = cellsToClear.reduce((acc, curr) => acc + curr.c, 0) / cellsToClear.length;
      floatingTexts.push(new FloatingText(clearText, (avgC + 0.5) * cellSize, (avgR + 0.5) * cellSize, '#ffd700', 20));

      // ตรวจสอบ All Clear (ล้างหมดเกลี้ยงกระดาน)
      const isBoardEmpty = bbBoard.every(row => row.every(cell => cell === null));
      if (isBoardEmpty) {
        score += 3000;
        comboCount += 3;
        triggerShake(16, 450);
        audioMgr.playLevelUp();
        floatingTexts.push(new FloatingText('🌟 ALL CLEAR! +3,000', 5 * cellSize, 5 * cellSize, '#fef08a', 26));
        cycleBlockSkin();
      }
    } else {
      comboCount = 0;
      updateComboUI();
    }

    document.getElementById('scoreVal').textContent = score.toLocaleString();
    document.getElementById('linesVal').textContent = lines.toString();
    saveHighScore();

    bbSelectedSlot = null;
    bbHoverPos = null;

    checkBlockBlastPostPlacement();
    renderBlockBlastDock();
    return true;
  }

  function checkBlockBlastPostPlacement() {
    // If all 3 pieces in current set are used, spawn a new set of 3
    if (!bbPieces || bbPieces.length === 0 || bbPieces.every(p => p.used)) {
      bbPieces = generateSmartBlockBlastPieces();
    }

    // ตรวจสอบชิ้นส่วนที่เหลือทั้งหมดใน Dock (เหลือ 2 ชิ้น หรือ 1 ชิ้น หรือชุดใหม่ 3 ชิ้น)
    const remaining = bbPieces.filter(p => !p.used);
    if (remaining.length === 0) return;

    // ตรวจว่ามีชิ้นส่วนใดที่เหลือสามารถวางลงกระดานได้หรือไม่
    const hasValidMove = remaining.some(p => canShapeFitAnywhere(p.matrix));

    // หากเหลือบล็อก (เช่น เหลือ 2 บล็อก หรือ 1 บล็อก) แต่ไม่มีที่ให้วางแล้ว -> ปรับจบเกมทันที!
    if (!hasValidMove) {
      renderBlockBlastDock(); // ไฮไลท์บล็อกเป็น unplaceable สีเทา/จาง
      setTimeout(() => {
        if (gameState === 'PLAYING' && gameMode === 'BlockBlast') {
          triggerGameOver();
        }
      }, 200);
    }
  }

  function setupBlockBlastDragHandlers() {
    let startX = 0, startY = 0;
    const dragCanvas = document.getElementById('bbDragCanvas');
    let bbActiveTouchId = null;
    let lastDragEndTime = 0;

    function renderPieceOnDragCanvas(piece) {
      if (!dragCanvas || !piece) return;
      const dpr = window.devicePixelRatio || 1;
      const mat = piece.matrix;
      const mCols = mat[0].length;
      const mRows = mat.length;
      const pieceW = mCols * cellSize;
      const pieceH = mRows * cellSize;

      dragCanvas.width = Math.round(pieceW * dpr);
      dragCanvas.height = Math.round(pieceH * dpr);
      dragCanvas.style.width = `${pieceW}px`;
      dragCanvas.style.height = `${pieceH}px`;

      const ctx = dragCanvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, pieceW, pieceH);

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;
      for (let r = 0; r < mRows; r++) {
        for (let c = 0; c < mCols; c++) {
          if (mat[r][c]) {
            drawBlockBlastCell(ctx, c * cellSize, r * cellSize, cellSize, piece.color);
          }
        }
      }
      ctx.restore();
    }

    function cancelDrag() {
      if (dragCanvas) dragCanvas.style.display = 'none';
      if (bbDragSlot !== -1) {
        const slotEl = document.querySelector(`.bb-dock-slot[data-slot="${bbDragSlot}"]`);
        if (slotEl) {
          slotEl.classList.remove('dragging-source');
          slotEl.style.transform = '';
        }
      }
      isDraggingBB = false;
      bbHoverPos = null;
      bbDragSlot = -1;
      dragNeedsUpdate = false;
      bbActiveTouchId = null;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isDraggingBB) cancelDrag();
    });

    function startDrag(slotIdx, clientX, clientY, isTouch = false) {
      if (gameState !== 'PLAYING') return;
      const piece = bbPieces[slotIdx];
      if (!piece || piece.used) return;

      const slotEl = document.querySelector(`.bb-dock-slot[data-slot="${slotIdx}"]`);

      // If this specific piece cannot fit anywhere on the board
      if (!canShapeFitAnywhere(piece.matrix)) {
        if (slotEl) {
          slotEl.classList.add('shake-error');
          setTimeout(() => slotEl && slotEl.classList.remove('shake-error'), 300);
        }
        if (navigator.vibrate) navigator.vibrate([20, 40, 20]);

        // Check if ANY of the remaining unused pieces can fit
        const remaining = bbPieces.filter(p => !p.used);
        const hasValidMove = remaining.some(p => canShapeFitAnywhere(p.matrix));
        if (remaining.length > 0 && !hasValidMove) {
          triggerGameOver();
        }
        return;
      }

      audioMgr.init();

      cachedBoardRect = boardCanvas.getBoundingClientRect();
      isDraggingBB = true;
      bbDragSlot = slotIdx;
      startX = clientX;
      startY = clientY;

      if (slotEl) {
        slotEl.classList.add('dragging-source');
        slotEl.style.transform = 'scale(0.92)';
      }

      renderPieceOnDragCanvas(piece);

      dragTargetX = clientX;
      dragTargetY = clientY;
      dragIsTouch = isTouch;
      dragNeedsUpdate = true;

      const mat = piece.matrix;
      const pieceW = mat[0].length * cellSize;
      const pieceH = mat.length * cellSize;
      const { dragLeft, dragTop } = getDragTopLeft(clientX, clientY, pieceW, pieceH, isTouch);

      if (dragCanvas) {
        dragCanvas.style.display = 'block';
        dragCanvas.style.transform = `translate3d(${dragLeft}px, ${dragTop}px, 0)`;
      }

      bbHoverPos = null;
    }

    function moveDrag(clientX, clientY, isTouch = false) {
      if (!isDraggingBB || !bbPieces[bbDragSlot]) return;
      dragTargetX = clientX;
      dragTargetY = clientY;
      dragIsTouch = isTouch;
      dragNeedsUpdate = true;
    }

    function endDrag(clientX, clientY) {
      if (!isDraggingBB) return;
      if (dragCanvas) dragCanvas.style.display = 'none';

      const slotIdx = bbDragSlot;
      const slotEl = document.querySelector(`.bb-dock-slot[data-slot="${slotIdx}"]`);
      if (slotEl) {
        slotEl.classList.remove('dragging-source');
        slotEl.style.transform = '';
      }

      const dist = Math.hypot(clientX - startX, clientY - startY);

      if (dist < 12) {
        // แตะ/คลิกเพื่อเลือกชิ้นส่วน (Tap-to-select)
        bbSelectedSlot = (bbSelectedSlot === slotIdx ? null : slotIdx);
        renderBlockBlastDock();
      } else if (bbHoverPos && bbPieces[slotIdx]) {
        // วางลงตำแหน่งบนกระดานสำเร็จ
        executeBlockBlastPlacement(slotIdx, bbHoverPos.row, bbHoverPos.col);
        if (navigator.vibrate) navigator.vibrate(12);
      } else {
        audioMgr.playMove();
      }

      isDraggingBB = false;
      bbHoverPos = null;
      bbDragSlot = -1;
      dragNeedsUpdate = false;
      bbActiveTouchId = null;
      lastDragEndTime = Date.now();
    }

    document.querySelectorAll('.bb-dock-slot').forEach(slot => {
      const idx = parseInt(slot.getAttribute('data-slot'), 10);
      slot.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const t = e.changedTouches[0];
          if (bbActiveTouchId === null) {
            bbActiveTouchId = t.identifier;
            startDrag(idx, t.clientX, t.clientY, true);
          }
          if (e.cancelable) e.preventDefault();
        }
      }, { passive: false });

      slot.addEventListener('mousedown', (e) => {
        startDrag(idx, e.clientX, e.clientY, false);
      });
    });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingBB && bbActiveTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === bbActiveTouchId) {
            moveDrag(t.clientX, t.clientY, true);
            break;
          }
        }
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingBB) {
        moveDrag(e.clientX, e.clientY, false);
      } else if (bbSelectedSlot !== null && bbPieces[bbSelectedSlot] && !bbPieces[bbSelectedSlot].used) {
        if (!cachedBoardRect) cachedBoardRect = boardCanvas.getBoundingClientRect();
        const rect = cachedBoardRect;
        const mat = bbPieces[bbSelectedSlot].matrix;
        const pieceW = mat[0].length * cellSize;
        const pieceH = mat.length * cellSize;
        const dragLeft = e.clientX - pieceW / 2;
        const dragTop = e.clientY - pieceH / 2;

        const relLeft = dragLeft - rect.left;
        const relTop = dragTop - rect.top;
        const col = Math.round(relLeft / cellSize);
        const row = Math.round(relTop / cellSize);
        if (canShapeFitAt(mat, row, col)) {
          bbHoverPos = { row, col };
        } else {
          bbHoverPos = null;
        }
      }
    });

    window.addEventListener('touchend', (e) => {
      if (isDraggingBB && bbActiveTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === bbActiveTouchId) {
            endDrag(t.clientX, t.clientY);
            break;
          }
        }
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchcancel', (e) => {
      if (isDraggingBB) {
        cancelDrag();
      }
    }, { passive: false });

    window.addEventListener('mouseup', (e) => {
      if (isDraggingBB) {
        endDrag(e.clientX, e.clientY);
      }
    });

    window.addEventListener('scroll', () => { cachedBoardRect = null; }, { passive: true });
    window.addEventListener('resize', () => { cachedBoardRect = null; }, { passive: true });

    boardCanvas.addEventListener('click', (e) => {
      if (Date.now() - lastDragEndTime < 350) return; // ป้องกัน Ghost click หลังจากลากปล่อยบนมือถือ
      if (gameMode !== 'BlockBlast' || bbSelectedSlot === null || !bbPieces[bbSelectedSlot] || bbPieces[bbSelectedSlot].used) return;
      const rect = boardCanvas.getBoundingClientRect();
      const mat = bbPieces[bbSelectedSlot].matrix;
      const mRows = mat.length;
      const mCols = mat[0].length;
      const clickCol = Math.floor((e.clientX - rect.left) / cellSize);
      const clickRow = Math.floor((e.clientY - rect.top) / cellSize);

      // ลองหาตำแหน่งวางที่ดีที่สุดรอบๆ จุดที่ผู้เล่นแตะ (รอบรับชิ้นแนวตั้งและแนวนอนทุกขนาด 100%)
      const candidates = [
        // 1. วางแบบจุดแตะคือมุมซ้ายบนของชิ้น
        { r: clickRow, c: clickCol },
        // 2. วางแบบกึ่งกลางชิ้นตรงกับจุดแตะ
        { r: clickRow - Math.floor(mRows / 2), c: clickCol - Math.floor(mCols / 2) },
        // 3. วางแบบจุดแตะคือมุมล่าง (กรณีแตะขอบล่างกระดาน)
        { r: clickRow - mRows + 1, c: clickCol },
        // 4. วางแบบจุดแตะคือมุมขวา (กรณีแตะขอบขวากระดาน)
        { r: clickRow, c: clickCol - mCols + 1 }
      ];

      let placed = false;
      for (const cand of candidates) {
        const clampedR = Math.max(0, Math.min(10 - mRows, cand.r));
        const clampedC = Math.max(0, Math.min(10 - mCols, cand.c));
        if (canShapeFitAt(mat, clampedR, clampedC)) {
          executeBlockBlastPlacement(bbSelectedSlot, clampedR, clampedC);
          if (navigator.vibrate) navigator.vibrate(12);
          placed = true;
          break;
        }
      }
      if (!placed) {
        audioMgr.playMove();
      }
    });
  }

  const LOCK_DELAY_MODERN_MS = 500;
  const LOCK_DELAY_CLASSIC_MS = 80;
  const MAX_LOCK_RESETS = 15;
  const DAS_MS = 150;
  const ARR_MS = 40;
  const LINE_CLEAR_ANIM_MS = 220;

  // ชิ้นส่วนปกติสำหรับระบบ 7-Bag
  const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  // ชิ้นส่วนพิเศษ (Special Blocks)
  const SPECIAL_PIECES = ['BOMB', 'LASER', 'VORTEX', 'GOLD'];

  // รูปร่างของแต่ละชิ้น (รวมชิ้นพิเศษ 1x1)
  const SHAPES = {
    I: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]
    ],
    O: [
      [[0,1,1,0],[0,1,1,0],[0,0,0,0]],
      [[0,1,1,0],[0,1,1,0],[0,0,0,0]],
      [[0,1,1,0],[0,1,1,0],[0,0,0,0]],
      [[0,1,1,0],[0,1,1,0],[0,0,0,0]]
    ],
    T: [
      [[0,1,0],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,1],[0,1,0]],
      [[0,1,0],[1,1,0],[0,1,0]]
    ],
    S: [
      [[0,1,1],[1,1,0],[0,0,0]],
      [[0,1,0],[0,1,1],[0,0,1]],
      [[0,0,0],[0,1,1],[1,1,0]],
      [[1,0,0],[1,1,0],[0,1,0]]
    ],
    Z: [
      [[1,1,0],[0,1,1],[0,0,0]],
      [[0,0,1],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,0],[0,1,1]],
      [[0,1,0],[1,1,0],[1,0,0]]
    ],
    J: [
      [[1,0,0],[1,1,1],[0,0,0]],
      [[0,1,1],[0,1,0],[0,1,0]],
      [[0,0,0],[1,1,1],[0,0,1]],
      [[0,1,0],[0,1,0],[1,1,0]]
    ],
    L: [
      [[0,0,1],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,0],[0,1,1]],
      [[0,0,0],[1,1,1],[1,0,0]],
      [[1,1,0],[0,1,0],[0,1,0]]
    ],
    BOMB: [[[1]], [[1]], [[1]], [[1]]],
    LASER: [[[1]], [[1]], [[1]], [[1]]],
    VORTEX: [[[1]], [[1]], [[1]], [[1]]],
    GOLD: [[[1]], [[1]], [[1]], [[1]]]
  };

  const WALL_KICKS_JLSTZ = {
    '0->1': [[0,0], [-1,0], [-1,-1], [0, 2], [-1, 2]],
    '1->0': [[0,0], [ 1,0], [ 1, 1], [0,-2], [ 1,-2]],
    '1->2': [[0,0], [ 1,0], [ 1, 1], [0,-2], [ 1,-2]],
    '2->1': [[0,0], [-1,0], [-1,-1], [0, 2], [-1, 2]],
    '2->3': [[0,0], [ 1,0], [ 1,-1], [0, 2], [ 1, 2]],
    '3->2': [[0,0], [-1,0], [-1, 1], [0,-2], [-1,-2]],
    '3->0': [[0,0], [-1,0], [-1, 1], [0,-2], [-1,-2]],
    '0->3': [[0,0], [ 1,0], [ 1,-1], [0, 2], [ 1, 2]]
  };

  const WALL_KICKS_I = {
    '0->1': [[0,0], [-2,0], [ 1,0], [-2, 1], [ 1,-2]],
    '1->0': [[0,0], [ 2,0], [-1,0], [ 2,-1], [-1, 2]],
    '1->2': [[0,0], [-1,0], [ 2,0], [-1, 2], [ 2,-1]],
    '2->1': [[0,0], [ 1,0], [-2,0], [ 1,-2], [-2, 1]],
    '2->3': [[0,0], [ 2,0], [-1,0], [ 2,-1], [-1, 2]],
    '3->2': [[0,0], [-2,0], [ 1,0], [-2, 1], [ 1,-2]],
    '3->0': [[0,0], [ 1,0], [-2,0], [ 1,-2], [-2, 1]],
    '0->3': [[0,0], [-1,0], [ 2,0], [-1, 2], [ 2,-1]]
  };

  // ==========================================
  // ชุดธีมและสีสันของบล็อก (Themes System)
  // ==========================================
  const THEMES = {
    midnight: {
      I: { base: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', glow: 'rgba(56, 189, 248, 0.75)' },
      O: { base: '#f59e0b', light: '#fcd34d', dark: '#b45309', glow: 'rgba(245, 158, 11, 0.75)' },
      T: { base: '#c084fc', light: '#e9d5ff', dark: '#7e22ce', glow: 'rgba(192, 132, 252, 0.75)' },
      S: { base: '#10b981', light: '#6ee7b7', dark: '#047857', glow: 'rgba(16, 185, 129, 0.75)' },
      Z: { base: '#f43f5e', light: '#fda4af', dark: '#be123c', glow: 'rgba(244, 63, 94, 0.75)' },
      J: { base: '#6366f1', light: '#a5b4fc', dark: '#4338ca', glow: 'rgba(99, 102, 241, 0.75)' },
      L: { base: '#fb923c', light: '#fdba74', dark: '#c2410c', glow: 'rgba(251, 146, 60, 0.75)' },
      BOMB: { base: '#ef4444', light: '#fca5a5', dark: '#991b1b', glow: 'rgba(239, 68, 68, 0.95)' },
      LASER: { base: '#06b6d4', light: '#67e8f9', dark: '#0e7490', glow: 'rgba(6, 182, 212, 0.95)' },
      VORTEX: { base: '#9333ea', light: '#c084fc', dark: '#581c87', glow: 'rgba(147, 51, 234, 0.95)' },
      GOLD: { base: '#ffd700', light: '#fef08a', dark: '#ca8a04', glow: 'rgba(255, 215, 0, 0.95)' }
    },
    walnut: {
      I: { base: '#0284c7', light: '#38bdf8', dark: '#0369a1', glow: 'rgba(2, 132, 199, 0.75)' },
      O: { base: '#d97706', light: '#fbbf24', dark: '#92400e', glow: 'rgba(217, 119, 6, 0.75)' },
      T: { base: '#b45309', light: '#f59e0b', dark: '#78350f', glow: 'rgba(180, 83, 9, 0.75)' },
      S: { base: '#65a30d', light: '#a3e635', dark: '#3f6212', glow: 'rgba(101, 163, 13, 0.75)' },
      Z: { base: '#b91c1c', light: '#ef4444', dark: '#7f1d1d', glow: 'rgba(185, 28, 28, 0.75)' },
      J: { base: '#4338ca', light: '#818cf8', dark: '#312e81', glow: 'rgba(67, 56, 202, 0.75)' },
      L: { base: '#c2410c', light: '#fb923c', dark: '#7c2d12', glow: 'rgba(194, 65, 12, 0.75)' },
      BOMB: { base: '#dc2626', light: '#f87171', dark: '#991b1b', glow: 'rgba(220, 38, 38, 0.95)' },
      LASER: { base: '#0891b2', light: '#22d3ee', dark: '#164e63', glow: 'rgba(8, 145, 178, 0.95)' },
      VORTEX: { base: '#7e22ce', light: '#a855f7', dark: '#581c87', glow: 'rgba(126, 34, 206, 0.95)' },
      GOLD: { base: '#f59e0b', light: '#fde68a', dark: '#b45309', glow: 'rgba(245, 158, 11, 0.95)' }
    },
    aurora: {
      I: { base: '#2dd4bf', light: '#5eead4', dark: '#0f766e', glow: 'rgba(45, 212, 191, 0.75)' },
      O: { base: '#fbbf24', light: '#fde68a', dark: '#d97706', glow: 'rgba(251, 191, 36, 0.75)' },
      T: { base: '#a78bfa', light: '#c4b5fd', dark: '#6d28d9', glow: 'rgba(167, 139, 250, 0.75)' },
      S: { base: '#34d399', light: '#6ee7b7', dark: '#059669', glow: 'rgba(52, 211, 153, 0.75)' },
      Z: { base: '#f43f5e', light: '#fda4af', dark: '#9f1239', glow: 'rgba(244, 63, 94, 0.75)' },
      J: { base: '#818cf8', light: '#c7d2fe', dark: '#4338ca', glow: 'rgba(129, 140, 248, 0.75)' },
      L: { base: '#fb923c', light: '#fed7aa', dark: '#c2410c', glow: 'rgba(251, 146, 60, 0.75)' },
      BOMB: { base: '#e11d48', light: '#fb7185', dark: '#881337', glow: 'rgba(225, 29, 72, 0.95)' },
      LASER: { base: '#38bdf8', light: '#bae6fd', dark: '#0284c7', glow: 'rgba(56, 189, 248, 0.95)' },
      VORTEX: { base: '#9333ea', light: '#d8b4fe', dark: '#581c87', glow: 'rgba(147, 51, 234, 0.95)' },
      GOLD: { base: '#facc15', light: '#fef08a', dark: '#a16207', glow: 'rgba(250, 204, 21, 0.95)' }
    },
    emerald: {
      I: { base: '#38bdf8', light: '#7dd3fc', dark: '#0369a1', glow: 'rgba(56, 189, 248, 0.75)' },
      O: { base: '#eab308', light: '#fef08a', dark: '#a16207', glow: 'rgba(234, 179, 8, 0.75)' },
      T: { base: '#818cf8', light: '#c7d2fe', dark: '#4338ca', glow: 'rgba(129, 140, 248, 0.75)' },
      S: { base: '#10b981', light: '#6ee7b7', dark: '#047857', glow: 'rgba(16, 185, 129, 0.75)' },
      Z: { base: '#e11d48', light: '#fda4af', dark: '#9f1239', glow: 'rgba(225, 29, 72, 0.75)' },
      J: { base: '#0284c7', light: '#38bdf8', dark: '#075985', glow: 'rgba(2, 132, 199, 0.75)' },
      L: { base: '#f97316', light: '#fdba74', dark: '#c2410c', glow: 'rgba(249, 115, 22, 0.75)' },
      BOMB: { base: '#ef4444', light: '#fca5a5', dark: '#991b1b', glow: 'rgba(239, 68, 68, 0.95)' },
      LASER: { base: '#14b8a6', light: '#5eead4', dark: '#0f766e', glow: 'rgba(20, 184, 166, 0.95)' },
      VORTEX: { base: '#8b5cf6', light: '#c4b5fd', dark: '#5b21b6', glow: 'rgba(139, 92, 246, 0.95)' },
      GOLD: { base: '#facc15', light: '#fef08a', dark: '#854d0e', glow: 'rgba(250, 204, 21, 0.95)' }
    }
  };

  let currentTheme = 'midnight';
  let PIECE_COLORS = { ...THEMES.midnight };

  function setTheme(theme) {
    if (!THEMES[theme]) theme = 'midnight';
    currentTheme = theme;
    PIECE_COLORS = { ...THEMES[theme] };
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
    try { localStorage.setItem('tetris_wood_theme', theme); } catch (e) {}
  }

  function loadSavedTheme() {
    try {
      const saved = localStorage.getItem('tetris_wood_theme');
      if (saved && THEMES[saved]) setTheme(saved);
    } catch (e) {}
  }

  // ==========================================
  // ระบบถ้วยรางวัลและความสำเร็จ (Achievements)
  // ==========================================
  const ACHIEVEMENTS_DEF = [
    { id: 'tetris_master', icon: '🏆', name: 'Tetris Master', desc: 'ล้าง 4 แถวพร้อมกันในครั้งเดียว' },
    { id: 'demolition_crew', icon: '💣', name: 'Demolition Crew', desc: 'ระเบิดบล็อกพร้อมกัน 6 ช่องขึ้นไป' },
    { id: 'laser_strike', icon: '⚡', name: 'Laser Strike', desc: 'ยิงเลเซอร์ล้างแถวด้วยบล็อกสายฟ้า' },
    { id: 'sub_zero', icon: '❄️', name: 'Sub-Zero', desc: 'แช่แข็งกระดานด้วยบล็อกน้ำแข็ง' },
    { id: 'gold_digger', icon: '🪙', name: 'Gold Digger', desc: 'ล้างแถวที่มีบล็อกทองคำ (+1,000 แต้ม)' },
    { id: 'combo_legend', icon: '🔥', name: 'Combo Legend', desc: 'ทำ Combo ต่อเนื่องถึงระดับ ×5' },
    { id: 'sprint_champion', icon: '⏱️', name: 'Sprint Champion', desc: 'ผ่านโหมด Sprint 40 แถวสำเร็จ' },
    { id: 'ultra_star', icon: '⭐', name: 'Blitz Master', desc: 'ทำคะแนนเกิน 10,000 ในโหมด 2 นาที' },
    { id: 'survivor', icon: '🧗', name: 'Survivor', desc: 'เอาชีวิตรอดในโหมดตึงเครียดนานเกิน 20 วินาที' }
  ];

  let unlockedAchievements = {};
  let toastTimer = null;

  function loadAchievements() {
    try {
      const saved = localStorage.getItem('tetris_wood_achievements');
      if (saved) unlockedAchievements = JSON.parse(saved);
    } catch (e) { unlockedAchievements = {}; }
  }

  function saveAchievements() {
    try { localStorage.setItem('tetris_wood_achievements', JSON.stringify(unlockedAchievements)); } catch (e) {}
  }

  function unlockAchievement(id) {
    if (unlockedAchievements[id]) return;
    const def = ACHIEVEMENTS_DEF.find(a => a.id === id);
    if (!def) return;

    unlockedAchievements[id] = Date.now();
    saveAchievements();
    showAchievementToast(def);
    audioMgr.playAchievement();
  }

  function showAchievementToast(def) {
    const toast = document.getElementById('achievementToast');
    if (!toast) return;
    document.getElementById('toastIcon').textContent = def.icon;
    document.getElementById('toastName').textContent = def.name;
    document.getElementById('toastDesc').textContent = def.desc;

    toast.classList.remove('hide');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hide');
    }, 3600);
  }

  function renderAchievementsModal() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    list.innerHTML = '';

    ACHIEVEMENTS_DEF.forEach(def => {
      const isUnlocked = !!unlockedAchievements[def.id];
      const div = document.createElement('div');
      div.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
      div.innerHTML = `
        <div class="ach-icon">${isUnlocked ? def.icon : '🔒'}</div>
        <div class="ach-info">
          <div class="ach-name">${def.name}</div>
          <div class="ach-desc">${def.desc}</div>
        </div>
        <div class="ach-status">${isUnlocked ? '✅' : '🔒'}</div>
      `;
      list.appendChild(div);
    });
  }

  // ==========================================
  // ระบบเสียง Web Audio API (BGM & SFX)
  // ==========================================
  class AudioManager {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.bgmGain = null;
      this.sfxGain = null;
      this.bgmFilter = null;
      this.noiseBuffer = null;

      this.bgmEnabled = true;
      this.sfxEnabled = true;
      this.bgmVolume = 0.4;
      this.sfxVolume = 0.6;
      try {
        const bEn = localStorage.getItem('tetris_wood_bgm_enabled');
        if (bEn !== null) this.bgmEnabled = (bEn === 'true');
        const sEn = localStorage.getItem('tetris_wood_sfx_enabled');
        if (sEn !== null) this.sfxEnabled = (sEn === 'true');
        const bVol = localStorage.getItem('tetris_wood_bgm_volume');
        if (bVol !== null) this.bgmVolume = parseFloat(bVol);
        const sVol = localStorage.getItem('tetris_wood_sfx_volume');
        if (sVol !== null) this.sfxVolume = parseFloat(sVol);
      } catch (e) {}

      this.isPlayingBgm = false;
      this.schedulerTimer = null;
      this.currentStep = 0;
      this.nextNoteTime = 0;
      this.baseTempo = 120;
      this.currentLevel = 1;
      this.isTension = false;
      this.isPaused = false;
      this.isGameOver = false;

      this.comboScale = [
        261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88,
        523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77,
        1046.50
      ];

      this.melodyNotes = [
        440, 0, 523.25, 0, 659.25, 0, 880, 0, 783.99, 0, 659.25, 0, 523.25, 0, 587.33, 0,
        659.25, 0, 587.33, 0, 523.25, 0, 493.88, 0, 440, 0, 493.88, 0, 523.25, 0, 659.25, 0,
        349.23, 0, 440, 0, 523.25, 0, 698.46, 0, 659.25, 0, 523.25, 0, 440, 0, 493.88, 0,
        523.25, 0, 493.88, 0, 440, 0, 392.00, 0, 349.23, 0, 392.00, 0, 440, 0, 523.25, 0,
        523.25, 0, 659.25, 0, 783.99, 0, 1046.5, 0, 987.77, 0, 783.99, 0, 659.25, 0, 587.33, 0,
        783.99, 0, 659.25, 0, 523.25, 0, 587.33, 0, 659.25, 0, 523.25, 0, 392.00, 0, 440, 0,
        392.00, 0, 493.88, 0, 587.33, 0, 783.99, 0, 698.46, 0, 587.33, 0, 493.88, 0, 440, 0,
        493.88, 0, 440, 0, 392.00, 0, 369.99, 0, 392.00, 0, 493.88, 0, 587.33, 0, 659.25, 0
      ];

      this.bassNotes = [
        110, 110, 164.81, 110, 110, 130.81, 164.81, 110,
        110, 110, 164.81, 110, 98.00, 110, 123.47, 130.81,
        87.31, 87.31, 130.81, 87.31, 87.31, 110, 130.81, 87.31,
        87.31, 87.31, 130.81, 87.31, 82.41, 87.31, 98.00, 110,
        130.81, 130.81, 196.00, 130.81, 130.81, 164.81, 196.00, 130.81,
        130.81, 130.81, 196.00, 130.81, 123.47, 130.81, 146.83, 164.81,
        98.00, 98.00, 146.83, 98.00, 98.00, 123.47, 146.83, 98.00,
        98.00, 98.00, 146.83, 98.00, 87.31, 98.00, 103.83, 82.41
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();

          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = 1.0;
          this.masterGain.connect(this.ctx.destination);

          this.bgmFilter = this.ctx.createBiquadFilter();
          this.bgmFilter.type = 'lowpass';
          this.bgmFilter.frequency.value = 20000;

          this.bgmGain = this.ctx.createGain();
          this.bgmGain.gain.value = this.bgmEnabled ? this.bgmVolume : 0.0001;
          this.bgmFilter.connect(this.bgmGain);
          this.bgmGain.connect(this.masterGain);

          this.sfxGain = this.ctx.createGain();
          this.sfxGain.gain.value = this.sfxEnabled ? this.sfxVolume : 0.0001;
          this.sfxGain.connect(this.masterGain);

          const bufferSize = this.ctx.sampleRate * 1.5;
          this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = this.noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    startBgm() {
      this.init();
      if (!this.ctx || this.isPlayingBgm) return;
      this.isPlayingBgm = true;
      this.isGameOver = false;
      this.currentStep = 0;
      this.nextNoteTime = this.ctx.currentTime + 0.06;
      if (this.bgmGain) {
        this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgmGain.gain.setValueAtTime(this.bgmEnabled ? this.bgmVolume : 0.0001, this.ctx.currentTime);
      }
      if (this.bgmFilter) {
        this.bgmFilter.frequency.cancelScheduledValues(this.ctx.currentTime);
        this.bgmFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
      }
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = setInterval(() => this.schedulerLoop(), 25);
    }

    stopBgm() {
      this.isPlayingBgm = false;
      clearInterval(this.schedulerTimer);
    }

    schedulerLoop() {
      if (!this.isPlayingBgm || !this.ctx) return;
      while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
        this.scheduleStep(this.currentStep, this.nextNoteTime);
        this.advanceStep();
      }
    }

    advanceStep() {
      let tempo = Math.min(180, this.baseTempo + (this.currentLevel - 1) * 3);
      if (this.isTension) tempo = Math.min(195, tempo * 1.10);
      const secondsPerBeat = 60 / tempo;
      const stepDuration = secondsPerBeat / 4;
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 64;
    }

    scheduleStep(step, time) {
      if (!this.bgmEnabled || this.bgmVolume <= 0) return;
      let tempo = Math.min(180, this.baseTempo + (this.currentLevel - 1) * 3);
      if (this.isTension) tempo = Math.min(195, tempo * 1.10);
      const stepDuration = (60 / tempo) / 4;

      // Melody
      const melFreq = this.melodyNotes[step];
      if (melFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(melFreq, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.85);
        osc.connect(gain);
        gain.connect(this.bgmFilter);
        osc.start(time);
        osc.stop(time + stepDuration * 0.85);
      }

      // Bass
      if (step % 2 === 0) {
        const bassIdx = Math.floor(step / 2);
        const bassFreq = this.bassNotes[bassIdx];
        if (bassFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(bassFreq, time);
          gain.gain.setValueAtTime(0.18, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 1.75);
          osc.connect(gain);
          gain.connect(this.bgmFilter);
          osc.start(time);
          osc.stop(time + stepDuration * 1.75);
        }
      }

      // Drums
      const beatIndex = Math.floor(step / 4) % 4;
      const stepInBeat = step % 4;
      const isKick = (stepInBeat === 0 && (beatIndex === 0 || beatIndex === 2)) ||
                     (this.isTension && stepInBeat === 2 && beatIndex === 1);
      if (isKick) this.synthesizeKick(time);

      const isSnare = (stepInBeat === 0 && (beatIndex === 1 || beatIndex === 3));
      if (isSnare) this.synthesizeSnare(time);

      const isHihat = this.isTension ? true : (step % 2 === 0);
      if (isHihat) this.synthesizeHihat(time, step % 4 === 2);
    }

    synthesizeKick(time) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.08);
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.085);
      osc.connect(gain);
      gain.connect(this.bgmFilter);
      osc.start(time);
      osc.stop(time + 0.085);
    }

    synthesizeSnare(time) {
      if (!this.ctx || !this.noiseBuffer) return;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.Q.setValueAtTime(1.2, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmFilter);
      noise.start(time);
      noise.stop(time + 0.11);
    }

    synthesizeHihat(time, open = false) {
      if (!this.ctx || !this.noiseBuffer) return;
      const dur = open ? 0.08 : 0.035;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmFilter);
      noise.start(time);
      noise.stop(time + dur);
    }

    pauseBgm() {
      if (!this.ctx || !this.isPlayingBgm) return;
      const now = this.ctx.currentTime;
      if (this.bgmFilter) {
        this.bgmFilter.frequency.cancelScheduledValues(now);
        this.bgmFilter.frequency.setTargetAtTime(400, now, 0.08);
      }
      if (this.bgmGain) {
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(this.bgmVolume * 0.35, now, 0.08);
      }
      this.isPaused = true;
    }

    resumeBgm() {
      if (!this.ctx || !this.isPlayingBgm) return;
      const now = this.ctx.currentTime;
      if (this.bgmFilter) {
        this.bgmFilter.frequency.cancelScheduledValues(now);
        this.bgmFilter.frequency.setTargetAtTime(20000, now, 0.08);
      }
      if (this.bgmGain) {
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(this.bgmEnabled ? this.bgmVolume : 0.0001, now, 0.08);
      }
      this.isPaused = false;
    }

    gameOverBgm() {
      if (!this.ctx || !this.isPlayingBgm) return;
      this.isGameOver = true;
      const now = this.ctx.currentTime;
      if (this.bgmGain) {
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
        this.bgmGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
      }
      setTimeout(() => { this.stopBgm(); }, 2100);
    }

    setTension(isTension) {
      this.isTension = isTension;
    }

    setBgmLevel(lvl) {
      this.currentLevel = lvl;
    }

    setBgmEnabled(enabled) {
      this.bgmEnabled = enabled;
      try { localStorage.setItem('tetris_wood_bgm_enabled', String(enabled)); } catch (e) {}
      if (this.bgmGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(enabled ? this.bgmVolume : 0.0001, now, 0.05);
      }
      if (enabled && !this.isPlayingBgm && gameState === 'PLAYING') this.startBgm();
    }

    setBgmVolume(vol) {
      this.bgmVolume = Math.max(0, Math.min(1, vol));
      try { localStorage.setItem('tetris_wood_bgm_volume', String(this.bgmVolume)); } catch (e) {}
      if (this.bgmGain && this.ctx && this.bgmEnabled) {
        const now = this.ctx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setTargetAtTime(this.bgmVolume, now, 0.05);
      }
    }

    setSfxEnabled(enabled) {
      this.sfxEnabled = enabled;
      try { localStorage.setItem('tetris_wood_sfx_enabled', String(enabled)); } catch (e) {}
      if (this.sfxGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.sfxGain.gain.cancelScheduledValues(now);
        this.sfxGain.gain.setTargetAtTime(enabled ? this.sfxVolume : 0.0001, now, 0.05);
      }
    }

    setSfxVolume(vol) {
      this.sfxVolume = Math.max(0, Math.min(1, vol));
      try { localStorage.setItem('tetris_wood_sfx_volume', String(this.sfxVolume)); } catch (e) {}
      if (this.sfxGain && this.ctx && this.sfxEnabled) {
        const now = this.ctx.currentTime;
        this.sfxGain.gain.cancelScheduledValues(now);
        this.sfxGain.gain.setTargetAtTime(this.sfxVolume, now, 0.05);
      }
    }

    tone(freq, duration = 0.07, type = 'triangle', gainVal = 0.12, slideFreq = null) {
      if (!this.sfxEnabled || this.sfxVolume <= 0) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const safeFreq = Math.max(20, freq || 200);
        const safeDuration = Math.max(0.01, duration || 0.05);
        const safeGain = Math.max(0.001, (gainVal || 0.1) * (this.sfxVolume || 1));
        osc.type = type;
        osc.frequency.setValueAtTime(safeFreq, now);
        if (slideFreq && slideFreq > 20) {
          osc.frequency.exponentialRampToValueAtTime(slideFreq, now + safeDuration);
        }
        gain.gain.setValueAtTime(safeGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + safeDuration);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + safeDuration);
      } catch (e) {}
    }

    playMove() { this.tone(240, 0.04, 'triangle', 0.10, 200); }
    playRotate() { this.tone(360, 0.06, 'sine', 0.12, 540); }
    playSoft() { this.tone(170, 0.03, 'sine', 0.08); }
    playLock() { this.tone(150, 0.07, 'triangle', 0.16, 95); }
    playHold() { this.tone(320, 0.07, 'sine', 0.12, 480); }
    playHardDrop() { this.tone(180, 0.07, 'triangle', 0.22, 60); }

        playSkinChange() {
      if (!this.sfxEnabled) return;
      this.init();
      this.tone(587.33, 0.12, 'sine', 0.16);
      setTimeout(() => this.tone(880.00, 0.22, 'triangle', 0.20), 70);
    }

playClear(lines, isCombo = false, comboNum = 0) {
      if (!this.sfxEnabled) return;
      this.init();

      if (lines === 4) {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          setTimeout(() => this.tone(f, 0.16, 'square', 0.16), i * 50);
        });
        return;
      }

      if (isCombo && comboNum >= 1) {
        const idx = Math.min(this.comboScale.length - 1, comboNum - 1);
        const noteFreq = this.comboScale[idx];
        this.tone(noteFreq, 0.18, 'sine', 0.18);
        setTimeout(() => this.tone(noteFreq * 1.5, 0.12, 'triangle', 0.08), 30);
        return;
      }

      if (lines === 1) {
        this.tone(480, 0.13, 'triangle', 0.15, 660);
      } else if (lines === 2) {
        this.tone(540, 0.14, 'triangle', 0.16, 740);
        setTimeout(() => this.tone(680, 0.12, 'sine', 0.12), 40);
      } else {
        this.tone(580, 0.15, 'triangle', 0.18, 880);
        setTimeout(() => this.tone(740, 0.14, 'sine', 0.14), 45);
      }
    }

    playBomb() {
      if (!this.sfxEnabled) return;
      this.init();
      if (!this.ctx || !this.noiseBuffer) return;
      const now = this.ctx.currentTime;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + 0.32);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.40, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.34);

      const osc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 0.28);
      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);
      osc.connect(subGain);
      subGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.29);
    }

    playLaser() {
      this.tone(1200, 0.22, 'sawtooth', 0.25, 180);
      setTimeout(() => this.tone(900, 0.15, 'sine', 0.15, 120), 40);
    }

    playVortex() {
      if (!this.sfxEnabled) return;
      this.init();
      this.tone(220, 0.45, 'sawtooth', 0.22, 50);
      setTimeout(() => this.tone(90, 0.35, 'sine', 0.28, 35), 80);
    }

    playSnap() {
      if (!this.sfxEnabled) return;
      this.init();
      this.tone(320, 0.08, 'triangle', 0.24, 160);
    }

    playGold() {
      [659.25, 987.77, 1318.51].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.14, 'triangle', 0.18), i * 65);
      });
    }

    playAchievement() {
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.18, 'square', 0.15), i * 60);
      });
    }

    playLevelUp() {
      [440, 554, 659, 880, 1108].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.11, 'sine', 0.13), i * 55);
      });
    }

    playGameOver() {
      [340, 300, 250, 190].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.20, 'sawtooth', 0.10), i * 120);
      });
    }
  }

  const audioMgr = new AudioManager();

  // ==========================================
  // ระบบเอฟเฟกต์ภาพ (Particles, Shake, Laser, Vortex)
  // ==========================================
  let reducedEffects = false;
  try {
    const savedRed = localStorage.getItem('tetris_wood_reduced_effects');
    if (savedRed !== null) reducedEffects = (savedRed === 'true');
  } catch (e) {}

  let shakeIntensity = 0;
  let shakeDuration = 0;
  let shakeTimer = 0;

  function triggerShake(intensity, duration) {
    if (reducedEffects) return;
    if (intensity >= shakeIntensity || shakeTimer <= 0) {
      shakeIntensity = intensity;
      shakeDuration = duration;
      shakeTimer = duration;
    }
  }

  let whiteFlashTimer = 0;
  function triggerWhiteFlash() {
    if (reducedEffects) return;
    whiteFlashTimer = 120;
  }

  // เอฟเฟกต์ลำแสงเลเซอร์
  let laserBeamRow = -1;
  let laserBeamTimer = 0;

  // เอฟเฟกต์แช่แข็งกระดาน

  let particles = [];
  let touchRipples = [];
  class WoodParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 150;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 65;
      this.vr = (Math.random() - 0.5) * 12;
      this.rot = Math.random() * Math.PI * 2;
      this.w = 4 + Math.random() * 6;
      this.h = 3 + Math.random() * 5;
      this.maxLife = 600 + Math.random() * 400;
      this.life = this.maxLife;
    }

    update(dt) {
      const sec = dt / 1000;
      this.vy += 420 * sec;
      this.x += this.vx * sec;
      this.y += this.vy * sec;
      this.rot += this.vr * sec;
      this.life -= dt;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }

    class SparkleParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 200;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 60;
      this.size = 3 + Math.random() * 5;
      this.rot = Math.random() * Math.PI;
      this.vr = (Math.random() - 0.5) * 16;
      this.maxLife = 450 + Math.random() * 350;
      this.life = this.maxLife;
    }
    update(dt) {
      const sec = dt / 1000;
      this.vy += 340 * sec;
      this.x += this.vx * sec;
      this.y += this.vy * sec;
      this.rot += this.vr * sec;
      this.life -= dt;
    }
    draw(ctx) {
      if (this.life <= 0) return;
      const p = this.life / this.maxLife;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const s = this.size * (0.4 + p * 0.8);
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.25, -s * 0.25);
      ctx.lineTo(s, 0);
      ctx.lineTo(s * 0.25, s * 0.25);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.25, s * 0.25);
      ctx.lineTo(-s, 0);
      ctx.lineTo(-s * 0.25, -s * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  let floatingTexts = [];
  class FloatingText {
    constructor(text, x, y, color = '#ffeb3b', size = 18) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = size;
      this.maxLife = 900;
      this.life = this.maxLife;
      this.vy = -38;
    }
    update(dt) {
      const sec = dt / 1000;
      this.y += this.vy * sec;
      this.vy *= 0.95;
      this.life -= dt;
    }
    draw(ctx) {
      if (this.life <= 0) return;
      const progress = this.life / this.maxLife;
      const scale = progress > 0.82 ? 1 + (progress - 0.82) * 1.6 : 1;
      ctx.save();
      ctx.globalAlpha = Math.min(1, progress * 1.5);
      ctx.font = `900 ${Math.round(this.size * scale)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

function spawnRowParticles(fullRowIndices) {
    const partsPerCell = reducedEffects ? 2 : 4;
    fullRowIndices.forEach(r => {
      const visRow = r - HIDDEN_ROWS;
      for (let c = 0; c < COLS; c++) {
        const cellType = board[r][c] || 'L';
        const color = (PIECE_COLORS[cellType] && PIECE_COLORS[cellType].base) || '#e8c42c';
        const cX = (c + 0.5) * cellSize;
        const cY = (visRow + 0.5) * cellSize;
        for (let i = 0; i < partsPerCell; i++) {
          if (particles.length < 350) {
            particles.push(new WoodParticle(
              cX + (Math.random() - 0.5) * (cellSize * 0.7),
              cY + (Math.random() - 0.5) * (cellSize * 0.7),
              color
            ));
          }
        }
        if (!reducedEffects && Math.random() < 0.65 && particles.length < 350) {
          particles.push(new SparkleParticle(cX, cY, color));
        }
      }
    });
  }

  
  function triggerVortexEffect(vY, vX) {
    audioMgr.playVortex();
    triggerShake(8, 350);

    let clearedCount = 0;
    for (let r = TOTAL_ROWS - 1; r >= HIDDEN_ROWS; r--) {
      const hasBlocks = board[r].some(cell => cell !== null);
      if (hasBlocks) {
        spawnVortexParticles(r - HIDDEN_ROWS);
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        clearedCount++;
        if (clearedCount >= 2) break;
      }
    }

    score += 300;
    document.getElementById('scoreVal').textContent = score.toLocaleString();
    spawnNextPiece();
  }

  function spawnVortexParticles(visRow) {
    if (reducedEffects) return;
    const yCenter = (visRow + 0.5) * cellSize;
    for (let c = 0; c < COLS; c++) {
      const xCenter = (c + 0.5) * cellSize;
      for (let i = 0; i < 4; i++) {
        const p = new WoodParticle(xCenter, yCenter, '#c084fc');
        p.vx = (Math.random() * 2 - 1) * 120;
        p.vy = -50 - Math.random() * 100;
        particles.push(p);
      }
    }
  }

  function spawnBombParticles(cx, cy, destroyedCells) {
    const count = reducedEffects ? 15 : 45;
    for (let i = 0; i < count; i++) {
      if (particles.length < 400) {
        const pColor = Math.random() < 0.6 ? '#ff4500' : (Math.random() < 0.5 ? '#fac473' : '#b31800');
        particles.push(new WoodParticle(cx, cy, pColor));
      }
    }
    destroyedCells.forEach(cell => {
      const visR = cell.r - HIDDEN_ROWS;
      const color = (PIECE_COLORS[cell.type] && PIECE_COLORS[cell.type].base) || '#ff4500';
      const cX = (cell.c + 0.5) * cellSize;
      const cY = (visR + 0.5) * cellSize;
      const pCount = reducedEffects ? 2 : 5;
      for (let i = 0; i < pCount; i++) {
        if (particles.length < 400) {
          particles.push(new WoodParticle(cX, cY, color));
        }
      }
    });
  }

  function spawnLaserParticles(visRow) {
    const count = reducedEffects ? 12 : 36;
    const cY = (visRow + 0.5) * cellSize;
    for (let i = 0; i < count; i++) {
      if (particles.length < 400) {
        const cX = Math.random() * (COLS * cellSize);
        particles.push(new WoodParticle(cX, cY, '#00e5ff'));
      }
    }
  }

  function spawnGoldParticles(visRow) {
    const count = reducedEffects ? 10 : 30;
    const cY = (visRow + 0.5) * cellSize;
    for (let i = 0; i < count; i++) {
      if (particles.length < 400) {
        const cX = Math.random() * (COLS * cellSize);
        particles.push(new WoodParticle(cX, cY, '#ffd700'));
      }
    }
  }

  let shockwaves = [];
  class Shockwave {
    constructor(x, y, maxR) {
      this.x = x;
      this.y = y;
      this.maxR = maxR;
      this.r = 0;
      this.life = 350;
      this.maxLife = 350;
    }
    update(dt) {
      this.life -= dt;
      const progress = 1 - Math.max(0, this.life / this.maxLife);
      this.r = this.maxR * progress;
    }
    draw(ctx) {
      if (this.life <= 0) return;
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 120, 50, ${alpha * 0.85})`;
      ctx.lineWidth = Math.max(2, (1 - this.r / this.maxR) * 6);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ==========================================
  // ตัวแปรสถานะเกม (Game State)
  // ==========================================
  let gameMode = 'Modern'; // 'Modern', 'Classic', 'Sprint', 'Ultra'
  let board = [];
  let bag = [];
  let nextQueue = [];
  let activePiece = null;

  // ==========================================
  // ระบบการเคลื่อนที่และการตกแบบสมูท (Smooth Piece Physics)
  // ==========================================
  let visualPiece = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    squashX: 1,
    squashY: 1,
    squashVel: 0,
    trail: []
  };

  function snapVisualPieceToActive() {
    if (!activePiece) return;
    visualPiece.x = activePiece.x;
    visualPiece.y = activePiece.y;
    visualPiece.targetX = activePiece.x;
    visualPiece.targetY = activePiece.y;
    visualPiece.squashX = 1;
    visualPiece.squashY = 1;
    visualPiece.squashVel = 0;
    visualPiece.trail = [];
  }

  function triggerLandingSquash(intensity = 0.86) {
    if (reducedEffects) return;
    visualPiece.squashY = intensity;
    visualPiece.squashX = 1 + (1 - intensity) * 0.75;
    visualPiece.squashVel = 0;
  }

  function spawnLandingPuff(piece, landY) {
    if (reducedEffects || !piece) return;
    const matrix = SHAPES[piece.type][piece.rot];
    const color = (PIECE_COLORS[piece.type] && PIECE_COLORS[piece.type].base) || '#ffffff';
    for (let r = matrix.length - 1; r >= 0; r--) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const px = (piece.x + c + 0.5) * cellSize;
          const py = (landY + r + 1 - HIDDEN_ROWS) * cellSize;
          for (let k = 0; k < 2; k++) {
            const p = new WoodParticle(px + (Math.random() - 0.5) * cellSize * 0.75, py, color);
            p.vy = -18 - Math.random() * 35;
            p.vx = (Math.random() - 0.5) * 75;
            p.maxLife = 200 + Math.random() * 100;
            p.life = p.maxLife;
            p.w = 3; p.h = 2;
            particles.push(p);
          }
        }
      }
    }
  }
  let holdPieceType = null;
  let canHold = true;

  let score = 0;
  let highScore = 0;
  let lines = 0;
  let level = 1;

  let gameState = 'START';
  let dropAccumulator = 0;
  let lockTimer = 0;
  let lockResets = 0;
  let isGrounded = false;

  let clearingRows = [];
  let clearAnimTimer = 0;

  // ตัวแปรสำหรับระบบ Combo
  let comboCount = -1;
  let comboTextTimer = 0;
  let comboTextCount = 0;
  let comboTextColor = '#f0f0f0';
  let boardGlowIntensity = 0;
  let targetGlowIntensity = 0;
  let isBombChainClear = false;

  // ตัวแปรสำหรับชิ้นส่วนพิเศษ (Special Blocks)
  let lastWasSpecial = false;

  // ตัวแปรสำหรับโหมดจับเวลา (Sprint & Ultra)
  let sprintElapsedMs = 0;
  let ultraTimeLeftMs = 120000; // 120 วินาที
  let sprintTargetLines = 40;
  let tensionSurvivalTimer = 0; // สำหรับจับเวลาเอาชีวิตรอดใน Tension Mode

  const inputState = { left: false, right: false, down: false, dasDir: 0, dasTimer: 0, arrTimer: 0, softDropTimer: 0 };
  let selectedRating = 5;
  let feedbackSubmitted = false;

  function getHighScoreKey() { return `tetris_wood_highscore_${gameMode.toLowerCase()}`; }
  function loadSavedData() {
    try {
      const savedHigh = localStorage.getItem(getHighScoreKey());
      highScore = savedHigh ? (parseInt(savedHigh, 10) || 0) : 0;
    } catch (e) { highScore = 0; }
    document.getElementById('highScoreVal').textContent = highScore.toLocaleString();
  }

  function saveHighScore() {
    if (score > highScore) {
      highScore = score;
      document.getElementById('highScoreVal').textContent = highScore.toLocaleString();
      try { localStorage.setItem(getHighScoreKey(), String(highScore)); } catch (e) {}
    }
  }

  function getScriptUrl() {
    try {
      if (_APP_ENDPOINT.startsWith('http://') || _APP_ENDPOINT.startsWith('https://')) {
        return _APP_ENDPOINT;
      }
      return atob(_APP_ENDPOINT.split('').reverse().join(''));
    } catch (e) {
      return _APP_ENDPOINT || '';
    }
  }

  function resolvePlayerName(rawInput) {
    const trimmed = (rawInput || '').trim();
    return trimmed !== '' ? trimmed : 'Anonymous';
  }

  function createEmptyBoard() {
    return Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null));
  }

  function refillBag() {
    const types = [...PIECE_TYPES];
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    bag.push(...types);
  }

  // สุ่มชิ้นส่วนถัดไป: โหมด Classic ใช้ 7 ชิ้นส่วนมาตรฐานของ Tetris ดั้งเดิมแท้ 100% (ไร้บล็อกพิเศษโดยสิ้นเชิง)
  // โหมด Modern/Sprint/Ultra มีโอกาส ≈ 7% ที่จะได้ชิ้นพิเศษ (Bomb, Laser, Vortex, Gold) โดยไม่เกิดติดกัน
  
  // ==========================================
  // ระบบบล็อกพิเศษแบบผสมรูปทรง (Hybrid Special Tetrominoes)
  // ==========================================
  function isSpecialPiece(type) {
    if (!type || typeof type !== 'string') return false;
    return type.includes('_BOMB') || type.includes('_LASER') || type.includes('_VORTEX') || type.includes('_GOLD') || SPECIAL_PIECES.includes(type);
  }

  function getBasePieceType(type) {
    if (!type || typeof type !== 'string') return 'T';
    if (type.includes('_')) return type.split('_')[0];
    if (SPECIAL_PIECES.includes(type)) return 'T';
    return type;
  }

  function getSpecialPieceType(type) {
    if (!type || typeof type !== 'string') return null;
    if (type.includes('_')) return type.split('_')[1];
    if (SPECIAL_PIECES.includes(type)) return type;
    return null;
  }

  // ==========================================
  // ระบบสุ่มชิ้นส่วน Tetris Classic แท้ (Authentic NES Pseudo-Randomizer)
  // ไม่ใช้ 7-Bag! ใช้สูตรการสุ่ม Roll 0..7 ของตลับ NES ดั้งเดิม 100%
  // ==========================================
  let lastClassicPiece = null;
  function pullClassicNESPiece() {
    const pieces = ['T', 'J', 'Z', 'O', 'S', 'L', 'I'];
    // 1. สุ่มตัวเลข 0 ถึง 7 (8 แบบ)
    // 2. หากออก 7 หรือตรงกับชิ้นก่อนหน้า ให้ทำการสุ่มซ้ำ (Reroll) 0 ถึง 6 อีกหนึ่งรอบ
    let roll = Math.floor(Math.random() * 8);
    if (roll === 7 || pieces[roll] === lastClassicPiece) {
      roll = Math.floor(Math.random() * 7);
    }
    const chosen = pieces[roll];
    lastClassicPiece = chosen;
    return chosen;
  }

  function pullNextType() {
    const isClassic = (gameMode === 'Classic') || (gameMode === 'Versus' && activeVsSubMode === 'Classic');
    if (isClassic) {
      return pullClassicNESPiece();
    }

    // ในโหมด Modern/Sprint/Ultra บล็อกพิเศษจะผสมกับรูปทรง Tetromino ปกติ (I, O, T, S, Z, J, L)
    if (!lastWasSpecial && Math.random() < 0.08) {
      lastWasSpecial = true;
      const base = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
      const r = Math.random();
      let spec = 'BOMB';
      if (r < 0.40) spec = 'BOMB';
      else if (r < 0.65) spec = 'LASER';
      else if (r < 0.85) spec = 'VORTEX';
      else spec = 'GOLD';
      return `${base}_${spec}`;
    }
    lastWasSpecial = false;

    if (bag.length < 7) refillBag();
    return bag.shift();
  }

  function initNextQueue() {
    bag = [];
    nextQueue = [];
    lastWasSpecial = false;
    lastClassicPiece = null;
    const isClassic = (gameMode === 'Classic') || (gameMode === 'Versus' && activeVsSubMode === 'Classic');
    if (!isClassic) refillBag();
    for (let i = 0; i < 4; i++) nextQueue.push(pullNextType());
  }

  function spawnPiece(type) {
    if (!type) type = 'T';
    const base = getBasePieceType(type);
    const matrix = (SHAPES[base] || SHAPES[type] || SHAPES.T)[0];
    const size = matrix.length;
    activePiece = {
      type,
      rot: 0,
      x: Math.floor((COLS - size) / 2),
      y: 0,
      lowestY: 0
    };
    lockTimer = 0;
    lockResets = 0;
    isGrounded = false;
    snapVisualPieceToActive();
    if (checkCollision(activePiece.x, activePiece.y, activePiece.rot)) triggerGameOver();
  }

  function spawnNextPiece() {
    let nextType = nextQueue.shift();
    if (!nextType || !SHAPES[nextType]) nextType = pullNextType() || 'T';
    nextQueue.push(pullNextType() || 'I');
    while (nextQueue.length < 4) nextQueue.push(pullNextType() || 'T');
    canHold = true;
    spawnPiece(nextType);
  }

  function checkCollision(nx, ny, nrot, pieceType = activePiece.type) {
    const base = getBasePieceType(pieceType);
    const shapeVariants = SHAPES[base] || SHAPES[pieceType] || SHAPES.T;
    const matrix = shapeVariants[nrot % shapeVariants.length];
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (!matrix[r][c]) continue;
        const bx = nx + c;
        const by = ny + r;
        if (bx < 0 || bx >= COLS || by >= TOTAL_ROWS) return true;
        if (by >= 0 && board[by][bx] !== null) return true;
      }
    }
    return false;
  }

  function resetLockDelayIfAllowed() {
    if (gameMode === 'Classic') return;
    if (isGrounded && lockResets < MAX_LOCK_RESETS) { lockTimer = 0; lockResets++; }
  }

  function moveHorizontal(dir) {
    if (gameState !== 'PLAYING' || !activePiece) return false;
    if (!checkCollision(activePiece.x + dir, activePiece.y, activePiece.rot)) {
      activePiece.x += dir;
      resetLockDelayIfAllowed();
      audioMgr.playMove();
      return true;
    }
    return false;
  }

  function rotatePiece(dir) {
    if (gameState !== 'PLAYING' || !activePiece) return;
    if (SPECIAL_PIECES.includes(activePiece.type) && !activePiece.type.includes('_')) return;
    const oldRot = activePiece.rot;
    const newRot = (oldRot + dir + 4) % 4;
    const type = getBasePieceType(activePiece.type);

    if (type === 'O') {
      activePiece.rot = newRot;
      resetLockDelayIfAllowed();
      visualPiece.squashX = 1.06; visualPiece.squashY = 1.06;
      audioMgr.playRotate();
      return;
    }

    if (gameMode === 'Classic') {
      if (!checkCollision(activePiece.x, activePiece.y, newRot)) {
        activePiece.rot = newRot;
        visualPiece.squashX = 1.06; visualPiece.squashY = 1.06;
        audioMgr.playRotate();
      }
      return;
    }

    const key = `${oldRot}->${newRot}`;
    const kickTable = (type === 'I') ? WALL_KICKS_I[key] : WALL_KICKS_JLSTZ[key];
    for (const [dx, dy] of kickTable) {
      if (!checkCollision(activePiece.x + dx, activePiece.y + dy, newRot)) {
        activePiece.x += dx;
        activePiece.y += dy;
        activePiece.rot = newRot;
        if (activePiece.y > activePiece.lowestY) { activePiece.lowestY = activePiece.y; lockResets = 0; }
        resetLockDelayIfAllowed();
        visualPiece.squashX = 1.06; visualPiece.squashY = 1.06;
        audioMgr.playRotate();
        return;
      }
    }
  }
  function getGhostY() {
    if (!activePiece) return 0;
    let gy = activePiece.y;
    while (!checkCollision(activePiece.x, gy + 1, activePiece.rot)) gy++;
    return gy;
  }

  function softDropStep() {
    if (gameState !== 'PLAYING' || !activePiece) return false;
    if (!checkCollision(activePiece.x, activePiece.y + 1, activePiece.rot)) {
      activePiece.y++;
      score += 1;
      if (activePiece.y > activePiece.lowestY) { activePiece.lowestY = activePiece.y; lockResets = 0; lockTimer = 0; }
      updateScoreUI();
      audioMgr.playSoft();
      return true;
    }
    return false;
  }

  function hardDrop() {
    if (gameState !== 'PLAYING' || !activePiece || gameMode === 'Classic') return;
    const ghostY = getGhostY();
    const dropDistance = Math.max(0, ghostY - activePiece.y);
    score += dropDistance * 2;
    activePiece.y = ghostY;
    updateScoreUI();

    visualPiece.y = ghostY;
    visualPiece.targetY = ghostY;
    triggerLandingSquash(0.72);
    spawnLandingPuff(activePiece, ghostY);

    triggerShake(2.5, 100);
    audioMgr.playHardDrop();
    lockActivePiece();
  }

  function holdCurrentPiece() {
    if (gameState !== 'PLAYING' || !activePiece || !canHold || gameMode === 'Classic') return;
    if (SPECIAL_PIECES.includes(activePiece.type) && !activePiece.type.includes('_')) return;
    audioMgr.playHold();audioMgr.playHold();
    const currentType = activePiece.type;
    if (holdPieceType === null) {
      holdPieceType = currentType;
      spawnNextPiece();
    } else {
      const swapType = holdPieceType;
      holdPieceType = currentType;
      spawnPiece(swapType);
    }
    canHold = false;
    snapVisualPieceToActive();
  }

  function checkTensionState() {
    let highestRow = TOTAL_ROWS;
    for (let r = 0; r < TOTAL_ROWS; r++) {
      if (board[r] && board[r].some(cell => cell !== null)) {
        highestRow = r;
        break;
      }
    }
    const isHigh = highestRow <= (HIDDEN_ROWS + 10);
    audioMgr.setTension(isHigh);
    return isHigh;
  }

  // ==========================================
  // การล็อกชิ้นส่วนลงกระดาน (รวมชิ้นพิเศษทั้ง 4 ชนิด)
  // ==========================================
  function lockActivePiece() {
    if (!activePiece) return;
    const pType = activePiece.type;
    const baseType = getBasePieceType(pType);
    const specType = getSpecialPieceType(pType);
    const shapeVariants = SHAPES[baseType] || SHAPES[pType] || SHAPES.T;
    const matrix = shapeVariants[activePiece.rot % shapeVariants.length];

    // หาตำแหน่งแกนพิเศษ (Core Cell) ของชิ้นส่วน
    let coreR = activePiece.y;
    let coreC = activePiece.x;
    let foundCore = false;
    const placedCells = [];

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const bx = activePiece.x + c;
          const by = activePiece.y + r;
          placedCells.push({ r: by, c: bx });
          if (!foundCore) {
            coreR = by;
            coreC = bx;
            if (r === 1 && c === 1) foundCore = true;
          }
        }
      }
    }
    if (placedCells.length > 0 && !foundCore) {
      const mid = placedCells[Math.floor(placedCells.length / 2)];
      coreR = mid.r;
      coreC = mid.c;
    }

    // 1. บล็อกระเบิด (BOMB 3x3)
    if (specType === 'BOMB' || pType === 'BOMB') {
      activePiece = null;
      for (const cell of placedCells) {
        if (cell.r >= 0 && cell.r < TOTAL_ROWS && cell.c >= 0 && cell.c < COLS) {
          board[cell.r][cell.c] = baseType;
        }
      }

      let destroyedCount = 0;
      const destroyedCells = [];
      for (let r = coreR - 1; r <= coreR + 1; r++) {
        for (let c = coreC - 1; c <= coreC + 1; c++) {
          if (r >= 0 && r < TOTAL_ROWS && c >= 0 && c < COLS) {
            if (board[r][c] !== null) {
              destroyedCount++;
              destroyedCells.push({ r, c, type: board[r][c] });
              board[r][c] = null;
            }
          }
        }
      }

      score += destroyedCount * 15;
      updateScoreUI();
      if (destroyedCount >= 6) unlockAchievement('demolition_crew');

      const bombVisY = coreR - HIDDEN_ROWS;
      const pX = (coreC + 0.5) * cellSize;
      const pY = (bombVisY + 0.5) * cellSize;

      triggerShake(10, 320);
      shockwaves.push(new Shockwave(pX, pY, cellSize * 4.0));
      spawnBombParticles(pX, pY, destroyedCells);
      audioMgr.playBomb();

      // Gravity หลังระเบิด
      for (let c = 0; c < COLS; c++) {
        const colBlocks = [];
        for (let r = 0; r < TOTAL_ROWS; r++) {
          if (board[r][c] !== null) colBlocks.push(board[r][c]);
        }
        for (let r = TOTAL_ROWS - 1; r >= 0; r--) {
          board[r][c] = colBlocks.length > 0 ? colBlocks.pop() : null;
        }
      }

      checkTensionState();
      checkFullRowsAfterSpecial();
      return;
    }

    // 2. บล็อกสายฟ้า (LASER Beam Zap)
    if (specType === 'LASER' || pType === 'LASER') {
      activePiece = null;
      for (const cell of placedCells) {
        if (cell.r >= 0 && cell.r < TOTAL_ROWS && cell.c >= 0 && cell.c < COLS) {
          board[cell.r][cell.c] = baseType;
        }
      }

      let destroyedCount = 0;
      for (let c = 0; c < COLS; c++) {
        if (board[coreR][c] !== null) destroyedCount++;
        board[coreR][c] = null;
      }
      score += Math.max(20, destroyedCount * 15);
      updateScoreUI();

      laserBeamRow = coreR - HIDDEN_ROWS;
      laserBeamTimer = 220;

      triggerShake(6, 220);
      spawnLaserParticles(laserBeamRow);
      audioMgr.playLaser();
      unlockAchievement('laser_strike');

      // Gravity หลังยิงเลเซอร์
      for (let c = 0; c < COLS; c++) {
        const colBlocks = [];
        for (let r = 0; r < TOTAL_ROWS; r++) {
          if (board[r][c] !== null) colBlocks.push(board[r][c]);
        }
        for (let r = TOTAL_ROWS - 1; r >= 0; r--) {
          board[r][c] = colBlocks.length > 0 ? colBlocks.pop() : null;
        }
      }

      checkTensionState();
      checkFullRowsAfterSpecial();
      return;
    }

    // 3. บล็อกพายุหลุมดำ (VORTEX)
    if (specType === 'VORTEX' || pType === 'VORTEX') {
      activePiece = null;
      for (const cell of placedCells) {
        if (cell.r >= 0 && cell.r < TOTAL_ROWS && cell.c >= 0 && cell.c < COLS) {
          board[cell.r][cell.c] = baseType;
        }
      }
      triggerVortexEffect(coreR, coreC);
      return;
    }

    // 4. บล็อกทองคำ (GOLD) หรือ บล็อกปกติ
    const fillType = (specType === 'GOLD') ? 'GOLD' : baseType;
    for (const cell of placedCells) {
      if (cell.r >= 0 && cell.r < TOTAL_ROWS && cell.c >= 0 && cell.c < COLS) {
        board[cell.r][cell.c] = fillType;
      }
    }
    if (specType === 'GOLD') {
      score += 250;
      updateScoreUI();
    }

    audioMgr.playLock();
    activePiece = null;
    checkNormalLockOutcome();
  }

  function checkFullRowsAfterSpecial() {
    const fullRows = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
      if (board[r].every(cell => cell !== null)) fullRows.push(r);
    }

    if (fullRows.length > 0) {
      clearingRows = fullRows;
      clearAnimTimer = 0;
      isBombChainClear = true;
      gameState = 'CLEARING';
      spawnRowParticles(fullRows);
      audioMgr.playClear(fullRows.length, false, 0);
    } else {
      spawnNextPiece();
    }
  }

  function checkNormalLockOutcome() {
    checkTensionState();

    const fullRows = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
      if (board[r].every(cell => cell !== null)) fullRows.push(r);
    }

    if (fullRows.length > 0) {
      clearingRows = fullRows;
      clearAnimTimer = 0;
      isBombChainClear = false;
      gameState = 'CLEARING';

      comboCount++;
      const count = fullRows.length;

      let clearName = count === 4 ? '💥 TETRIS!' : (count === 3 ? '⚡ TRIPLE!' : (count === 2 ? '✨ DOUBLE!' : '🌟 SINGLE!'));
      let clearColor = count === 4 ? '#f43f5e' : (count === 3 ? '#a855f7' : (count === 2 ? '#38bdf8' : '#eab308'));
      const midRow = fullRows[Math.floor(fullRows.length / 2)] - HIDDEN_ROWS;
      floatingTexts.push(new FloatingText(clearName, (COLS * cellSize) / 2, (midRow + 0.5) * cellSize, clearColor, count >= 4 ? 24 : 18));
      if (comboCount > 1) {
        floatingTexts.push(new FloatingText(`COMBO x${comboCount} 🔥`, (COLS * cellSize) / 2, (midRow + 1.3) * cellSize, '#fbbf24', 16));
      }

      // ตรวจสอบความสำเร็จ Tetris Master
      if (count >= 4) {
        unlockAchievement('tetris_master');
        triggerShake(9, 350);
        triggerWhiteFlash();
      } else if (count === 3) triggerShake(6, 250);
      else if (count === 2) triggerShake(4, 200);
      else triggerShake(3, 150);

      // ตรวจสอบความสำเร็จ Combo Legend
      if (comboCount >= 5) unlockAchievement('combo_legend');

      spawnRowParticles(fullRows);

      if (comboCount >= 2) {
        comboTextTimer = 800;
        comboTextCount = comboCount;
        if (comboCount <= 3) comboTextColor = '#f0f0f0';
        else if (comboCount <= 5) comboTextColor = '#ffd700';
        else if (comboCount <= 8) comboTextColor = '#ff8c00';
        else comboTextColor = '#ff2d75';
      }

      audioMgr.playClear(count, true, comboCount);
      updateComboUI();
    } else {
      comboCount = -1;
      updateComboUI();
      if (gameMode === 'Versus') {
        applyPendingGarbage();
        if (typeof lobbyMgr !== 'undefined') {
          lobbyMgr.sendPlayerUpdate({ score, lines, combo: comboCount, boardSummary: getMiniBoardSummary() });
        }
      }
      spawnNextPiece();
    }
  }

  
  // =========================================================================
  // ระบบการแข่งขัน Multiplayer บนกระดานหลักพร้อม Opponent HUD แบบ Real-time
  // =========================================================================
  let vsPendingGarbage = 0;
  let activeVsSubMode = "Modern";

  function updateMainGarbageBarUI() {
    const bar = document.getElementById('mainGarbageBar');
    if (bar) {
      const pct = Math.min(100, (vsPendingGarbage / 12) * 100);
      bar.style.height = pct + '%';
    }
  }

  function receiveOpponentGarbage(lineCount) {
    vsPendingGarbage += lineCount;
    updateMainGarbageBarUI();
    triggerShake(5, 200);
    const msgEl = document.getElementById('oppAttackMsg');
    if (msgEl) {
      msgEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">⚡ โดนส่งขยะ +' + lineCount + ' แถว!</span>';
      setTimeout(() => {
        if (msgEl) msgEl.textContent = 'ประลองสด Real-time';
      }, 2500);
    }
  }

  function applyPendingGarbage() {
    if (vsPendingGarbage <= 0) return;
    const count = Math.min(vsPendingGarbage, 8);
    vsPendingGarbage -= count;
    const holeCol = Math.floor(Math.random() * COLS);
    for (let i = 0; i < count; i++) {
      const row = new Array(COLS).fill('GRAY');
      row[holeCol] = null;
      board.shift();
      board.push(row);
    }
    updateMainGarbageBarUI();
    if (typeof lobbyMgr !== 'undefined') {
      lobbyMgr.sendPlayerUpdate({ score, lines, combo: comboCount, boardSummary: getMiniBoardSummary() });
    }
  }

  function getMiniBoardSummary() {
    const cols = new Array(COLS).fill(TOTAL_ROWS);
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < TOTAL_ROWS; r++) {
        if (board[r][c] !== null) {
          cols[c] = r - HIDDEN_ROWS;
          break;
        }
      }
    }
    return cols;
  }

  function renderOpponentMiniBoard(cols) {
    const c = document.getElementById('oppBoardCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    ctx.fillStyle = '#12151e';
    ctx.fillRect(0, 0, w, h);

    if (!cols || !Array.isArray(cols)) return;

    const colW = w / 10;
    const rowH = h / 20;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * colW, 0); ctx.lineTo(i * colW, h); ctx.stroke();
    }

    for (let i = 0; i < 10; i++) {
      const topRow = Math.max(0, Math.min(20, cols[i]));
      const fillH = (20 - topRow) * rowH;
      if (fillH > 0) {
        const grad = ctx.createLinearGradient(0, topRow * rowH, 0, h);
        grad.addColorStop(0, '#f43f5e');
        grad.addColorStop(1, '#9f1239');
        ctx.fillStyle = grad;
        ctx.fillRect(i * colW + 1, topRow * rowH, colW - 2, fillH);
      }
    }
  }

  function finishLineClear() {
    const count = clearingRows.length;
    const isClassic = (gameMode === 'Classic') || (gameMode === 'Versus' && activeVsSubMode === 'Classic');

    // สูตรคะแนนต้นตำรับของ Nintendo NES Tetris ดั้งเดิม:
    // Single: 40 * Level | Double: 100 * Level | Triple: 300 * Level | Tetris: 1200 * Level
    let baseScore;
    if (isClassic) {
      baseScore = ([0, 40, 100, 300, 1200][count] || 1200) * level;
    } else {
      baseScore = ([0, 100, 300, 500, 800][count] || 800) * level;
    }

    // ตรวจสอบว่าแถวที่ถูกล้างมีบล็อกทองคำ (GOLD) หรือไม่
    let goldCount = 0;
    if (!isClassic) {
      clearingRows.forEach(r => {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] === 'GOLD') {
            goldCount++;
            spawnGoldParticles(r - HIDDEN_ROWS);
          }
        }
      });

      if (goldCount > 0) {
        baseScore += goldCount * 1000;
        audioMgr.playGold();
        unlockAchievement('gold_digger');
      }

      if (!isBombChainClear && comboCount > 0) {
        baseScore += 50 * comboCount * level;
      }
    }

    score += baseScore;
    lines += count;

    // สลับสกินบล็อกอัตโนมัติเมื่อทำลายแถวได้ (เฉพาะโหมดที่มีสกิน - โหมด Classic จะไม่สลับสกินเด็ดขาด)
    if (count > 0 && autoCycleSkin && !isClassic) {
      cycleBlockSkin(count);
    }

    // ตรวจสอบการชนะในโหมด Sprint (40 แถว)
    if ((gameMode === 'Sprint' || (gameMode === 'Versus' && activeVsSubMode === 'Sprint')) && lines >= sprintTargetLines) {
      if (gameMode === 'Versus') {
        gameState = 'ROUND_OVER';
        activePiece = null;
        floatingTexts.push(new FloatingText('🏁 SPRINT 40 COMPLETE! 🏆', (COLS * cellSize) / 2, 140, '#10b981', 24));
        if (typeof lobbyMgr !== 'undefined') {
          lobbyMgr.handleLocalPlayerWinRound();
        }
        return;
      }
      triggerVictorySprint();
      return;
    }

    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel > level) {
      level = newLevel;
      audioMgr.playLevelUp();
      audioMgr.setBgmLevel(level);
    }

    const remainingRows = board.filter((_, idx) => !clearingRows.includes(idx));
    while (remainingRows.length < TOTAL_ROWS) remainingRows.unshift(Array(COLS).fill(null));
    board = remainingRows;

    if (gameMode === 'Versus') {
      let attackLines = 0;
      if (count === 4) attackLines = 4;
      else if (count === 3) attackLines = 2;
      else if (count === 2) attackLines = 1;

      if (comboCount > 1) {
        attackLines += Math.floor(comboCount / 2);
      }

      if (attackLines > 0) {
        if (vsPendingGarbage > 0) {
          if (vsPendingGarbage >= attackLines) {
            vsPendingGarbage -= attackLines;
            attackLines = 0;
          } else {
            attackLines -= vsPendingGarbage;
            vsPendingGarbage = 0;
          }
          updateMainGarbageBarUI();
        }

        if (attackLines > 0 && typeof lobbyMgr !== 'undefined') {
          lobbyMgr.sendGarbage(attackLines);
          floatingTexts.push(new FloatingText('ATTACK +' + attackLines + '! ⚡', (COLS * cellSize) / 2, 70, '#ef4444', 20));
        }
      }

      applyPendingGarbage();
      if (typeof lobbyMgr !== 'undefined') {
        lobbyMgr.sendPlayerUpdate({ score, lines, combo: comboCount, boardSummary: getMiniBoardSummary() });
      }
    }

    clearingRows = [];
    isBombChainClear = false;
    checkTensionState();
    updateScoreUI();
    updateComboUI();
    gameState = 'PLAYING';
    spawnNextPiece();
  }

  function formatTime(ms) {
    const totalSec = Math.max(0, ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const cs = Math.floor((totalSec * 100) % 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  function triggerVictorySprint() {
    gameState = 'GAMEOVER';
    activePiece = null;
    audioMgr.gameOverBgm();
    unlockAchievement('sprint_champion');

    const formattedTime = formatTime(sprintElapsedMs);
    document.getElementById('finalMode').textContent = `Sprint (⏱️ ${formattedTime})`;
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalLines').textContent = `${lines} / 40`;

    document.querySelector('#gameOverOverlay .modal-title').textContent = '🎉 ชนะแล้ว! (SPRINT)';
    document.querySelector('#gameOverOverlay .modal-subtitle').textContent = `สถิติเวลาของคุณ: ${formattedTime}`;

    prepareGameOverUI();
  }

  function triggerTimeUpUltra() {
    gameState = 'GAMEOVER';
    activePiece = null;
    audioMgr.gameOverBgm();
    audioMgr.playGameOver();

    if (score >= 10000) unlockAchievement('ultra_star');

    document.getElementById('finalMode').textContent = 'Ultra Blitz (2 นาที)';
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalLines').textContent = lines;

    document.querySelector('#gameOverOverlay .modal-title').textContent = '⏰ หมดเวลา! (TIME\'S UP)';
    document.querySelector('#gameOverOverlay .modal-subtitle').textContent = `คะแนนใน 2 นาทีของคุณ: ${score.toLocaleString()}`;

    prepareGameOverUI();
  }

  // ==========================================
  // ตารางความเร็วการตกของเครื่อง NES Tetris แท้ (Frames per Grid Drop at 60Hz)
  // Level 19 = 2 Frames (33ms) | Level 29+ = 1 Frame (16.6ms Killscreen)
  // ==========================================
  const NES_FRAMES_TABLE = [
    48, 43, 38, 33, 28, 23, 18, 13, 8, 6, // Lv 0-9
    5, 5, 5, 4, 4, 4, 3, 3, 3,             // Lv 10-18
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2          // Lv 19-28
  ];

  function getDropInterval(lvl) {
    const isClassic = (gameMode === 'Classic') || (gameMode === 'Versus' && activeVsSubMode === 'Classic');
    if (isClassic) {
      const l = Math.max(0, lvl - 1);
      const frames = (l >= 29) ? 1 : ((l < NES_FRAMES_TABLE.length) ? NES_FRAMES_TABLE[l] : 2);
      return Math.round(frames * (1000 / 60.0988));
    } else if (gameMode === 'Sprint' || gameMode === 'Ultra') {
      return Math.max(35, Math.round(620 * Math.pow(0.75, Math.min(15, lvl - 1))));
    }
    // Modern mode: starts crisp and snappy (720ms), scaling down briskly to 45ms
    return Math.max(45, Math.round(720 * Math.pow(0.79, Math.min(15, lvl - 1))));
  }

  function updateScoreUI() {
    saveHighScore();
    document.getElementById('scoreVal').textContent = score.toLocaleString();
    document.getElementById('levelVal').textContent = level;
    if (gameMode === 'Sprint') {
      document.getElementById('linesVal').textContent = `${lines}/${sprintTargetLines}`;
    } else {
      document.getElementById('linesVal').textContent = lines;
    }
  }

  function updateComboUI() {
    const comboEl = document.getElementById('comboVal');
    const comboBox = document.getElementById('comboPanelBox');
    if (!comboEl) return;
    const displayVal = Math.max(0, comboCount);
    comboEl.textContent = `×${displayVal}`;

    if (displayVal >= 9) {
      comboEl.style.color = '#ff2d75';
      if (comboBox) comboBox.style.borderColor = 'rgba(255, 45, 117, 0.6)';
    } else if (displayVal >= 6) {
      comboEl.style.color = '#ff8c00';
      if (comboBox) comboBox.style.borderColor = 'rgba(255, 140, 0, 0.5)';
    } else if (displayVal >= 4) {
      comboEl.style.color = '#ffd700';
      if (comboBox) comboBox.style.borderColor = 'rgba(255, 215, 0, 0.45)';
    } else if (displayVal >= 2) {
      comboEl.style.color = '#7ad8f5';
      if (comboBox) comboBox.style.borderColor = 'rgba(122, 216, 245, 0.35)';
    } else {
      comboEl.style.color = 'var(--text-muted)';
      if (comboBox) comboBox.style.borderColor = 'var(--border-soft)';
    }
  }

  function updateSoundBtnIcon() {
    const btn = document.getElementById('btnSound');
    if (!btn) return;
    if (!audioMgr.bgmEnabled && !audioMgr.sfxEnabled) {
      btn.textContent = '🔇 ปิดเสียง';
    } else {
      btn.textContent = '🔊 เสียง';
    }
  }

  function startNewGame() {
    if (gameMode === 'BlockBlast') { initBlockBlastGame(); return; }
    if (gameMode === 'Versus') {
      if (typeof lobbyMgr !== 'undefined') {
        lobbyMgr.openLobby();
      }
      return;
    }
    loadSavedData();
    board = createEmptyBoard();
    applyModeUIRules();
    score = 0;
    lines = 0;
    level = 1;
    comboCount = -1;
    boardGlowIntensity = 0;
    particles = [];
    shockwaves = [];
    shakeTimer = 0;
    whiteFlashTimer = 0;
    laserBeamTimer = 0;
    comboTextTimer = 0;
    lastWasSpecial = false;
    isBombChainClear = false;

    sprintElapsedMs = 0;
    ultraTimeLeftMs = 120000;
    tensionSurvivalTimer = 0;

    const isTimed = (gameMode === 'Sprint' || gameMode === 'Ultra');
    const timerBadge = document.getElementById('gameTimerBadge');
    if (timerBadge) {
      timerBadge.classList.toggle('hidden', !isTimed);
      timerBadge.style.display = isTimed ? 'inline-block' : 'none';
      if (isTimed) {
        timerBadge.textContent = (gameMode === 'Sprint') ? '00:00.00' : '02:00.00';
      }
    }

    const container = boardCanvas.parentElement;
    if (container) container.classList.remove('frozen');

    document.querySelector('#gameOverOverlay .modal-title').textContent = 'GAME OVER';
    document.querySelector('#gameOverOverlay .modal-subtitle').textContent = 'สรุปผลการเล่นของคุณ';

    updateScoreUI();
    updateComboUI();
    initNextQueue();
    holdPieceType = null;
    canHold = true;
    gameState = 'PLAYING';
    resizeCanvases();
    spawnNextPiece();
    closeOverlays();

    audioMgr.init();
    audioMgr.setBgmLevel(level);
    audioMgr.setTension(false);
    audioMgr.startBgm();
  }

  function triggerGameOver() {
    gameState = 'GAMEOVER';
    activePiece = null;
    audioMgr.gameOverBgm();
    audioMgr.playGameOver();
    saveHighScore();

    document.getElementById('finalMode').textContent = gameMode;
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('finalLevel').textContent = (gameMode === 'BlockBlast' ? '-' : String(level));
    document.getElementById('finalLines').textContent = lines.toLocaleString();

    prepareGameOverUI();
  }

  function prepareGameOverUI() {
    feedbackSubmitted = false;
    document.getElementById('feedbackInput').value = '';
    document.getElementById('feedbackStatus').textContent = '';
    document.getElementById('feedbackStatus').className = 'status-msg';

    const btnSubmit = document.getElementById('btnSubmitFeedback');
    btnSubmit.disabled = false;
    btnSubmit.textContent = '📤 ส่งสถิติและ Feedback เพื่อปลดล็อก';

    const btnAgain = document.getElementById('btnPlayAgain');
    const btnMenu = document.getElementById('btnBackToMenu');
    btnAgain.disabled = true;
    btnAgain.textContent = '🔒 เล่นใหม่อีกครั้ง (ส่ง Feedback ก่อน)';
    btnMenu.disabled = true;
    btnMenu.textContent = '🔒 กลับหน้าเลือกโหมด (ส่ง Feedback ก่อน)';

    document.getElementById('gameOverOverlay').classList.remove('hidden');
  }

  function unlockPostFeedbackButtons() {
    feedbackSubmitted = true;
    const btnAgain = document.getElementById('btnPlayAgain');
    const btnMenu = document.getElementById('btnBackToMenu');
    btnAgain.disabled = false;
    btnAgain.textContent = '🔄 เล่นใหม่อีกครั้ง';
    btnMenu.disabled = false;
    btnMenu.textContent = '🎮 กลับหน้าเลือกโหมด';
  }

  // ==========================================
  // การวาดภาพบน Canvas (Rendering & Graphics)
  // ==========================================
  const boardCanvas = document.getElementById('boardCanvas');
  const boardCtx = boardCanvas.getContext('2d');
  const holdCanvas = document.getElementById('holdCanvas');
  const holdCtx = holdCanvas.getContext('2d');
  const nextCanvas = document.getElementById('nextCanvas');
  const nextCtx = nextCanvas.getContext('2d');
  let cellSize = 30;

  function resizeCanvases() {
    if (gameMode === 'Versus') {
      const dpr = window.devicePixelRatio || 1;
      const vh = window.innerHeight || 800;
      const maxBoardH = Math.min(460, Math.max(260, vh - 220));
      const boardH = Math.floor(maxBoardH / 20) * 20;
      const cSize = boardH / 20;
      const boardW = cSize * 10;

      ['vsBoardCanvasP1', 'vsBoardCanvasP2'].forEach(id => {
        const c = document.getElementById(id);
        if (c) {
          c.width = Math.round(boardW * dpr);
          c.height = Math.round(boardH * dpr);
          c.style.width = `${boardW}px`;
          c.style.height = `${boardH}px`;
        }
      });

      ['vsHoldCanvasP1', 'vsHoldCanvasP2'].forEach(id => {
        const c = document.getElementById(id);
        if (c) {
          const s = Math.round(cSize * 3);
          c.width = Math.round(s * dpr);
          c.height = Math.round(s * dpr);
          c.style.width = `${s}px`;
          c.style.height = `${s}px`;
        }
      });

      ['vsNextCanvasP1', 'vsNextCanvasP2'].forEach(id => {
        const c = document.getElementById(id);
        if (c) {
          const sw = Math.round(cSize * 3);
          const sh = Math.round(cSize * 7.5);
          c.width = Math.round(sw * dpr);
          c.height = Math.round(sh * dpr);
          c.style.width = `${sw}px`;
          c.style.height = `${sh}px`;
        }
      });
      return;
    }

    if (gameMode === 'BlockBlast') {
      const dpr = window.devicePixelRatio || 1;
      const container = boardCanvas.parentElement;
      const rect = container ? container.getBoundingClientRect() : { width: 380, height: 380 };
      const w = Math.max(140, (rect.width || 380) - 8);
      const h = Math.max(140, (rect.height || 380) - 8);
      const size = Math.floor(Math.min(w, h));
      cellSize = Math.max(14, Math.floor(size / 10));
      const canvasSize = cellSize * 10;
      boardCanvas.width = Math.round(canvasSize * dpr);
      boardCanvas.height = Math.round(canvasSize * dpr);
      boardCanvas.style.width = `${canvasSize}px`;
      boardCanvas.style.height = `${canvasSize}px`;
      boardCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderBlockBlastDock();
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const container = boardCanvas.parentElement;
    const rect = container ? container.getBoundingClientRect() : { width: 300, height: 600 };
    const padH = 8;
    const padV = 8;
    const availW = Math.max(100, (rect.width || 300) - padH);
    const availH = Math.max(200, (rect.height || 600) - padV);

    cellSize = Math.max(12, Math.floor(Math.min(availW / COLS, availH / VISIBLE_ROWS)));
    const canvasW = cellSize * COLS;
    const canvasH = cellSize * VISIBLE_ROWS;

    boardCanvas.width = Math.round(canvasW * dpr);
    boardCanvas.height = Math.round(canvasH * dpr);
    boardCanvas.style.width = `${canvasW}px`;
    boardCanvas.style.height = `${canvasH}px`;
    boardCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const holdRect = holdCanvas.getBoundingClientRect();
    const holdW = Math.max(60, holdRect.width || (gameMode !== 'Classic' ? 76 : 0));
    const holdH = Math.max(45, holdRect.height || 56);
    holdCanvas.width = Math.round(holdW * dpr);
    holdCanvas.height = Math.round(holdH * dpr);
    holdCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const nextRect = nextCanvas.getBoundingClientRect();
    const nextW = Math.max(60, nextRect.width || 76);
    const nextH = Math.max(120, nextRect.height || 145);
    nextCanvas.width = Math.round(nextW * dpr);
    nextCanvas.height = Math.round(nextH * dpr);
    nextCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', () => {
    cachedBoardRect = null;
    resizeCanvases();
  });

  window.addEventListener('orientationchange', () => {
    cachedBoardRect = null;
    setTimeout(() => {
      resizeCanvases();
      if (gameMode === 'BlockBlast') renderBlockBlastDock();
    }, 180);
  });

  function roundRectPath(ctx, x, y, w, h, r) {
    if (w <= 0 || h <= 0) return;
    const radius = Math.max(0, Math.min(r || 0, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

    // ==========================================
  // คลังสกินบล็อก (11 Block Skins)
  // ==========================================
    const MEME_SKIN_DATA = {
    "1": "data:image/png;base64,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",
    "2": "data:image/png;base64,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",
    "3": "data:image/png;base64,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",
    "4": "data:image/png;base64,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",
    "5": "data:image/png;base64,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",
    "6": "data:image/png;base64,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",
    "7": "data:image/png;base64,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"
  };

  const MEME_IMAGES = {};
  for (let i = 1; i <= 7; i++) {
    const img = new Image();
    img.src = MEME_SKIN_DATA[i];
    MEME_IMAGES[i] = img;
  }
const BLOCK_SKINS = [
    { id: 'watermelon',  name: 'แตงโมฉ่ำ', icon: '🍉', desc: 'เนื้อแตงโมแดงสด เมล็ดดำ ขอบเขียวฉ่ำ' },
    { id: 'piggy',       name: 'น้องหมูคีย์แคป', icon: '🐷', desc: 'ปุ่มคีย์แคป 3D หน้าหมูสีชมพูน่ารัก' },
    { id: 'meme_angry',  name: 'มีมหน้าโกรธ', icon: '😡', desc: 'อีโมจิแดงกำหมัดแน่นสุดเดือด' },
    { id: 'meme_nerd',   name: 'มีมเนิร์ดแว่น', icon: '🤓', desc: 'อีโมจิแว่นหนาฟันกระต่ายสุดกวน' },
    { id: 'meme_ok',     name: 'มีมหน้ากวน OK', icon: '👌', desc: 'อีโมจิสีฟ้าหน้ากวนทำมือโอเค' },
    { id: 'meme_cry',    name: 'มีมฟ้าร้องไห้', icon: '😭', desc: 'อีโมจิสีฟ้าร้องไห้สะอึกสะอื้น' },
    { id: 'meme_scream', name: 'มีมกรีดร้อง', icon: '😱', desc: 'อีโมจิเหลืองแหกปากชูมือตกใจ' },
    { id: 'meme_rizz',   name: 'มีมคาบกุหลาบ', icon: '🌹', desc: 'อีโมจิยิ้มหล่อคาบดอกกุหลาบสุดแพรวพราว' },
    { id: 'meme_kiss',   name: 'มีมฟ้าปากจู๋', icon: '😚', desc: 'อีโมจิสีฟ้าหลับตาทำปากจู๋' },
    { id: 'pixel90s',    name: 'พิกเซล 90s', icon: '👾', desc: 'ลายจุดพิกเซล 8-bit เกมกดเรโทรยุค 90' },
    { id: 'wood',        name: 'ไม้คลาสสิก', icon: '🪵', desc: 'เนื้อไม้ธรรมชาติ หมุดทองเหลืองหรูหรา' },
    { id: 'crystal',     name: 'อัญมณีคริสตัล', icon: '💎', desc: 'ประกายเพชรเหลี่ยม แสงสะท้อนวิบวับ' },
    { id: 'neko',        name: 'น้องแมวเหมียว', icon: '🐱', desc: 'ใบหน้าเจ้าเหมียวคาวาอี้พร้อมหนวด' },
    { id: 'chocolate',   name: 'ช็อกโกแลตบาร์', icon: '🍫', desc: 'แท่งช็อกโกแลตนูนพรีเมียมเข้มข้น' },
    { id: 'donut',       name: 'โดนัทโรยเกล็ด', icon: '🍩', desc: 'เคลือบไอซิ่งหวานพร้อมเกล็ดน้ำตาลสายรุ้ง' },
    { id: 'cyber',       name: 'ไซเบอร์เมก้า', icon: '🤖', desc: 'เกราะไททาเนียม เตาปฏิกรณ์พลังงานเรืองแสง' },
    { id: 'brick',       name: 'อิฐก่อสร้าง', icon: '🧱', desc: 'อิฐบล็อกคลาสสิก ร่องปูนประสานแน่นหนา' },
    { id: 'goldaztec',   name: 'ทองคำมายา', icon: '🥇', desc: 'แท่งทองคำแท้สลักอักขระอารยธรรมโบราณ' }
  ];

  let currentBlockSkin = 'watermelon';
  let currentBlockSkinIndex = 0;
  let autoCycleSkin = true;

  try {
    const sSkin = localStorage.getItem('tetris_wood_block_skin');
    if (sSkin && BLOCK_SKINS.some(s => s.id === sSkin)) {
      currentBlockSkin = sSkin;
      currentBlockSkinIndex = BLOCK_SKINS.findIndex(s => s.id === sSkin);
    }
    const sAuto = localStorage.getItem('tetris_wood_auto_skin');
    if (sAuto !== null) {
      autoCycleSkin = (sAuto === 'true');
    }
  } catch (e) {}

  let skinToastTimer = null;
  function showSkinChangeToast(skin) {
    const toast = document.getElementById('skinChangeToast');
    const iconEl = document.getElementById('skinToastIcon');
    const textEl = document.getElementById('skinToastText');
    if (!toast || !iconEl || !textEl) return;

    iconEl.textContent = skin.icon;
    textEl.textContent = `สกินใหม่: ${skin.name}`;
    toast.classList.remove('hide');

    if (skinToastTimer) clearTimeout(skinToastTimer);
    skinToastTimer = setTimeout(() => {
      toast.classList.add('hide');
    }, 2200);
  }

  function setBlockSkin(skinId, announce = true) {
    const idx = BLOCK_SKINS.findIndex(s => s.id === skinId);
    if (idx === -1) return;
    currentBlockSkinIndex = idx;
    currentBlockSkin = skinId;
    try { localStorage.setItem('tetris_wood_block_skin', skinId); } catch (e) {}



    if (announce) {
      showSkinChangeToast(BLOCK_SKINS[idx]);
      audioMgr.playSkinChange();
    }
  }

  function cycleBlockSkin(linesCount = 1) {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * BLOCK_SKINS.length);
    } while (nextIdx === currentBlockSkinIndex && BLOCK_SKINS.length > 1);

    currentBlockSkinIndex = nextIdx;
    setBlockSkin(BLOCK_SKINS[currentBlockSkinIndex].id, true);
  }

  // =========================================================================
  // ระบบแสดงผลบล็อก Tetris Classic แท้ดั้งเดิม (Authentic NES Retro Tetris)
  // ไร้สกิน 100%, แสดงผลด้วย Bevel Pixel & จานสีคลาสสิกของ NES ที่เปลี่ยนตาม Level
  // =========================================================================
  const NES_CLASSIC_PALETTES = [
    { primary: '#0058f8', secondary: '#3cbcfc', accent: '#ffffff', shadow: '#0000a8' }, // Lv 0 (Blue / Sky)
    { primary: '#00a800', secondary: '#b8f818', accent: '#ffffff', shadow: '#005800' }, // Lv 1 (Green / Lime)
    { primary: '#d800cc', secondary: '#f878f8', accent: '#ffffff', shadow: '#800080' }, // Lv 2 (Magenta / Pink)
    { primary: '#0058f8', secondary: '#58f898', accent: '#ffffff', shadow: '#0000a8' }, // Lv 3 (Navy / Mint)
    { primary: '#e40058', secondary: '#58f858', accent: '#ffffff', shadow: '#880028' }, // Lv 4 (Crimson / Green)
    { primary: '#58f898', secondary: '#6888fc', accent: '#ffffff', shadow: '#188858' }, // Lv 5 (Sea / Cornflower)
    { primary: '#d82800', secondary: '#7c7c7c', accent: '#ffffff', shadow: '#681400' }, // Lv 6 (Rust / Silver)
    { primary: '#6844fc', secondary: '#a80020', accent: '#ffffff', shadow: '#381898' }, // Lv 7 (Purple / Crimson)
    { primary: '#0058f8', secondary: '#d82800', accent: '#ffffff', shadow: '#0000a8' }, // Lv 8 (Blue / Red)
    { primary: '#d82800', secondary: '#fc9838', accent: '#ffffff', shadow: '#681400' }  // Lv 9 (Red / Orange)
  ];

  function drawAuthenticClassicNESBlock(ctx, px, py, size, type) {
    if (size <= 2 || isNaN(size)) return;
    const base = getBasePieceType(type);
    const palIdx = Math.max(0, (level - 1) % 10);
    const pal = NES_CLASSIC_PALETTES[palIdx] || NES_CLASSIC_PALETTES[0];

    let mainColor, lightColor, shadowColor;
    if (base === 'I') {
      mainColor = pal.accent;
      lightColor = '#ffffff';
      shadowColor = pal.primary;
    } else if (base === 'S' || base === 'Z' || base === 'L') {
      mainColor = pal.secondary;
      lightColor = '#ffffff';
      shadowColor = '#000000';
    } else {
      // T, J, O
      mainColor = pal.primary;
      lightColor = pal.secondary;
      shadowColor = '#000000';
    }

    const bx = Math.floor(px);
    const by = Math.floor(py);
    const bs = Math.floor(size);
    const bevel = Math.max(1, Math.round(size / 8));

    // 1. Black outer retro boundary
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx, by, bs, bs);

    // 2. Main base fill
    ctx.fillStyle = mainColor;
    ctx.fillRect(bx + 1, by + 1, bs - 2, bs - 2);

    // 3. Top & Left light highlight (NES Bevel)
    ctx.fillStyle = lightColor;
    ctx.fillRect(bx + 1, by + 1, bs - 2, bevel);
    ctx.fillRect(bx + 1, by + 1, bevel, bs - 2);

    // 4. Bottom & Right dark shadow
    ctx.fillStyle = shadowColor;
    ctx.fillRect(bx + 1, by + bs - 1 - bevel, bs - 2, bevel);
    ctx.fillRect(bx + bs - 1 - bevel, by + 1, bevel, bs - 2);

    // 5. Authentic NES Interior Pattern:
    if (base === 'O') {
      // Nested dual-square box
      const oPad = Math.max(2, Math.round(size * 0.24));
      ctx.fillStyle = lightColor;
      ctx.fillRect(bx + oPad, by + oPad, bs - oPad * 2, bs - oPad * 2);
      ctx.fillStyle = mainColor;
      ctx.fillRect(bx + oPad + 1, by + oPad + 1, bs - (oPad + 1) * 2, bs - (oPad + 1) * 2);
    } else if (base === 'I') {
      // Center vertical pillared stripe
      const iPad = Math.max(2, Math.round(size * 0.28));
      ctx.fillStyle = pal.primary;
      ctx.fillRect(bx + iPad, by + 2, bs - iPad * 2, bs - 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + iPad + 1, by + 3, bs - (iPad + 1) * 2, bs - 6);
    } else {
      // T, J, S, Z, L: The iconic NES white specular square in upper-left
      const dotSize = Math.max(2, Math.round(size * 0.22));
      const dotX = bx + Math.round(size * 0.22);
      const dotY = by + Math.round(size * 0.22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dotX, dotY, dotSize, dotSize);
    }
  }

  function drawWoodenBlock(ctx, px, py, size, type, isGlowing = false, alpha = 1) {
    if (size <= 2 || alpha <= 0 || isNaN(size) || isNaN(px) || isNaN(py)) return;
    if (!type) type = 'T';

    ctx.save();
    ctx.globalAlpha = alpha;

    // ==========================================
    // 🕹️ โหมด Classic แท้ 100% (ไร้สกิน ไร้เงา ไร้แสงสะท้อน - Pure Authentic NES)
    // ==========================================
    const isClassicMode = (gameMode === 'Classic') || (gameMode === 'Versus' && activeVsSubMode === 'Classic');
    if (isClassicMode && type !== 'GARBAGE') {
      drawAuthenticClassicNESBlock(ctx, px, py, size, type);
      ctx.restore();
      return;
    }

    let palette = PIECE_COLORS[type];
    if (!palette) {
      palette = (THEMES.midnight && THEMES.midnight[type]) || (THEMES.midnight && THEMES.midnight.T) || { base: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', glow: 'rgba(56,189,248,0.75)' };
    }
    const pad = Math.max(1, size * 0.045);
    const bx = px + pad, by = py + pad, bw = size - pad * 2, bh = size - pad * 2;
    if (bw <= 0 || bh <= 0) { ctx.restore(); return; }
    const radius = Math.max(1, size * 0.18);

    
    // ชิ้นส่วนขยะ (GARBAGE Rows สำหรับโหมด Versus)
    if (type === 'GARBAGE') {
      const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      grad.addColorStop(0, '#64748b'); grad.addColorStop(0.5, '#475569'); grad.addColorStop(1, '#1e293b');
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = Math.max(1, size * 0.05); ctx.stroke();
      const rivRad = Math.max(1, size * 0.06);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(bx + bw * 0.2, by + bh * 0.2, rivRad, 0, Math.PI * 2);
      ctx.arc(bx + bw * 0.8, by + bh * 0.2, rivRad, 0, Math.PI * 2);
      ctx.arc(bx + bw * 0.2, by + bh * 0.8, rivRad, 0, Math.PI * 2);
      ctx.arc(bx + bw * 0.8, by + bh * 0.8, rivRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // ชิ้นพิเศษ: BOMB (💣 ระเบิด 3x3)
    if (type === 'BOMB') {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.012);
      ctx.shadowColor = 'rgba(255, 60, 20, 1)';
      ctx.shadowBlur = size * (0.35 + pulse * 0.45);
      const grad = ctx.createRadialGradient(bx + bw * 0.5, by + bh * 0.5, 2, bx + bw * 0.5, by + bh * 0.5, bw * 0.7);
      grad.addColorStop(0, '#ff9933'); grad.addColorStop(0.45, '#ff3b1e'); grad.addColorStop(1, '#8b0000');
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = grad; ctx.fill();
      ctx.shadowBlur = 0;

      // วาดตัวระเบิด 3D Vector ทรงกลมพร้อมสายชนวนและประกายไฟ (ไม่พึ่งพาฟอนต์ระบบ หมดปัญหาช่องสี่เหลี่ยม 100%)
      const cx = bx + bw * 0.5, cy = by + bh * 0.54;
      const bRad = size * 0.28;
      // ตัวลูกระเบิดสีดำเงา
      const bGrad = ctx.createRadialGradient(cx - bRad * 0.35, cy - bRad * 0.35, bRad * 0.1, cx, cy, bRad);
      bGrad.addColorStop(0, '#555e6d'); bGrad.addColorStop(0.5, '#1e222b'); bGrad.addColorStop(1, '#0a0c10');
      ctx.beginPath(); ctx.arc(cx, cy, bRad, 0, Math.PI * 2);
      ctx.fillStyle = bGrad; ctx.fill();
      // ขั้วหัวระเบิด
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(cx - size * 0.07, cy - bRad - size * 0.06, size * 0.14, size * 0.07);
      // สายชนวน
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = Math.max(1.5, size * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx, cy - bRad - size * 0.05);
      ctx.quadraticCurveTo(cx + size * 0.15, cy - bRad - size * 0.16, cx + size * 0.12, cy - bRad - size * 0.22);
      ctx.stroke();
      // ประกายไฟระเบิดวิบวับ
      ctx.fillStyle = pulse > 0.5 ? '#fef08a' : '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + size * 0.12, cy - bRad - size * 0.22, size * (0.07 + pulse * 0.04), 0, Math.PI * 2);
      ctx.fill();

      // วาด Emoji รองรับฟอนต์ Segoe UI Emoji / Apple Color Emoji เสริม
      ctx.font = `${Math.round(size * 0.58)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.restore();
      return;
    }

    // ชิ้นพิเศษ: LASER (⚡ ลำแสงเลเซอร์)
    if (type === 'LASER') {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.016);
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = size * (0.4 + pulse * 0.5);
      const grad = ctx.createRadialGradient(bx + bw * 0.5, by + bh * 0.5, 2, bx + bw * 0.5, by + bh * 0.5, bw * 0.7);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.4, '#00e5ff'); grad.addColorStop(1, '#005f73');
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = grad; ctx.fill();
      ctx.shadowBlur = 0;

      // วาดสายฟ้า Vector นีออนเรืองแสงคมกริบ 100%
      const cx = bx + bw * 0.5, cy = by + bh * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.moveTo(size * 0.05, -size * 0.36);
      ctx.lineTo(-size * 0.20, size * 0.02);
      ctx.lineTo(-size * 0.02, size * 0.02);
      ctx.lineTo(-size * 0.08, size * 0.36);
      ctx.lineTo(size * 0.22, -size * 0.06);
      ctx.lineTo(size * 0.04, -size * 0.06);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      return;
    }

    // ชิ้นพิเศษ: VORTEX (🌀 พายุหลุมดำดูด 2 แถวล่าง)
    if (type === 'VORTEX') {
      const angle = (Date.now() * 0.005) % (Math.PI * 2);
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = size * 0.5;
      const grad = ctx.createRadialGradient(bx + bw * 0.5, by + bh * 0.5, 2, bx + bw * 0.5, by + bh * 0.5, bw * 0.7);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.4, '#a855f7'); grad.addColorStop(1, '#3b0764');
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = grad; ctx.fill();
      ctx.shadowBlur = 0;

      // วาดพายุหมุนอวกาศ Vector Galaxy Spiral 3D
      ctx.save();
      ctx.translate(bx + bw * 0.5, by + bh * 0.5);
      ctx.rotate(angle);
      for (let arm = 0; arm < 3; arm++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.16, size * 0.08, size * 0.28, -size * 0.18);
        ctx.strokeStyle = arm === 0 ? '#ffffff' : (arm === 1 ? '#c084fc' : '#38bdf8');
        ctx.lineWidth = Math.max(2, size * 0.09);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, size * 0.10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();

      ctx.restore();
      return;
    }

    // ชิ้นพิเศษ: GOLD (🪙 เหรียญทองคำ 3D โบนัสแต้ม)
    if (type === 'GOLD') {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.010);
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = size * (0.35 + pulse * 0.45);
      const grad = ctx.createRadialGradient(bx + bw * 0.5, by + bh * 0.5, 2, bx + bw * 0.5, by + bh * 0.5, bw * 0.7);
      grad.addColorStop(0, '#fffbe6'); grad.addColorStop(0.4, '#ffd700'); grad.addColorStop(1, '#b8860b');
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = grad; ctx.fill();
      ctx.shadowBlur = 0;

      // วาดเหรียญทองคำนูน 3D แท้พร้อมลวดลายดาวประกาย (แก้ปัญหาช่องสี่เหลี่ยม ▯ บน Windows 100%)
      const cx = bx + bw * 0.5, cy = by + bh * 0.5;
      const cRad = size * 0.32;
      // ขอบนอกเหรียญทอง
      ctx.beginPath(); ctx.arc(cx, cy, cRad, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = Math.max(1.5, size * 0.06); ctx.stroke();
      // วงในเหรียญ
      ctx.beginPath(); ctx.arc(cx, cy, cRad * 0.74, 0, Math.PI * 2);
      const cGrad = ctx.createRadialGradient(cx - cRad * 0.3, cy - cRad * 0.3, 1, cx, cy, cRad * 0.74);
      cGrad.addColorStop(0, '#fef08a'); cGrad.addColorStop(0.5, '#eab308'); cGrad.addColorStop(1, '#a16207');
      ctx.fillStyle = cGrad; ctx.fill();
      // ลายดาวทองนูนตรงกลางเหรียญ
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        ctx.lineTo(Math.cos((18 + s * 72) * 0.01745) * cRad * 0.48, -Math.sin((18 + s * 72) * 0.01745) * cRad * 0.48);
        ctx.lineTo(Math.cos((54 + s * 72) * 0.01745) * cRad * 0.22, -Math.sin((54 + s * 72) * 0.01745) * cRad * 0.22);
      }
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fef08a'; ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();

      ctx.restore();
      return;
    }

    // ==========================================
    // ลวดลายสกินบล็อกปกติ (11 Block Skins)
    // ==========================================
    if (isGlowing) {
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = size * 0.55;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = size * 0.14;
      ctx.shadowOffsetY = size * 0.06;
    }

    function drawMemeEmojiBlock(imgIndex) {
      // 1. ฐาน Beveled Pedestal 3D กระจกนูนตามสีบล็อก (ไม่มีพื้นหลังสีขาวเด็ดขาด!)
      roundRectPath(ctx, bx, by, bw, bh, radius);
      const bgGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
      bgGrad.addColorStop(0, palette.light);
      bgGrad.addColorStop(0.35, palette.base);
      bgGrad.addColorStop(1, palette.dark);
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // 2. ขอบแสงนูน 3D รอบบล็อก
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = Math.max(1, size * 0.055);
      ctx.stroke();

      // 3. วงแสงสะท้อนทรงกลมบนผิวกระจก (Glass Specular Sheen)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(bx + bw * 0.5, by + bh * 0.22, bw * 0.38, bh * 0.16, 0, 0, Math.PI * 2);
      const shineGrad = ctx.createLinearGradient(bx, by, bx, by + bh * 0.4);
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = shineGrad;
      ctx.fill();
      ctx.restore();

      // 4. วาดอีโมจิแบบใส (Transparent PNG) พร้อมเงา 3D ตกกระทบลอยตัวสวยงาม
      const img = MEME_IMAGES[imgIndex];
      if (img && img.complete) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = Math.max(3, size * 0.14);
        ctx.shadowOffsetY = Math.max(1, size * 0.06);
        const iconPad = Math.max(2, size * 0.08);
        ctx.drawImage(img, bx + iconPad, by + iconPad, bw - iconPad * 2, bh - iconPad * 2);
        ctx.restore();
      }
    }

    if (currentBlockSkin === 'meme_angry') {
      drawMemeEmojiBlock(1);
    } else if (currentBlockSkin === 'meme_nerd') {
      drawMemeEmojiBlock(2);
    } else if (currentBlockSkin === 'meme_ok') {
      drawMemeEmojiBlock(3);
    } else if (currentBlockSkin === 'meme_cry') {
      drawMemeEmojiBlock(4);
    } else if (currentBlockSkin === 'meme_scream') {
      drawMemeEmojiBlock(5);
    } else if (currentBlockSkin === 'meme_rizz') {
      drawMemeEmojiBlock(6);
    } else if (currentBlockSkin === 'meme_kiss') {
      drawMemeEmojiBlock(7);

    } else if (currentBlockSkin === 'watermelon') {
      // 🍉 1. แตงโมฉ่ำ (Watermelon Skin - จากภาพที่ 2 ของผู้ใช้)
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = '#1e6828'; ctx.fill();
      const rindPad = Math.max(1.5, size * 0.08);
      roundRectPath(ctx, bx + rindPad, by + rindPad, bw - rindPad * 2, bh - rindPad * 2, Math.max(2, radius - 1));
      ctx.fillStyle = '#a8e78e'; ctx.fill();
      const pulpPad = Math.max(2.5, size * 0.14);
      roundRectPath(ctx, bx + pulpPad, by + pulpPad, bw - pulpPad * 2, bh - pulpPad * 2, Math.max(2, radius - 2));
      const wGrad = ctx.createRadialGradient(bx + bw * 0.4, by + bh * 0.4, 2, bx + bw * 0.5, by + bh * 0.5, bw * 0.6);
      wGrad.addColorStop(0, '#ff4766'); wGrad.addColorStop(1, '#c91a34');
      ctx.fillStyle = wGrad; ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      // เมล็ดแตงโมสีดำ 2 เมล็ด
      ctx.fillStyle = '#111';
      const sr = Math.max(1.2, size * 0.06);
      ctx.beginPath(); ctx.ellipse(bx + bw * 0.38, by + bh * 0.42, sr, sr * 1.5, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(bx + bw * 0.64, by + bh * 0.62, sr, sr * 1.5, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.arc(bx + bw * 0.38 - sr * 0.3, by + bh * 0.42 - sr * 0.4, sr * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + bw * 0.64 - sr * 0.3, by + bh * 0.62 - sr * 0.4, sr * 0.35, 0, Math.PI * 2); ctx.fill();

    } else if (currentBlockSkin === 'piggy') {
      // 🐷 2. น้องหมูคีย์แคป (Cute Piggy Keycap - จากภาพที่ 1 ของผู้ใช้)
      roundRectPath(ctx, bx, by, bw, bh, radius);
      const keyGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
      keyGrad.addColorStop(0, '#ffffff'); keyGrad.addColorStop(1, '#d8dae2');
      ctx.fillStyle = keyGrad; ctx.fill();
      ctx.strokeStyle = '#babdc9'; ctx.lineWidth = Math.max(1, size * 0.04); ctx.stroke();
      const topPad = Math.max(2, size * 0.1);
      roundRectPath(ctx, bx + topPad, by + topPad * 0.8, bw - topPad * 2, bh - topPad * 2, Math.max(2, radius - 1));
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      // หูหมูสีชมพู 2 ข้าง
      ctx.fillStyle = '#ff9ebd';
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.22, by + bh * 0.32); ctx.lineTo(bx + bw * 0.32, by + bh * 0.18); ctx.lineTo(bx + bw * 0.40, by + bh * 0.34); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.78, by + bh * 0.32); ctx.lineTo(bx + bw * 0.68, by + bh * 0.18); ctx.lineTo(bx + bw * 0.60, by + bh * 0.34); ctx.fill();
      // ตาหมู 2 ข้างพร้อมประกาย
      ctx.fillStyle = '#222';
      const eyeY = by + bh * 0.45;
      ctx.beginPath(); ctx.arc(bx + bw * 0.34, eyeY, size * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + bw * 0.66, eyeY, size * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(bx + bw * 0.32, eyeY - 1, size * 0.02, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + bw * 0.64, eyeY - 1, size * 0.02, 0, Math.PI * 2); ctx.fill();
      // จมูกหมูสีชมพูเข้มพร้อมรูจมูก
      ctx.fillStyle = '#ff82a5';
      ctx.beginPath(); ctx.ellipse(bx + bw * 0.5, by + bh * 0.64, size * 0.18, size * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c74468';
      ctx.beginPath(); ctx.arc(bx + bw * 0.44, by + bh * 0.64, size * 0.035, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + bw * 0.56, by + bh * 0.64, size * 0.035, 0, Math.PI * 2); ctx.fill();

    } else if (currentBlockSkin === 'pixel90s') {
      // 👾 3. พิกเซลเรโทร 90s (90s Retro Arcade Pixel)
      const pThick = Math.max(2, Math.round(size * 0.14));
      ctx.fillStyle = palette.base; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = palette.light;
      ctx.fillRect(bx, by, bw, pThick); ctx.fillRect(bx, by, pThick, bh);
      ctx.fillStyle = palette.dark;
      ctx.fillRect(bx, by + bh - pThick, bw, pThick); ctx.fillRect(bx + bw - pThick, by, pThick, bh);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(bx + pThick * 1.5, by + pThick * 1.5, pThick, pThick);

    } else if (currentBlockSkin === 'crystal') {
      // 💎 4. อัญมณีคริสตัล (Crystal Gem)
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = palette.dark; ctx.fill();
      ctx.fillStyle = palette.light;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw * 0.5, by + bh * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = palette.base;
      ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw * 0.5, by + bh * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = palette.light; ctx.globalAlpha = alpha * 0.7;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw * 0.5, by + bh * 0.5); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = alpha; ctx.shadowBlur = 0;
      // ประกายดาววิบวับ
      ctx.fillStyle = '#ffffff';
      const spX = bx + bw * 0.28, spY = by + bh * 0.28, spS = size * 0.12;
      ctx.beginPath();
      ctx.moveTo(spX, spY - spS); ctx.lineTo(spX + spS * 0.3, spY); ctx.lineTo(spX + spS, spY);
      ctx.lineTo(spX + spS * 0.3, spY); ctx.lineTo(spX, spY + spS); ctx.lineTo(spX - spS * 0.3, spY);
      ctx.lineTo(spX - spS, spY); ctx.lineTo(spX - spS * 0.3, spY); ctx.closePath(); ctx.fill();

    } else if (currentBlockSkin === 'neko') {
      // 🐱 5. น้องแมวเหมียว (Kawaii Neko Cat)
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = palette.base; ctx.fill();
      ctx.shadowBlur = 0;
      // หูแมว
      ctx.fillStyle = '#ffaec9';
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.18, by + bh * 0.3); ctx.lineTo(bx + bw * 0.28, by + bh * 0.12); ctx.lineTo(bx + bw * 0.38, by + bh * 0.3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.82, by + bh * 0.3); ctx.lineTo(bx + bw * 0.72, by + bh * 0.12); ctx.lineTo(bx + bw * 0.62, by + bh * 0.3); ctx.fill();
      // ตาแมวยิ้ม (^  ^)
      ctx.strokeStyle = '#222'; ctx.lineWidth = Math.max(1.2, size * 0.05); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(bx + bw * 0.32, by + bh * 0.48, size * 0.08, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx + bw * 0.68, by + bh * 0.48, size * 0.08, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.fillStyle = '#ff7b9f';
      ctx.beginPath(); ctx.arc(bx + bw * 0.5, by + bh * 0.58, size * 0.035, 0, Math.PI * 2); ctx.fill();
      // หนวดแมว 4 เส้น
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.1, by + bh * 0.52); ctx.lineTo(bx + bw * 0.22, by + bh * 0.55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.1, by + bh * 0.64); ctx.lineTo(bx + bw * 0.22, by + bh * 0.61); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.9, by + bh * 0.52); ctx.lineTo(bx + bw * 0.78, by + bh * 0.55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.9, by + bh * 0.64); ctx.lineTo(bx + bw * 0.78, by + bh * 0.61); ctx.stroke();

    } else if (currentBlockSkin === 'chocolate') {
      // 🍫 6. ช็อกโกแลตบาร์ (Creamy Chocolate Bar)
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = '#3a1f0f'; ctx.fill();
      const cPad = Math.max(2, size * 0.15);
      roundRectPath(ctx, bx + cPad, by + cPad, bw - cPad * 2, bh - cPad * 2, Math.max(2, radius - 1));
      const chocGrad = ctx.createLinearGradient(bx + cPad, by + cPad, bx + bw - cPad, by + bh - cPad);
      chocGrad.addColorStop(0, '#5f351a'); chocGrad.addColorStop(1, '#2c1407');
      ctx.fillStyle = chocGrad; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.arc(bx + cPad * 1.6, by + cPad * 1.6, size * 0.06, 0, Math.PI * 2); ctx.fill();

    } else if (currentBlockSkin === 'donut') {
      // 🍩 7. โดนัทโรยเกล็ดน้ำตาล (Sweet Donut & Sprinkles)
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = '#d29656'; ctx.fill();
      const fPad = Math.max(1, size * 0.08);
      roundRectPath(ctx, bx + fPad, by + fPad, bw - fPad * 2, bh - fPad * 2, radius);
      ctx.fillStyle = palette.base; ctx.fill();
      ctx.shadowBlur = 0;
      // เกล็ดน้ำตาลสีรุ้ง
      const spColors = ['#ffffff', '#ffeb3b', '#00e5ff', '#ff4081', '#76ff03'];
      const spOffsets = [
        [0.3, 0.35, 0.4], [0.65, 0.3, -0.6], [0.45, 0.65, 0.8], [0.75, 0.7, 0.2], [0.25, 0.75, -0.3]
      ];
      spOffsets.forEach(([rx, ry, ang], i) => {
        ctx.save();
        ctx.translate(bx + bw * rx, by + bh * ry);
        ctx.rotate(ang);
        ctx.fillStyle = spColors[i % spColors.length];
        roundRectPath(ctx, -size * 0.08, -size * 0.03, size * 0.16, size * 0.06, 2);
        ctx.fill();
        ctx.restore();
      });

    } else if (currentBlockSkin === 'cyber') {
      // 🤖 8. ไซเบอร์เมก้า (Sci-Fi Cyber Core)
      ctx.fillStyle = '#141822'; ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = palette.base; ctx.lineWidth = Math.max(1, size * 0.05);
      ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.15, by + bh * 0.5); ctx.lineTo(bx + bw * 0.4, by + bh * 0.5);
      ctx.moveTo(bx + bw * 0.85, by + bh * 0.5); ctx.lineTo(bx + bw * 0.6, by + bh * 0.5);
      ctx.stroke();
      ctx.shadowBlur = 0;
      const corePulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      ctx.fillStyle = palette.glow || '#00f0ff';
      ctx.beginPath(); ctx.arc(bx + bw * 0.5, by + bh * 0.5, size * (0.12 + corePulse * 0.04), 0, Math.PI * 2); ctx.fill();

    } else if (currentBlockSkin === 'brick') {
      // 🧱 9. อิฐก่อสร้าง (Voxel Brickwork)
      ctx.fillStyle = '#b0b3b8'; ctx.fillRect(bx, by, bw, bh);
      ctx.shadowBlur = 0;
      const bPad = Math.max(1, size * 0.06);
      ctx.fillStyle = palette.base;
      ctx.fillRect(bx + bPad, by + bPad, bw - bPad * 2, (bh - bPad * 3) / 2);
      const bHalf = (bw - bPad * 3) / 2;
      const bY2 = by + bPad * 2 + (bh - bPad * 3) / 2;
      ctx.fillRect(bx + bPad, bY2, bHalf, (bh - bPad * 3) / 2);
      ctx.fillRect(bx + bPad * 2 + bHalf, bY2, bHalf, (bh - bPad * 3) / 2);

    } else if (currentBlockSkin === 'goldaztec') {
      // 🥇 10. ทองคำมายา (Golden Aztec Ingot)
      const goldGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      goldGrad.addColorStop(0, '#fff4b8'); goldGrad.addColorStop(0.3, '#ffd700'); goldGrad.addColorStop(1, '#996515');
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = goldGrad; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(90, 50, 0, 0.65)'; ctx.lineWidth = Math.max(1, size * 0.06);
      const gPad = size * 0.22;
      ctx.strokeRect(bx + gPad, by + gPad, bw - gPad * 2, bh - gPad * 2);
      ctx.fillStyle = 'rgba(90, 50, 0, 0.65)';
      ctx.fillRect(bx + bw * 0.42, by + bh * 0.42, size * 0.16, size * 0.16);

    } else {
      // 🪵 11. ไม้คลาสสิก (Classic Handcrafted Wood)
      const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      grad.addColorStop(0, palette.light);
      grad.addColorStop(0.35, palette.base);
      grad.addColorStop(1, palette.dark);
      roundRectPath(ctx, bx, by, bw, bh, radius);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = Math.max(1, size * 0.055);
      ctx.beginPath();
      ctx.moveTo(bx + radius * 0.6, by + bh - radius * 0.6);
      ctx.lineTo(bx + radius * 0.6, by + radius * 0.6);
      ctx.lineTo(bx + bw - radius * 0.6, by + radius * 0.6);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
      const rOff = Math.max(3, size * 0.18);
      ctx.beginPath(); ctx.arc(bx + rOff, by + rOff, size * 0.045, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + bw - rOff, by + bh - rOff, size * 0.045, 0, Math.PI * 2); ctx.fill();
    }    ctx.restore();
  }

  function drawGhostBlock(ctx, px, py, size, type) {
    // วาดเป็นชิ้นส่วนสกิน / อีโมจิตัวจริงแบบโปร่งแสง (Real Translucent Ghost Emoji & Skin)
    // แทนที่กรอบสี่เหลี่ยมกลวงว่างเปล่า (หมดปัญหากล่องสี่เหลี่ยมตามภาพของผู้ใช้ 100%)
    drawWoodenBlock(ctx, px, py, size, type, false, 0.38);

    // หากไม่ใช่ชิ้นพิเศษและไม่ใช่สกินอีโมจิ จึงค่อยใส่ขอบนีออนบางๆ (สำหรับอีโมจิและชิ้นพิเศษจะแสดงตัวจริงโปร่งแสง ไร้กรอบสี่เหลี่ยมขัดตา 100%)
    if (!SPECIAL_PIECES.includes(type) && !currentBlockSkin.startsWith('meme_')) {
      const palette = PIECE_COLORS[type];
      if (palette) {
        const pad = Math.max(1, size * 0.045);
        const bx = px + pad, by = py + pad, bw = size - pad * 2, bh = size - pad * 2;
        const radius = Math.max(3, size * 0.18);
        ctx.save();
        roundRectPath(ctx, bx, by, bw, bh, radius);
        ctx.strokeStyle = palette.light || '#ffffff';
        ctx.globalAlpha = 0.40;
        ctx.lineWidth = Math.max(1, size * 0.035);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function renderBoard() {
    if (gameMode === 'BlockBlast') {
      renderBlockBlastBoard();
      return;
    }

    const width = COLS * cellSize, height = VISIBLE_ROWS * cellSize;
    boardCtx.clearRect(0, 0, width, height);

    let sX = 0, sY = 0;
    if (shakeTimer > 0 && !reducedEffects && shakeDuration > 0) {
      const progress = shakeTimer / shakeDuration;
      const currentAmp = shakeIntensity * progress;
      sX = (Math.random() * 2 - 1) * currentAmp;
      sY = (Math.random() * 2 - 1) * currentAmp;
    }

    boardCtx.save();
    boardCtx.translate(sX, sY);

    const bgGrad = boardCtx.createLinearGradient(0, 0, 0, height);
    if (currentTheme === 'neon') {
      bgGrad.addColorStop(0, '#101426'); bgGrad.addColorStop(1, '#0a0c16');
    } else if (currentTheme === 'gameboy') {
      bgGrad.addColorStop(0, '#8b956d'); bgGrad.addColorStop(1, '#77825b');
    } else {
      bgGrad.addColorStop(0, '#262a35'); bgGrad.addColorStop(1, '#1e222b');
    }
    boardCtx.fillStyle = bgGrad;
    boardCtx.fillRect(0, 0, width, height);

    for (let r = HIDDEN_ROWS; r < TOTAL_ROWS; r++) {
      const isRowClearing = (gameState === 'CLEARING' && clearingRows.includes(r));
      const visRow = r - HIDDEN_ROWS;
      for (let c = 0; c < COLS; c++) {
        const cellType = board[r][c];
        if (!cellType) continue;
        if (isRowClearing) {
          drawWoodenBlock(boardCtx, c * cellSize, visRow * cellSize, cellSize, cellType, true, Math.max(0, 1 - clearAnimTimer / LINE_CLEAR_ANIM_MS));
        } else {
          drawWoodenBlock(boardCtx, c * cellSize, visRow * cellSize, cellSize, cellType, false, 1);
        }
      }
      if (isRowClearing) {
        // เอฟเฟกต์ลำแสงกวาดล้างแถวประกายเจิดจรัส (Radiant Line Sweep Beam)
        const sweepP = clearAnimTimer / LINE_CLEAR_ANIM_MS;
        const beamY = (visRow + 0.5) * cellSize;
        const beamH = cellSize * (1.1 - sweepP * 0.8);
        boardCtx.save();
        const beamGrad = boardCtx.createLinearGradient(0, beamY - beamH / 2, 0, beamY + beamH / 2);
        beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        beamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * (1 - sweepP)})`);
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        boardCtx.fillStyle = beamGrad;
        boardCtx.fillRect(0, beamY - beamH / 2, width, beamH);

        boardCtx.fillStyle = `rgba(56, 189, 248, ${0.40 * (1 - sweepP)})`;
        boardCtx.fillRect(0, visRow * cellSize, width, cellSize);
        boardCtx.restore();
      }
    }

    if (activePiece && gameState === 'PLAYING') {
      const baseType = getBasePieceType(activePiece.type);
      const specType = getSpecialPieceType(activePiece.type);
      const shapeVariants = SHAPES[baseType] || SHAPES[activePiece.type] || SHAPES.T;
      const matrix = shapeVariants[activePiece.rot % shapeVariants.length];

      let coreR = 0, coreC = 0, foundCore = false;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] && !foundCore) {
            coreR = r; coreC = c;
            if (r === 1 && c === 1) foundCore = true;
          }
        }
      }

      if (gameMode !== 'Classic') {
        const ghostY = getGhostY();
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] && ghostY + r - HIDDEN_ROWS >= 0) {
              const cellPieceType = (specType && r === coreR && c === coreC) ? specType : baseType;
              drawGhostBlock(boardCtx, (visualPiece.x + c) * cellSize, (ghostY + r - HIDDEN_ROWS) * cellSize, cellSize, cellPieceType);
            }
          }
        }
      }

      // วาด Trail เงาหลังการตกแบบความเร็วสูง
      if (visualPiece.trail && visualPiece.trail.length > 0 && !reducedEffects) {
        for (const t of visualPiece.trail) {
          const tBase = getBasePieceType(t.type);
          const tVariants = SHAPES[tBase] || SHAPES[t.type] || SHAPES.T;
          const tMat = tVariants[t.rot % tVariants.length];
          for (let r = 0; r < tMat.length; r++) {
            for (let c = 0; c < tMat[r].length; c++) {
              if (tMat[r][c] && t.y + r - HIDDEN_ROWS >= 0) {
                drawWoodenBlock(boardCtx, (t.x + c) * cellSize, (t.y + r - HIDDEN_ROWS) * cellSize, cellSize, tBase, false, t.alpha * 0.45);
              }
            }
          }
        }
      }

      const mH = matrix.length;
      const mW = matrix[0].length;
      const cX = (visualPiece.x + mW * 0.5) * cellSize;
      const cY = (visualPiece.y + mH * 0.5 - HIDDEN_ROWS) * cellSize;

      boardCtx.save();
      if (Math.abs(visualPiece.squashX - 1) > 0.005 || Math.abs(visualPiece.squashY - 1) > 0.005) {
        boardCtx.translate(cX, cY);
        boardCtx.scale(visualPiece.squashX, visualPiece.squashY);
        boardCtx.translate(-cX, -cY);
      }

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] && visualPiece.y + r - HIDDEN_ROWS >= -1) {
            const isCore = (specType && r === coreR && c === coreC);
            const drawType = isCore ? specType : (specType === 'GOLD' ? 'GOLD' : baseType);
            drawWoodenBlock(boardCtx, (visualPiece.x + c) * cellSize, (visualPiece.y + r - HIDDEN_ROWS) * cellSize, cellSize, drawType, true, 1);
          }
        }
      }
      boardCtx.restore();
    }

    shockwaves.forEach(sw => sw.draw(boardCtx));
    particles.forEach(p => p.draw(boardCtx));
    floatingTexts.forEach(ft => ft.draw(boardCtx));

    // วาดเอฟเฟกต์ลำแสงเลเซอร์
    if (laserBeamTimer > 0 && laserBeamRow >= 0) {
      const alpha = Math.min(1, laserBeamTimer / 220);
      const beamY = laserBeamRow * cellSize;
      boardCtx.save();
      boardCtx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.85})`;
      boardCtx.fillRect(0, beamY + cellSize * 0.2, width, cellSize * 0.6);
      boardCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      boardCtx.fillRect(0, beamY + cellSize * 0.38, width, cellSize * 0.24);
      boardCtx.restore();
    }

    if (whiteFlashTimer > 0 && !reducedEffects) {
      const flashAlpha = Math.min(1, (whiteFlashTimer / 120) * 0.85);
      boardCtx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      boardCtx.fillRect(0, 0, width, height);
    }

    if (comboTextTimer > 0) {
      const progress = comboTextTimer / 800;
      const alpha = Math.min(1, progress * 1.4);
      const scale = reducedEffects ? 1 : (1 + (1 - progress) * 0.25);

      boardCtx.save();
      boardCtx.translate(width / 2, height * 0.42);
      boardCtx.scale(scale, scale);
      boardCtx.textAlign = 'center';
      boardCtx.textBaseline = 'middle';

      const fontSize = comboTextCount >= 9 ? Math.round(cellSize * 1.35) : Math.round(cellSize * 1.10);
      boardCtx.font = `900 ${fontSize}px system-ui, sans-serif`;

      if (!reducedEffects) {
        boardCtx.shadowColor = comboTextColor;
        boardCtx.shadowBlur = 18;
      }
      boardCtx.fillStyle = comboTextColor;
      boardCtx.globalAlpha = alpha;
      boardCtx.fillText(`COMBO ×${comboTextCount}`, 0, 0);
      boardCtx.restore();
    }

    // Render Touch Ripples (เอฟเฟกต์วงน้ำเรืองแสงเมื่อแตะหน้าจอ)
    if (touchRipples.length > 0) {
      for (let i = touchRipples.length - 1; i >= 0; i--) {
        const rip = touchRipples[i];
        rip.radius += 2.2;
        rip.alpha -= 0.045;
        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          touchRipples.splice(i, 1);
          continue;
        }
        boardCtx.save();
        boardCtx.beginPath();
        boardCtx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        boardCtx.strokeStyle = `rgba(44, 184, 232, ${rip.alpha})`;
        boardCtx.lineWidth = 3;
        boardCtx.shadowColor = 'rgba(44, 184, 232, 0.8)';
        boardCtx.shadowBlur = 10;
        boardCtx.stroke();
        boardCtx.restore();
      }
    }

    boardCtx.restore();
  }

  function drawMiniPiece(ctx, type, boxWidth, offsetY, boxHeight, alpha = 1) {
    if (!type) return;

    if (SPECIAL_PIECES.includes(type) && !type.includes('_')) {
      const mSize = Math.min(boxWidth * 0.48, boxHeight * 0.58);
      const sX = (boxWidth - mSize) / 2;
      const sY = offsetY + (boxHeight - mSize) / 2;
      drawWoodenBlock(ctx, sX, sY, mSize, type, true, alpha);
      return;
    }

    const baseType = getBasePieceType(type);
    const specType = getSpecialPieceType(type);
    const matrix = (SHAPES[baseType] || SHAPES[type] || SHAPES.T)[0];

    let minR = 4, maxR = -1, minC = 4, maxC = -1;
    let coreR = 0, coreC = 0, foundCore = false;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          minR = Math.min(minR, r); maxR = Math.max(maxR, r);
          minC = Math.min(minC, c); maxC = Math.max(maxC, c);
          if (!foundCore) {
            coreR = r; coreC = c;
            if (r === 1 && c === 1) foundCore = true;
          }
        }
      }
    }
    const pCols = maxC - minC + 1, pRows = maxR - minR + 1;
    const mSize = Math.min(boxWidth / 4.4, boxHeight / 2.6);
    const startX = (boxWidth - pCols * mSize) / 2;
    const startY = offsetY + (boxHeight - pRows * mSize) / 2;

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (matrix[r][c]) {
          const isCore = (specType && r === coreR && c === coreC);
          const cellType = isCore ? specType : (specType === 'GOLD' ? 'GOLD' : baseType);
          drawWoodenBlock(ctx, startX + (c - minC) * mSize, startY + (r - minR) * mSize, mSize, cellType, isCore, alpha);
        }
      }
    }
  }

  function renderHold() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    const dpr = window.devicePixelRatio || 1;
    const w = holdCanvas.width / dpr, h = holdCanvas.height / dpr;
    const isClassic = (gameMode === 'Classic') || (gameMode === 'Versus' && activeVsSubMode === 'Classic');
    if (isClassic) {
      holdCtx.save();
      holdCtx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      holdCtx.font = `700 ${Math.max(11, Math.round(w * 0.18))}px 'Prompt', sans-serif`;
      holdCtx.textAlign = 'center';
      holdCtx.textBaseline = 'middle';
      holdCtx.fillText('OFF', w / 2, h / 2);
      holdCtx.restore();
      return;
    }
    drawMiniPiece(holdCtx, holdPieceType, w, 0, h, canHold ? 1 : 0.45);
  }

  function renderNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const dpr = window.devicePixelRatio || 1;
    const w = nextCanvas.width / dpr, h = nextCanvas.height / dpr;
    const isClassic = (gameMode === 'Classic') || (gameMode === 'Versus' && activeVsSubMode === 'Classic');
    if (isClassic) {
      // โหมด Classic แท้: แสดงชิ้นส่วนถัดไปเพียง 1 ชิ้นตรงกลางกรอบพรีวิวเหมือนตลับ NES ดั้งเดิม
      drawMiniPiece(nextCtx, nextQueue[0], w, 0, h, 1);
      return;
    }
    const count = 3;
    const slotH = h / count;
    for (let i = 0; i < count; i++) {
      drawMiniPiece(nextCtx, nextQueue[i], w, i * slotH, slotH, 1);
    }
  }

  // ==========================================
  // ลูปหลักของเกม (Game Loop & Timers)
  // ==========================================
  let lastTime = 0;

  function update(dt) {
    if (gameMode === 'BlockBlast') {
      if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);
      if (whiteFlashTimer > 0) whiteFlashTimer = Math.max(0, whiteFlashTimer - dt);
      if (comboTextTimer > 0) comboTextTimer = Math.max(0, comboTextTimer - dt);

      // อัปเดตละอองอนุภาค
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(dt);
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      // อัปเดตข้อความคะแนนลอย
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update(dt);
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
      }

      // อัปเดตเอฟเฟกต์ลำแสงล้างแถว
      for (let i = bbLineClearEffects.length - 1; i >= 0; i--) {
        bbLineClearEffects[i].timer -= dt;
        if (bbLineClearEffects[i].timer <= 0) {
          bbLineClearEffects.splice(i, 1);
        }
      }

      // อัปเดตแอนิเมชันเด้งลงล็อกสมูทนุ่มนวล (Juicy Landing Squash)
      if (bbPlacedAnim) {
        bbPlacedAnim.timer -= dt;
        if (bbPlacedAnim.timer <= 0) bbPlacedAnim = null;
      }
      return;
    }

    if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);
    if (whiteFlashTimer > 0) whiteFlashTimer = Math.max(0, whiteFlashTimer - dt);
    if (comboTextTimer > 0) comboTextTimer = Math.max(0, comboTextTimer - dt);
    if (laserBeamTimer > 0) laserBeamTimer = Math.max(0, laserBeamTimer - dt);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(dt);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].update(dt);
      if (shockwaves[i].life <= 0) shockwaves.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      floatingTexts[i].update(dt);
      if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }

    // อัปเดตแสงเรืองแสงขอบกระดานตาม Combo
    const container = boardCanvas.parentElement;
    if (comboCount >= 1) {
      targetGlowIntensity = Math.min(1, comboCount / 7);
    } else {
      targetGlowIntensity = 0;
    }
    boardGlowIntensity += (targetGlowIntensity - boardGlowIntensity) * Math.min(1, dt * 0.006);

    if (container) {
      if (boardGlowIntensity > 0.02) {
        const glowColor = comboCount >= 8 ? '255, 45, 117' : (comboCount >= 5 ? '255, 140, 0' : (comboCount >= 3 ? '255, 215, 0' : '44, 184, 232'));
        const spread = Math.round(6 + boardGlowIntensity * 20);
        const blur = Math.round(14 + boardGlowIntensity * 32);
        container.style.boxShadow = `0 0 ${blur}px ${spread}px rgba(${glowColor}, ${boardGlowIntensity * 0.75}), inset 0 0 10px rgba(${glowColor}, ${boardGlowIntensity * 0.35})`;
        container.style.borderColor = `rgba(${glowColor}, ${0.25 + boardGlowIntensity * 0.75})`;
      } else {
        container.style.boxShadow = '';
        container.style.borderColor = '';
      }
    }

    // อัปเดตตัวจับเวลาในโหมด Sprint และ Ultra
    if (gameState === 'PLAYING') {
      const timerBadge = document.getElementById('gameTimerBadge');
      if (gameMode === 'Sprint') {
        sprintElapsedMs += dt;
        timerBadge.textContent = formatTime(sprintElapsedMs);
      } else if (gameMode === 'Ultra') {
        ultraTimeLeftMs = Math.max(0, ultraTimeLeftMs - dt);
        timerBadge.textContent = formatTime(ultraTimeLeftMs);
        if (ultraTimeLeftMs <= 0) {
          triggerTimeUpUltra();
          return;
        }
      }

      // ตรวจสอบความสำเร็จเอาชีวิตรอดในโหมดตึงเครียด (Survivor Achievement)
      if (audioMgr.isTension) {
        tensionSurvivalTimer += dt;
        if (tensionSurvivalTimer >= 20000) unlockAchievement('survivor');
      } else {
        tensionSurvivalTimer = 0;
      }
    }

    if (gameState === 'CLEARING') {
      clearAnimTimer += dt;
      if (clearAnimTimer >= LINE_CLEAR_ANIM_MS) finishLineClear();
      return;
    }
    if (gameState !== 'PLAYING' || !activePiece) return;

    if (inputState.dasDir !== 0) {
      inputState.dasTimer += dt;
      if (inputState.dasTimer >= DAS_MS) {
        inputState.arrTimer += dt;
        while (inputState.arrTimer >= ARR_MS) {
          moveHorizontal(inputState.dasDir);
          inputState.arrTimer -= ARR_MS;
        }
      }
    }

    if (inputState.down) {
      inputState.softDropTimer += dt;
      const interval = 45;
      while (inputState.softDropTimer >= interval) {
        softDropStep();
        inputState.softDropTimer -= interval;
      }
    }

    const dropInterval = getDropInterval(level);
    dropAccumulator += dt;
    while (dropAccumulator >= dropInterval) {
      dropAccumulator -= dropInterval;
      if (!checkCollision(activePiece.x, activePiece.y + 1, activePiece.rot)) {
        activePiece.y++;
        isGrounded = false;
        lockTimer = 0;
      } else {
        isGrounded = true;
      }
    }

    if (checkCollision(activePiece.x, activePiece.y + 1, activePiece.rot)) {
      if (!isGrounded) {
        triggerLandingSquash(0.88);
        spawnLandingPuff(activePiece, activePiece.y);
      }
      isGrounded = true;
      const lockMax = (gameMode === 'Classic') ? LOCK_DELAY_CLASSIC_MS : LOCK_DELAY_MODERN_MS;
      lockTimer += dt;
      if (lockTimer >= lockMax) lockActivePiece();
    } else {
      isGrounded = false;
      lockTimer = 0;
    }

    // อัปเดตพิกัดตกและเคลื่อนที่แบบสมูทต่อเนื่อง (Smooth Sub-pixel Falling Physics)
    if (activePiece && gameState === 'PLAYING') {
      visualPiece.targetX = activePiece.x;

      const isDroppingBlocked = checkCollision(activePiece.x, activePiece.y + 1, activePiece.rot);
      if (isDroppingBlocked) {
        visualPiece.targetY = activePiece.y;
      } else {
        const currentDropInterval = getDropInterval(level);
        const dropFrac = Math.min(0.98, dropAccumulator / Math.max(1, currentDropInterval));
        visualPiece.targetY = activePiece.y + dropFrac;
      }

      // Smooth horizontal lerp (36)
      visualPiece.x += (visualPiece.targetX - visualPiece.x) * Math.min(1, dt * 0.001 * 36);

      // Smooth vertical falling lerp (30 ปกติ / 42 เมื่อ Soft Drop)
      const lerpSpeedY = inputState.down ? 42 : 30;
      visualPiece.y += (visualPiece.targetY - visualPiece.y) * Math.min(1, dt * 0.001 * lerpSpeedY);

      // ป้องกันการหลุดพิกัดกรณี Spawn หรือ Wall Kick กระโดด
      if (visualPiece.y > activePiece.y + 1.2 || visualPiece.y < activePiece.y - 1.2) {
        visualPiece.y = activePiece.y;
      }
      if (Math.abs(visualPiece.x - activePiece.x) > 2) {
        visualPiece.x = activePiece.x;
      }

      // ฟิสิกส์สปริง Squash & Stretch
      const springK = 0.32;
      const damping = 0.76;
      const force = (1.0 - visualPiece.squashY) * springK;
      visualPiece.squashVel = (visualPiece.squashVel + force) * damping;
      visualPiece.squashY += visualPiece.squashVel;
      visualPiece.squashX = 1.0 + (1.0 - visualPiece.squashY) * 0.65;

      // บันทึก Trail เงาการตก เมื่อบล็อกตกลงมาเร็ว
      if (!reducedEffects && (inputState.down || (visualPiece.targetY - visualPiece.y) > 0.3)) {
        visualPiece.trail.push({
          x: visualPiece.x,
          y: visualPiece.y,
          rot: activePiece.rot,
          type: activePiece.type,
          alpha: 0.32
        });
        if (visualPiece.trail.length > 3) visualPiece.trail.shift();
      }
    }

    if (visualPiece.trail && visualPiece.trail.length > 0) {
      for (let i = visualPiece.trail.length - 1; i >= 0; i--) {
        visualPiece.trail[i].alpha -= dt * 0.008;
        if (visualPiece.trail[i].alpha <= 0) {
          visualPiece.trail.splice(i, 1);
        }
      }
    }
  }

  function gameLoop(now) {
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;
    try {
      update(dt);
      renderBoard();
      renderHold();
      renderNext();
      if (gameMode === 'Versus' && typeof versusManager !== 'undefined' && versusManager.state !== 'IDLE') {
        versusManager.update(dt);
        versusManager.render();
      }
    } catch (err) {
      console.error('GameLoop tick error:', err);
    }
    requestAnimationFrame(gameLoop);
  }

  // ==========================================
  // การควบคุมโหมดและหน้าต่างเมนู (UI Control)
  // ==========================================
  
  // =========================================================================
  // ระบบการแข่งขัน 2 คน (2-Player Versus Mode Engine)
  // =========================================================================
  class VersusSharedBag {
    constructor() {
      this.bag = [];
      this.types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    }
    reset() {
      this.bag = [];
      for (let i = 0; i < 4; i++) this.refill();
    }
    refill() {
      const fresh = [...this.types];
      for (let i = fresh.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
      }
      this.bag.push(...fresh);
    }
    getPiece(index) {
      while (this.bag.length <= index + 10) {
        this.refill();
      }
      return this.bag[index];
    }
  }

  class VersusPlayer {
    constructor(id, name, manager) {
      this.id = id;
      this.name = name;
      this.manager = manager;

      this.board = [];
      this.pieceIndex = 0;
      this.activePiece = null;
      this.visualPiece = { x: 0, y: 0, squashX: 1, squashY: 1 };
      this.holdPiece = null;
      this.canHold = true;
      this.nextQueue = [];

      this.score = 0;
      this.lines = 0;
      this.combo = 0;
      this.backToBack = false;

      this.pendingGarbage = 0;
      this.garbageSent = 0;
      this.garbageReceived = 0;

      this.lockTimer = 0;
      this.lockResets = 0;
      this.isGrounded = false;
      this.dropTimer = 0;
      this.dropInterval = 800;

      this.isAlive = true;
      this.isTopOut = false;
      this.clearingRows = [];
      this.clearAnimTimer = 0;

      this.shakeTimer = 0;
      this.shakeDuration = 0;
      this.shakeIntensity = 0;
    }

    resetForRound() {
      this.board = [];
      for (let r = 0; r < TOTAL_ROWS; r++) {
        this.board.push(new Array(COLS).fill(null));
      }
      this.pieceIndex = 0;
      this.holdPiece = null;
      this.canHold = true;
      this.score = 0;
      this.lines = 0;
      this.combo = 0;
      this.backToBack = false;
      this.pendingGarbage = 0;
      this.lockTimer = 0;
      this.lockResets = 0;
      this.isGrounded = false;
      this.dropTimer = 0;
      this.isAlive = true;
      this.isTopOut = false;
      this.clearingRows = [];
      this.clearAnimTimer = 0;
      this.shakeTimer = 0;

      this.nextQueue = [];
      for (let i = 0; i < 4; i++) {
        this.nextQueue.push(this.manager.sharedBag.getPiece(this.pieceIndex++));
      }
      this.spawnNextPiece();
    }

    triggerShake(intensity, duration) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeTimer = duration;
    }

    spawnPiece(type) {
      if (!type) type = 'T';
      const matrix = (SHAPES[type] || SHAPES.T)[0];
      const size = matrix.length;
      this.activePiece = {
        type,
        rot: 0,
        x: Math.floor((COLS - size) / 2),
        y: HIDDEN_ROWS - 1
      };
      this.visualPiece.x = this.activePiece.x;
      this.visualPiece.y = this.activePiece.y;
      this.lockTimer = 0;
      this.lockResets = 0;
      this.isGrounded = false;

      if (this.checkCollision(this.activePiece.x, this.activePiece.y, this.activePiece.rot)) {
        this.triggerTopOut();
      }
    }

    spawnNextPiece() {
      const next = this.nextQueue.shift();
      this.nextQueue.push(this.manager.sharedBag.getPiece(this.pieceIndex++));
      this.canHold = true;
      this.spawnPiece(next);
    }

    checkCollision(nx, ny, nrot, pieceType = (this.activePiece ? this.activePiece.type : 'T')) {
      const shapeVariants = SHAPES[pieceType] || SHAPES.T;
      const matrix = shapeVariants[nrot % shapeVariants.length];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (!matrix[r][c]) continue;
          const bx = nx + c;
          const by = ny + r;
          if (bx < 0 || bx >= COLS || by >= TOTAL_ROWS) return true;
          if (by >= 0 && this.board[by][bx] !== null) return true;
        }
      }
      return false;
    }

    moveHorizontal(dir) {
      if (!this.isAlive || !this.activePiece || this.clearingRows.length > 0) return false;
      if (!this.checkCollision(this.activePiece.x + dir, this.activePiece.y, this.activePiece.rot)) {
        this.activePiece.x += dir;
        this.visualPiece.x = this.activePiece.x;
        audioMgr.playMove();
        if (this.isGrounded && this.lockResets < MAX_LOCK_RESETS) {
          this.lockTimer = 0;
          this.lockResets++;
        }
        return true;
      }
      return false;
    }

    rotate(dir) {
      if (!this.isAlive || !this.activePiece || this.clearingRows.length > 0) return false;
      const oldRot = this.activePiece.rot;
      const newRot = (oldRot + dir + 4) % 4;
      const type = this.activePiece.type;

      if (type === 'O') {
        this.activePiece.rot = newRot;
        audioMgr.playRotate();
        return true;
      }

      const kickKey = `${oldRot}->${newRot}`;
      const kickTable = (type === 'I') ? WALL_KICKS_I : WALL_KICKS_JLSTZ;
      const kicks = (kickTable && kickTable[kickKey]) ? kickTable[kickKey] : [[0, 0]];

      for (let i = 0; i < kicks.length; i++) {
        const [kx, ky] = kicks[i];
        if (!this.checkCollision(this.activePiece.x + kx, this.activePiece.y - ky, newRot)) {
          this.activePiece.x += kx;
          this.activePiece.y -= ky;
          this.activePiece.rot = newRot;
          this.visualPiece.x = this.activePiece.x;
          this.visualPiece.y = this.activePiece.y;
          if (this.isGrounded && this.lockResets < MAX_LOCK_RESETS) {
            this.lockTimer = 0;
            this.lockResets++;
          }
          audioMgr.playRotate();
          return true;
        }
      }
      return false;
    }

    softDrop() {
      if (!this.isAlive || !this.activePiece || this.clearingRows.length > 0) return false;
      if (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.rot)) {
        this.activePiece.y++;
        this.visualPiece.y = this.activePiece.y;
        this.score += 1;
        this.dropTimer = 0;
        return true;
      } else {
        this.isGrounded = true;
      }
      return false;
    }

    hardDrop() {
      if (!this.isAlive || !this.activePiece || this.clearingRows.length > 0) return;
      let dropRows = 0;
      while (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.rot)) {
        this.activePiece.y++;
        dropRows++;
      }
      this.visualPiece.y = this.activePiece.y;
      this.score += dropRows * 2;
      audioMgr.playHardDrop();
      this.triggerShake(4, 150);
      this.lockPiece();
    }

    hold() {
      if (!this.isAlive || !this.activePiece || !this.canHold || this.clearingRows.length > 0) return;
      audioMgr.playHold();
      const current = this.activePiece.type;
      if (this.holdPiece === null) {
        this.holdPiece = current;
        this.spawnNextPiece();
      } else {
        const swap = this.holdPiece;
        this.holdPiece = current;
        this.spawnPiece(swap);
      }
      this.canHold = false;
    }

    getGhostY() {
      if (!this.activePiece) return 0;
      let gy = this.activePiece.y;
      while (!this.checkCollision(this.activePiece.x, gy + 1, this.activePiece.rot)) {
        gy++;
      }
      return gy;
    }

    lockPiece() {
      if (!this.activePiece) return;
      const type = this.activePiece.type;
      const shapeVariants = SHAPES[type] || SHAPES.T;
      const matrix = shapeVariants[this.activePiece.rot % shapeVariants.length];

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const bx = this.activePiece.x + c;
            const by = this.activePiece.y + r;
            if (by >= 0 && by < TOTAL_ROWS && bx >= 0 && bx < COLS) {
              this.board[by][bx] = type;
            }
          }
        }
      }
      audioMgr.playLock();
      this.activePiece = null;

      // ตรวจสอบการล้างแถว
      const fullRows = [];
      for (let r = 0; r < TOTAL_ROWS; r++) {
        if (this.board[r].every(cell => cell !== null)) {
          fullRows.push(r);
        }
      }

      if (fullRows.length > 0) {
        this.clearingRows = fullRows;
        this.clearAnimTimer = 200;
        audioMgr.playClear(fullRows.length, fullRows.length === 4, this.combo);
      } else {
        this.combo = 0;
        if (this.pendingGarbage > 0) {
          const insertCount = Math.min(this.pendingGarbage, 8);
          this.pendingGarbage -= insertCount;
          this.insertGarbageRows(insertCount);
        }
        this.spawnNextPiece();
      }
    }

    resolveLineClear() {
      const lineCount = this.clearingRows.length;
      if (lineCount === 0) return;

      this.clearingRows.sort((a, b) => a - b);
      for (const r of this.clearingRows) {
        this.board.splice(r, 1);
        this.board.unshift(new Array(COLS).fill(null));
      }
      this.lines += lineCount;
      this.combo++;

      const isPerfectClear = this.board.every(row => row.every(cell => cell === null));

      let garbageToSend = 0;
      if (lineCount === 2) garbageToSend = 1;
      else if (lineCount === 3) garbageToSend = 2;
      else if (lineCount === 4) garbageToSend = 4;

      if (lineCount === 4) {
        if (this.backToBack) garbageToSend += 1;
        this.backToBack = true;
      } else {
        this.backToBack = false;
      }

      if (isPerfectClear) {
        garbageToSend += 6;
      }

      const baseScores = [0, 100, 300, 500, 800];
      this.score += (baseScores[lineCount] || 0) + (this.combo > 1 ? this.combo * 50 : 0);

      if (garbageToSend > 0) {
        if (this.pendingGarbage > 0) {
          const cancelled = Math.min(this.pendingGarbage, garbageToSend);
          this.pendingGarbage -= cancelled;
          garbageToSend -= cancelled;
        }

        if (garbageToSend > 0) {
          const opponent = (this.id === 1) ? this.manager.p2 : this.manager.p1;
          opponent.addPendingGarbage(garbageToSend);
          this.garbageSent += garbageToSend;
          this.manager.triggerGarbageBeam(this.id, opponent.id);
        }
      }

      this.clearingRows = [];
      this.spawnNextPiece();
    }

    addPendingGarbage(count) {
      this.pendingGarbage = Math.min(20, this.pendingGarbage + count);
      this.garbageReceived += count;
      audioMgr.playDanger();
    }

    insertGarbageRows(count) {
      if (count <= 0) return;
      audioMgr.playBomb();
      this.triggerShake(6, 250);

      const holeCol = Math.floor(Math.random() * COLS);

      for (let i = 0; i < count; i++) {
        if (this.board[0].some(cell => cell !== null)) {
          this.triggerTopOut();
          return;
        }
        this.board.shift();
        const garbageRow = new Array(COLS).fill('GARBAGE');
        garbageRow[holeCol] = null;
        this.board.push(garbageRow);
      }
    }

    triggerTopOut() {
      if (!this.isAlive) return;
      this.isAlive = false;
      this.isTopOut = true;
      audioMgr.playGameOver();
      this.manager.onPlayerTopOut(this);
    }

    update(dt) {
      if (!this.isAlive) return;

      if (this.shakeTimer > 0) {
        this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      }

      if (this.clearingRows.length > 0) {
        this.clearAnimTimer -= dt;
        if (this.clearAnimTimer <= 0) {
          this.resolveLineClear();
        }
        return;
      }

      if (!this.activePiece) return;

      this.dropTimer += dt;
      if (this.dropTimer >= this.dropInterval) {
        this.dropTimer = 0;
        if (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.rot)) {
          this.activePiece.y++;
          this.visualPiece.y = this.activePiece.y;
          this.isGrounded = false;
        } else {
          this.isGrounded = true;
        }
      }

      if (this.isGrounded) {
        this.lockTimer += dt;
        if (this.lockTimer >= LOCK_DELAY_MODERN_MS) {
          this.lockPiece();
        }
      } else {
        this.lockTimer = 0;
      }
    }

    render(boardCanvas, holdCanvas, nextCanvas, garbageBarEl) {
      if (!boardCanvas) return;
      const ctx = boardCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const w = boardCanvas.width / dpr;
      const h = boardCanvas.height / dpr;
      const cSize = w / COLS;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      let sX = 0, sY = 0;
      if (this.shakeTimer > 0 && this.shakeDuration > 0) {
        const p = this.shakeTimer / this.shakeDuration;
        sX = (Math.random() * 2 - 1) * this.shakeIntensity * p;
        sY = (Math.random() * 2 - 1) * this.shakeIntensity * p;
      }

      ctx.save();
      ctx.translate(sX, sY);

      // Board background
      ctx.fillStyle = '#181b24';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid pattern for clear playability
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cSize, 0);
        ctx.lineTo(c * cSize, h);
        ctx.stroke();
      }
      for (let r = 1; r < VISIBLE_ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cSize);
        ctx.lineTo(w, r * cSize);
        ctx.stroke();
      }

      // Placed board blocks
      for (let r = HIDDEN_ROWS; r < TOTAL_ROWS; r++) {
        const visR = r - HIDDEN_ROWS;
        const isClearing = this.clearingRows.includes(r);
        for (let c = 0; c < COLS; c++) {
          const type = this.board[r][c];
          if (type) {
            if (isClearing) {
              const alpha = Math.max(0, this.clearAnimTimer / 200);
              drawWoodenBlock(ctx, c * cSize, visR * cSize, cSize, type, true, alpha);
            } else {
              drawWoodenBlock(ctx, c * cSize, visR * cSize, cSize, type, false, 1);
            }
          }
        }
      }

      // Ghost piece & Active piece
      if (this.activePiece && this.clearingRows.length === 0) {
        const gy = this.getGhostY();
        const matrix = (SHAPES[this.activePiece.type] || SHAPES.T)[this.activePiece.rot];
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] && gy + r - HIDDEN_ROWS >= 0) {
              drawGhostBlock(ctx, (this.activePiece.x + c) * cSize, (gy + r - HIDDEN_ROWS) * cSize, cSize, this.activePiece.type);
            }
          }
        }

        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] && this.activePiece.y + r - HIDDEN_ROWS >= -1) {
              drawWoodenBlock(ctx, (this.activePiece.x + c) * cSize, (this.activePiece.y + r - HIDDEN_ROWS) * cSize, cSize, this.activePiece.type, true, 1);
            }
          }
        }
      }

      if (this.isTopOut) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = '900 22px system-ui, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('TOP OUT!', w / 2, h / 2);
      }

      ctx.restore();
      ctx.restore();

      // Garbage Bar
      if (garbageBarEl) {
        const pct = Math.min(100, (this.pendingGarbage / 12) * 100);
        garbageBarEl.style.height = pct + '%';
      }

      // Hold Canvas
      if (holdCanvas) {
        const hCtx = holdCanvas.getContext('2d');
        const hw = holdCanvas.width / dpr;
        const hh = holdCanvas.height / dpr;
        hCtx.save();
        hCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        hCtx.clearRect(0, 0, hw, hh);
        if (this.holdPiece) {
          drawMiniPiece(hCtx, this.holdPiece, hw, 0, hh, this.canHold ? 1 : 0.45);
        }
        hCtx.restore();
      }

      // Next Canvas
      if (nextCanvas) {
        const nCtx = nextCanvas.getContext('2d');
        const nw = nextCanvas.width / dpr;
        const nh = nextCanvas.height / dpr;
        nCtx.save();
        nCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        nCtx.clearRect(0, 0, nw, nh);
        const slotH = nh / 3;
        for (let i = 0; i < Math.min(3, this.nextQueue.length); i++) {
          drawMiniPiece(nCtx, this.nextQueue[i], nw, i * slotH, slotH, 1);
        }
        nCtx.restore();
      }
    }
  }

  class VersusMatchManager {
    constructor() {
      this.sharedBag = new VersusSharedBag();
      this.p1 = new VersusPlayer(1, 'PLAYER 1', this);
      this.p2 = new VersusPlayer(2, 'PLAYER 2', this);

      this.p1Wins = 0;
      this.p2Wins = 0;
      this.targetWins = 2; // Default Best of 3 (2 wins)
      this.matchTime = 0;
      this.state = 'IDLE';
      this.countdownTime = 0;
      this.keysDown = {};
      this.matchType = 'local';
    }

    startMatch(config = {}) {
      if (config.targetWins) this.targetWins = config.targetWins;
      if (config.matchType) this.matchType = config.matchType;
      this.p1Wins = 0;
      this.p2Wins = 0;
      this.matchTime = 0;
      this.updateScoreUI();
      this.startRound();
    }

    startRound() {
      this.sharedBag.reset();
      this.p1.resetForRound();
      this.p2.resetForRound();
      this.state = 'COUNTDOWN';
      this.countdownTime = 3000;
      this.updateScoreUI();
      resizeCanvases();
      audioMgr.playBgm();

      const overlay = document.getElementById('vsCountdownOverlay');
      const textEl = document.getElementById('vsCountdownText');
      if (overlay && textEl) {
        overlay.classList.remove('hidden');
        textEl.textContent = '3';
        textEl.style.color = '#f59e0b';
      }
    }

    updateScoreUI() {
      const p1ScoreEl = document.getElementById('vsScoreP1');
      const p2ScoreEl = document.getElementById('vsScoreP2');
      const p1StarsEl = document.getElementById('vsP1Stars');
      const p2StarsEl = document.getElementById('vsP2Stars');

      if (p1ScoreEl) p1ScoreEl.textContent = String(this.p1Wins);
      if (p2ScoreEl) p2ScoreEl.textContent = String(this.p2Wins);

      if (p1StarsEl) {
        p1StarsEl.textContent = '★'.repeat(this.p1Wins) + '☆'.repeat(Math.max(0, this.targetWins - this.p1Wins));
      }
      if (p2StarsEl) {
        p2StarsEl.textContent = '★'.repeat(this.p2Wins) + '☆'.repeat(Math.max(0, this.targetWins - this.p2Wins));
      }

      const p1LinesEl = document.getElementById('vsP1Lines');
      const p1PtsEl = document.getElementById('vsP1Score');
      const p2LinesEl = document.getElementById('vsP2Lines');
      const p2PtsEl = document.getElementById('vsP2Score');

      if (p1LinesEl) p1LinesEl.textContent = String(this.p1.lines);
      if (p1PtsEl) p1PtsEl.textContent = String(this.p1.score);
      if (p2LinesEl) p2LinesEl.textContent = String(this.p2.lines);
      if (p2PtsEl) p2PtsEl.textContent = String(this.p2.score);
    }

    onPlayerTopOut(loser) {
      if (this.state !== 'PLAYING') return;
      this.state = 'ROUND_OVER';

      const winner = (loser.id === 1) ? this.p2 : this.p1;
      if (winner.id === 1) this.p1Wins++;
      else this.p2Wins++;

      this.updateScoreUI();

      if (this.p1Wins >= this.targetWins || this.p2Wins >= this.targetWins) {
        const champ = (this.p1Wins >= this.targetWins) ? this.p1 : this.p2;
        setTimeout(() => this.endMatch(champ), 1000);
      } else {
        setTimeout(() => {
          if (gameMode === 'Versus') this.startRound();
        }, 1800);
      }
    }

    endMatch(champion) {
      this.state = 'MATCH_OVER';
      audioMgr.pauseBgm();

      const titleEl = document.getElementById('vsWinnerTitle');
      const subEl = document.getElementById('vsWinnerSubtitle');
      const sumP1 = document.getElementById('vsSumP1');
      const sumP2 = document.getElementById('vsSumP2');
      const linesP1 = document.getElementById('vsStatLinesP1');
      const garbP1 = document.getElementById('vsStatGarbageP1');
      const linesP2 = document.getElementById('vsStatLinesP2');
      const garbP2 = document.getElementById('vsStatGarbageP2');
      const overlay = document.getElementById('vsGameOverOverlay');

      if (titleEl) titleEl.textContent = champion.name + ' WINS!';
      if (subEl) subEl.textContent = 'คว้าชัยชนะ ' + (champion.name === 'PLAYER 1' ? this.p1Wins : this.p2Wins) + ' ต่อ ' + (champion.name === 'PLAYER 1' ? this.p2Wins : this.p1Wins) + ' รอบ!';
      if (sumP1) sumP1.textContent = String(this.p1Wins);
      if (sumP2) sumP2.textContent = String(this.p2Wins);
      if (linesP1) linesP1.textContent = String(this.p1.lines);
      if (garbP1) garbP1.textContent = String(this.p1.garbageSent);
      if (linesP2) linesP2.textContent = String(this.p2.lines);
      if (garbP2) garbP2.textContent = String(this.p2.garbageSent);

      if (overlay) overlay.classList.remove('hidden');
    }

    triggerGarbageBeam(fromId, toId) {
      const container = document.getElementById('vsBeamContainer');
      if (!container) return;
      const beam = document.createElement('div');
      beam.className = 'vs-garbage-beam';
      beam.style.top = Math.floor(20 + Math.random() * 60) + '%';
      beam.style.left = (fromId === 1) ? '-40px' : '40px';
      beam.style.width = '90px';
      container.appendChild(beam);
      setTimeout(() => beam.remove(), 500);
    }

    handleKeyDown(e) {
      if (this.state !== 'PLAYING') return;
      const code = e.code;
      if (this.keysDown[code]) return;
      this.keysDown[code] = true;

      // Player 1 (WASD)
      if (code === 'KeyA') this.p1.moveHorizontal(-1);
      else if (code === 'KeyD') this.p1.moveHorizontal(1);
      else if (code === 'KeyS') this.p1.softDrop();
      else if (code === 'KeyW' || code === 'Space') {
        e.preventDefault();
        this.p1.hardDrop();
      }
      else if (code === 'KeyE' || code === 'KeyK') this.p1.rotate(1);
      else if (code === 'KeyQ' || code === 'KeyJ') this.p1.rotate(-1);
      else if (code === 'KeyC' || code === 'ShiftLeft') this.p1.hold();

      // Player 2 (Arrows / Numpad)
      if (code === 'ArrowLeft') { e.preventDefault(); this.p2.moveHorizontal(-1); }
      else if (code === 'ArrowRight') { e.preventDefault(); this.p2.moveHorizontal(1); }
      else if (code === 'ArrowDown') { e.preventDefault(); this.p2.softDrop(); }
      else if (code === 'ArrowUp' || code === 'Numpad0') {
        e.preventDefault();
        this.p2.hardDrop();
      }
      else if (code === 'Numpad1' || code === 'Period') this.p2.rotate(1);
      else if (code === 'Numpad2' || code === 'Slash' || code === 'Comma') this.p2.rotate(-1);
      else if (code === 'Numpad3' || code === 'ShiftRight') this.p2.hold();
    }

    handleKeyUp(e) {
      delete this.keysDown[e.code];
    }

    update(dt) {
      if (this.state === 'COUNTDOWN') {
        this.countdownTime -= dt;
        const overlay = document.getElementById('vsCountdownOverlay');
        const textEl = document.getElementById('vsCountdownText');
        if (this.countdownTime > 2000) {
          if (textEl && textEl.textContent !== '3') { textEl.textContent = '3'; audioMgr.playMove(); }
        } else if (this.countdownTime > 1000) {
          if (textEl && textEl.textContent !== '2') { textEl.textContent = '2'; audioMgr.playMove(); }
        } else if (this.countdownTime > 0) {
          if (textEl && textEl.textContent !== '1') { textEl.textContent = '1'; audioMgr.playMove(); }
        } else {
          if (textEl && textEl.textContent !== 'START!') {
            textEl.textContent = 'START!';
            textEl.style.color = '#10b981';
            audioMgr.playHardDrop();
            setTimeout(() => {
              if (overlay) overlay.classList.add('hidden');
              if (textEl) textEl.style.color = '#f59e0b';
            }, 500);
          }
          this.state = 'PLAYING';
        }
        return;
      }

      if (this.state !== 'PLAYING') return;
      this.matchTime += dt;

      const timerEl = document.getElementById('vsTimer');
      if (timerEl) {
        const totalSec = Math.floor(this.matchTime / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        timerEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }

      this.p1.update(dt);
      this.p2.update(dt);
      this.updateScoreUI();
    }

    render() {
      if (this.state === 'IDLE') return;

      const p1Board = document.getElementById('vsBoardCanvasP1');
      const p1Hold = document.getElementById('vsHoldCanvasP1');
      const p1Next = document.getElementById('vsNextCanvasP1');
      const p1Garb = document.getElementById('vsP1GarbageBar');

      const p2Board = document.getElementById('vsBoardCanvasP2');
      const p2Hold = document.getElementById('vsHoldCanvasP2');
      const p2Next = document.getElementById('vsNextCanvasP2');
      const p2Garb = document.getElementById('vsP2GarbageBar');

      this.p1.render(p1Board, p1Hold, p1Next, p1Garb);
      this.p2.render(p2Board, p2Hold, p2Next, p2Garb);
    }
  }

  const versusManager = new VersusMatchManager();

  
  // =========================================================================
  // ระบบห้องล็อบบี้แข่งขัน 2 คน (Multiplayer Lobby System Logic)
  // =========================================================================
  // ตั้งค่าเซิร์ฟเวอร์หลังบ้าน (Backend Server Configuration)
  // ผู้เล่นจะไม่เห็นหน้านี้ใน UI แต่ระบบจะเชื่อมต่ออัตโนมัติเบื้องหลัง
  const DEFAULT_RENDER_WS_URL = (typeof window !== 'undefined' && window.RENDER_WS_URL) || 
    (typeof location !== 'undefined' && location.search ? new URLSearchParams(location.search).get('ws') : null) || 
    localStorage.getItem('tetris_render_ws_url') || 
    'wss://tetris-wood-server.onrender.com';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  class MultiplayerLobbyManager {
    constructor() {
      this.currentRoom = null;
      this.rooms = [];
      this.selectedRounds = 2; // Default Best of 3
      this.selectedSubMode = 'Modern'; // Default sub-mode from the 5 modes
      this.channel = null;
      this.ws = null;
      this.renderUrl = DEFAULT_RENDER_WS_URL;
      this.myWins = 0;
      this.oppWins = 0;
      this.targetWins = 2;
      this.opponentName = 'Opponent';
      this.heartbeatTimer = null;
      this.pendingJoinRoom = null;

      this.initNetwork();
    }

    initNetwork() {
      // 1. BroadcastChannel fallback for instant zero-config cross-tab local testing
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          this.channel = new BroadcastChannel('tetris_mp_network_channel');
          this.channel.onmessage = (e) => this.handleNetworkMessage(e.data);
        }
      } catch (err) {
        console.warn('BroadcastChannel not supported:', err);
      }

      window.addEventListener('storage', (e) => {
        if (e.key === 'tetris_mp_sync_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.handleNetworkMessage(data);
          } catch (err) {}
        }
      });

      // 2. Connect to backend Render WebSocket server silently in background
      if (this.renderUrl && this.renderUrl.trim()) {
        this.connectWebSocket(this.renderUrl.trim());
      }

      this.startHeartbeat();
    }

    connectWebSocket(url) {
      if (!url) return;
      this.renderUrl = url;

      this.updateServerStatusUI('connecting', 'กำลังเชื่อมต่อเซิร์ฟเวอร์หลังบ้าน Render...');

      if (this.ws) {
        try { this.ws.close(); } catch (e) {}
      }

      try {
        // Automatically convert https:// to wss:// or http:// to ws://
        let wsUrl = url.trim();
        if (wsUrl.startsWith('http://')) wsUrl = 'ws://' + wsUrl.substring(7);
        else if (wsUrl.startsWith('https://')) wsUrl = 'wss://' + wsUrl.substring(8);
        else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) wsUrl = 'wss://' + wsUrl;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.updateServerStatusUI('online', 'เชื่อมต่อเซิร์ฟเวอร์ Render สำเร็จ! เล่นออนไลน์ได้ทันที');
          this.ws.send(JSON.stringify({ type: 'SET_PLAYER_NAME', name: this.getPlayerName() }));
          this.ws.send(JSON.stringify({ type: 'LIST_ROOMS' }));
        };

        this.ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            this.handleServerMessage(data);
          } catch (err) {
            console.error('Failed to parse WS msg:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('WebSocket connection error (หลังบ้านกำลังสลับไปใช้ระบบ Local/Broadcast):', err);
          this.updateServerStatusUI('offline', 'เชื่อมต่อ Render ไม่สำเร็จ (กำลังใช้ Local/Broadcast)');
        };

        this.ws.onclose = () => {
          this.updateServerStatusUI('offline', 'หลุดการเชื่อมต่อจาก Render (สลับเป็น Local/Broadcast)');
        };
      } catch (err) {
        console.error('WebSocket exception:', err);
        this.updateServerStatusUI('offline', 'URL เซิร์ฟเวอร์ไม่ถูกต้อง');
      }
    }

    updateServerStatusUI(status, text) {
      console.log(`[Quadrate Game Server] (${status}) ${text}`);
    }

    sendWsOrBroadcast(type, payload = {}) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, ...payload }));
      } else {
        this.broadcast(type, payload);
      }
    }

    broadcast(type, payload = {}) {
      const msg = { type, sender: this.getPlayerId(), timestamp: Date.now(), ...payload };
      if (this.channel) {
        try { this.channel.postMessage(msg); } catch (e) {}
      }
      try {
        localStorage.setItem('tetris_mp_sync_event', JSON.stringify(msg));
      } catch (e) {}
    }

    getPlayerId() {
      let pid = sessionStorage.getItem('tetris_mp_player_id');
      if (!pid) {
        pid = 'P_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('tetris_mp_player_id', pid);
      }
      return pid;
    }

    getPlayerName() {
      return localStorage.getItem('tetris_player_name') || ('Player ' + Math.floor(1 + Math.random() * 99));
    }

    startHeartbeat() {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'PING' }));
        } else {
          if (this.currentRoom && this.currentRoom.isHost) {
            this.currentRoom.lastActive = Date.now();
            this.saveCurrentRoomToStorage();
            this.broadcast('ROOM_HEARTBEAT', { room: this.cleanRoomData(this.currentRoom) });
          }
          this.cleanStaleRooms();
        }
      }, 3000);
    }

    getRoomsFromStorage() {
      try {
        const data = localStorage.getItem('tetris_mp_active_rooms');
        if (data) {
          const parsed = JSON.parse(data);
          const now = Date.now();
          return parsed.filter(r => (now - (r.lastActive || 0)) < 8000);
        }
      } catch (e) {}
      return [];
    }

    saveRoomsToStorage(rooms) {
      try {
        localStorage.setItem('tetris_mp_active_rooms', JSON.stringify(rooms));
      } catch (e) {}
    }

    saveCurrentRoomToStorage() {
      if (!this.currentRoom) return;
      const rooms = this.getRoomsFromStorage().filter(r => r.id !== this.currentRoom.id);
      rooms.unshift(this.cleanRoomData(this.currentRoom));
      this.saveRoomsToStorage(rooms);
    }

    cleanRoomData(r) {
      return {
        id: r.id,
        name: r.name,
        hasPassword: !!r.hasPassword,
        password: r.password || '',
        rounds: r.rounds || 2,
        subMode: r.subMode || this.selectedSubMode || 'Modern',
        hostName: r.hostName || 'Host',
        guestName: r.guestName || null,
        status: r.status || 'WAITING',
        lastActive: r.lastActive || Date.now()
      };
    }

    cleanStaleRooms() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
      const rooms = this.getRoomsFromStorage();
      this.rooms = rooms;
      this.renderRoomList();
    }

    handleServerMessage(msg) {
      if (!msg) return;

      if (msg.type === 'ROOM_LIST' || msg.type === 'ROOM_LIST_UPDATED') {
        this.rooms = msg.rooms || [];
        this.renderRoomList();
      } else if (msg.type === 'ROOM_CREATED') {
        this.currentRoom = msg.room;
        this.isHost = true;
        this.showView('waiting');
        this.updateWaitingUI();
      } else if (msg.type === 'JOIN_SUCCESS') {
        this.currentRoom = msg.room;
        this.isHost = false;
        this.showView('waiting');
        this.updateWaitingUI();
      } else if (msg.type === 'JOIN_ERROR') {
        if (msg.error === 'WRONG_PASSWORD') {
          const errorEl = document.getElementById('passErrorMsg');
          if (errorEl) errorEl.textContent = '❌ รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง';
        } else {
          alert(msg.error || 'ไม่สามารถเข้าร่วมห้องได้');
        }
      } else if (msg.type === 'GUEST_JOINED') {
        if (this.currentRoom) {
          this.currentRoom.guestName = msg.guestName;
          this.currentRoom.guestId = msg.guestId;
          this.updateWaitingUI();
        }
      } else if (msg.type === 'GUEST_LEFT') {
        if (this.currentRoom) {
          this.currentRoom.guestName = null;
          this.updateWaitingUI();
        }
      } else if (msg.type === 'ROOM_CLOSED') {
        alert(msg.message || 'เจ้าของห้องออกจากห้องแล้ว');
        this.leaveRoom(false);
      } else if (msg.type === 'MATCH_STARTED') {
        this.targetWins = msg.targetWins || 2;
        this.opponentName = this.isHost ? msg.guestName : msg.hostName;
        this.startMatchCountdown();
      } else if (msg.type === 'ROUND_STARTED') {
        this.myWins = this.isHost ? msg.p1Wins : msg.p2Wins;
        this.oppWins = this.isHost ? msg.p2Wins : msg.p1Wins;
        this.updateStarsUI();
        this.startNewVsRound();
      } else if (msg.type === 'OPPONENT_UPDATE') {
        this.handleOpponentUpdate(msg);
      } else if (msg.type === 'RECEIVE_GARBAGE') {
        receiveOpponentGarbage(msg.lines || 1);
      } else if (msg.type === 'ROUND_OVER') {
        this.handleRoundOverServer(msg);
      } else if (msg.type === 'MATCH_OVER') {
        this.handleMatchOverServer(msg);
      }
    }

    handleNetworkMessage(msg) {
      if (!msg || msg.sender === this.getPlayerId()) return;

      if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_HEARTBEAT') {
        const rooms = this.getRoomsFromStorage().filter(r => r.id !== msg.room.id);
        rooms.unshift(msg.room);
        this.saveRoomsToStorage(rooms);
        this.renderRoomList();
      } else if (msg.type === 'ROOM_CLOSED') {
        const rooms = this.getRoomsFromStorage().filter(r => r.id !== msg.roomId);
        this.saveRoomsToStorage(rooms);
        if (this.currentRoom && this.currentRoom.id === msg.roomId && !this.isHost) {
          alert('ห้องนี้ถูกปิดโดย Host');
          this.leaveRoom(false);
        }
        this.renderRoomList();
      } else if (msg.type === 'JOIN_ROOM') {
        if (this.currentRoom && this.currentRoom.id === msg.roomId && this.isHost) {
          this.currentRoom.guestName = msg.guestName || 'Player 2';
          this.currentRoom.guestId = msg.sender;
          this.saveCurrentRoomToStorage();
          this.broadcast('JOIN_ACCEPTED', { room: this.cleanRoomData(this.currentRoom) });
          this.updateWaitingUI();
        }
      } else if (msg.type === 'JOIN_ACCEPTED') {
        if (this.currentRoom && this.currentRoom.id === msg.room.id && !this.isHost) {
          this.currentRoom = { ...this.currentRoom, ...msg.room };
          this.updateWaitingUI();
        }
      } else if (msg.type === 'START_MATCH_SYNC') {
        if (this.currentRoom && this.currentRoom.id === msg.roomId) {
          this.targetWins = msg.rounds || 2;
          this.opponentName = this.isHost ? (this.currentRoom.guestName || 'Player 2') : (this.currentRoom.hostName || 'Host');
          this.startMatchCountdown();
        }
      } else if (msg.type === 'OPPONENT_UPDATE') {
        this.handleOpponentUpdate(msg);
      } else if (msg.type === 'RECEIVE_GARBAGE') {
        receiveOpponentGarbage(msg.lines || 1);
      } else if (msg.type === 'PLAYER_TOP_OUT') {
        this.handleOpponentTopOut();
      }
    }

    openLobby() {
      closeOverlays();
      const vsArena = document.getElementById('versusArena');
      if (vsArena) {
        vsArena.classList.add('hidden');
        vsArena.style.display = 'none';
      }
      const lobby = document.getElementById('multiplayerLobby');
      if (lobby) lobby.classList.remove('hidden');

      this.showView('main');
      this.refreshRooms();
    }

    showView(viewName) {
      const mainView = document.getElementById('lobbyMainView');
      const waitView = document.getElementById('lobbyWaitingView');
      if (mainView) mainView.classList.toggle('hidden', viewName !== 'main');
      if (waitView) waitView.classList.toggle('hidden', viewName !== 'waiting');
    }

    createRoom(name, password, rounds) {
      const roomName = name || ('ห้องประลอง #' + Math.floor(1000 + Math.random() * 9000));
      const roomPass = (password && password.trim()) ? password.trim() : '';
      const rds = rounds || 2;
      const sub = this.selectedSubMode || 'Modern';

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'CREATE_ROOM',
          name: roomName,
          password: roomPass,
          rounds: rds,
          subMode: sub
        }));
      } else {
        const roomId = 'ROOM-' + Math.floor(1000 + Math.random() * 9000);
        this.currentRoom = {
          id: roomId,
          name: roomName,
          hasPassword: roomPass.length > 0,
          password: roomPass,
          rounds: rds,
          subMode: sub,
          hostName: this.getPlayerName(),
          guestName: null,
          isHost: true,
          lastActive: Date.now(),
          status: 'WAITING'
        };
        this.isHost = true;
        this.saveCurrentRoomToStorage();
        this.broadcast('ROOM_CREATED', { room: this.cleanRoomData(this.currentRoom) });
        this.showView('waiting');
        this.updateWaitingUI();
      }
    }

    joinRoom(roomId, inputPass = '') {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const room = this.rooms.find(r => r.id.toLowerCase() === roomId.toLowerCase());
        if (room && room.hasPassword && !inputPass) {
          this.promptPassword(room);
          return false;
        }
        this.ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomId: roomId,
          password: inputPass
        }));
        return true;
      }

      const rooms = this.getRoomsFromStorage();
      const room = rooms.find(r => r.id.toLowerCase() === roomId.toLowerCase());
      if (!room) {
        alert('ไม่พบห้องที่ระบุ หรือห้องถูกปิดแล้ว');
        return false;
      }

      if (room.hasPassword) {
        if (!inputPass) {
          this.promptPassword(room);
          return false;
        }
        if (inputPass !== room.password) {
          return 'WRONG_PASS';
        }
      }

      this.currentRoom = {
        ...room,
        isHost: false,
        guestName: this.getPlayerName()
      };
      this.isHost = false;

      this.broadcast('JOIN_ROOM', { roomId: room.id, guestName: this.currentRoom.guestName });
      this.showView('waiting');
      this.updateWaitingUI();
      return true;
    }

    promptPassword(room) {
      this.pendingJoinRoom = room;
      const modal = document.getElementById('roomPasswordModal');
      const input = document.getElementById('inputJoinPassword');
      const errorEl = document.getElementById('passErrorMsg');
      if (errorEl) errorEl.textContent = '';
      if (input) input.value = '';
      if (modal) modal.classList.remove('hidden');
      if (input) input.focus();
    }

    submitPasswordPrompt() {
      const input = document.getElementById('inputJoinPassword');
      const errorEl = document.getElementById('passErrorMsg');
      if (!this.pendingJoinRoom) return;

      const pass = input ? input.value : '';
      const res = this.joinRoom(this.pendingJoinRoom.id, pass);
      if (res === 'WRONG_PASS') {
        if (errorEl) errorEl.textContent = '❌ รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง';
        return;
      }
      if (res === true) {
        const modal = document.getElementById('roomPasswordModal');
        if (modal) modal.classList.add('hidden');
        this.pendingJoinRoom = null;
      }
    }

    leaveRoom(notify = true) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'LEAVE_ROOM' }));
      } else {
        if (this.currentRoom) {
          if (this.isHost) {
            const rooms = this.getRoomsFromStorage().filter(r => r.id !== this.currentRoom.id);
            this.saveRoomsToStorage(rooms);
            if (notify) this.broadcast('ROOM_CLOSED', { roomId: this.currentRoom.id });
          } else {
            if (notify) this.broadcast('PLAYER_LEFT', { roomId: this.currentRoom.id });
          }
        }
      }
      this.currentRoom = null;
      this.showView('main');
      this.refreshRooms();
    }

    updateWaitingUI() {
      if (!this.currentRoom) return;
      const r = this.currentRoom;

      const tagEl = document.getElementById('waitRoomTag');
      const titleEl = document.getElementById('waitRoomTitle');
      const formatEl = document.getElementById('waitRoomFormat');
      const lockEl = document.getElementById('waitRoomLock');
      const modeBadge = document.getElementById('waitRoomModeBadge');

      if (tagEl) tagEl.textContent = '#' + r.id;
      if (titleEl) titleEl.textContent = r.name;
      if (formatEl) formatEl.textContent = (r.rounds === 1) ? 'Best of 1' : ((r.rounds === 3) ? 'Best of 5' : 'Best of 3');
      if (lockEl) lockEl.textContent = r.hasPassword ? '🔒 มีรหัสผ่าน' : '🌐 สาธารณะ';
      if (modeBadge) modeBadge.textContent = '🌐 ออนไลน์ (Real-Time 1v1)';

      const subBadge = document.getElementById('waitRoomSubModeBadge');
      if (subBadge) {
        const smNames = {
          'Modern': '✨ แบบใหม่ (Modern)',
          'Classic': '🕹️ ดั้งเดิม (Classic)',
          'Sprint': '⏱️ Sprint 40',
          'Ultra': '⚡ Ultra Blitz',
          'BlockBlast': '🧩 Block Blast'
        };
        subBadge.textContent = smNames[r.subMode || 'Modern'] || r.subMode;
      }

      const hostName = document.getElementById('waitHostName');
      if (hostName) hostName.textContent = r.hostName || 'Player 1';

      const guestName = document.getElementById('waitGuestName');
      const guestStatus = document.getElementById('waitGuestStatus');
      const guestAvatar = document.getElementById('waitGuestAvatar');
      const btnStart = document.getElementById('btnStartMatch');

      const hasGuest = !!r.guestName;
      if (guestName) guestName.textContent = hasGuest ? r.guestName : 'กำลังรอผู้เล่นเข้าร่วม...';
      if (guestStatus) {
        guestStatus.textContent = hasGuest ? 'พร้อมแข่งขัน (Ready)' : 'รอผู้เล่น...';
        guestStatus.className = 'slot-status ' + (hasGuest ? 'ready' : '');
      }
      if (guestAvatar) guestAvatar.textContent = hasGuest ? '⚡' : '👤';

      if (btnStart) {
        if (!this.isHost) {
          btnStart.style.display = 'none';
        } else {
          btnStart.style.display = '';
          btnStart.disabled = !hasGuest;
          btnStart.style.opacity = hasGuest ? '1' : '0.5';
          btnStart.style.cursor = hasGuest ? 'pointer' : 'not-allowed';
        }
      }
    }

    startMatchCountdown() {
      if (this.isHost) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'START_MATCH' }));
        } else {
          this.broadcast('START_MATCH_SYNC', { roomId: this.currentRoom.id, rounds: this.currentRoom.rounds });
        }
      }

      this.myWins = 0;
      this.oppWins = 0;
      this.targetWins = this.currentRoom ? (this.currentRoom.rounds || 2) : 2;
      this.opponentName = this.isHost ? (this.currentRoom ? (this.currentRoom.guestName || 'Player 2') : 'Player 2') : (this.currentRoom ? (this.currentRoom.hostName || 'Host') : 'Host');

      activeVsSubMode = this.currentRoom ? (this.currentRoom.subMode || 'Modern') : 'Modern';

      const lobby = document.getElementById('multiplayerLobby');
      if (lobby) lobby.classList.add('hidden');

      setGameMode('Versus');
      this.updateStarsUI();

      const oppNameEl = document.getElementById('oppNameVal');
      if (oppNameEl) oppNameEl.textContent = this.opponentName;

      const oppScoreEl = document.getElementById('oppScoreVal');
      const oppLinesEl = document.getElementById('oppLinesVal');
      if (oppScoreEl) oppScoreEl.textContent = '0';
      if (oppLinesEl) oppLinesEl.textContent = '0';

      const koEl = document.getElementById('oppKoOverlay');
      if (koEl) koEl.classList.add('hidden');

      const titleEl = document.getElementById('vsMatchTitle');
      if (titleEl) {
        titleEl.textContent = (this.targetWins === 1) ? 'BEST OF 1' : ((this.targetWins === 3) ? 'BEST OF 5' : 'BEST OF 3');
      }

      this.startNewVsRound();
    }

    startNewVsRound() {
      vsPendingGarbage = 0;
      updateMainGarbageBarUI();

      const koEl = document.getElementById('oppKoOverlay');
      if (koEl) koEl.classList.add('hidden');

      // Configure subMode specific parameters
      const isClassicSub = (activeVsSubMode === 'Classic');
      const isSprintSub = (activeVsSubMode === 'Sprint');
      const isUltraSub = (activeVsSubMode === 'Ultra');
      const isBlockBlastSub = (activeVsSubMode === 'BlockBlast');

      // Update Classic hold/next panel titles
      const holdBox = document.getElementById('holdPanelBox');
      const holdTitle = holdBox ? holdBox.querySelector('.panel-title') : null;
      const nextBox = document.getElementById('nextPanelBox');
      const nextTitle = document.getElementById('nextPanelTitle');

      if (holdBox) holdBox.classList.toggle('disabled-panel', isClassicSub);
      if (holdTitle) holdTitle.textContent = isClassicSub ? 'HOLD (OFF)' : 'HOLD (C)';
      if (nextBox) nextBox.classList.remove('disabled-panel');
      if (nextTitle) nextTitle.textContent = isClassicSub ? 'NEXT (1)' : 'NEXT (3)';

      const timerBadge = document.getElementById('gameTimerBadge');
      if (timerBadge) {
        const isTimed = (isSprintSub || isUltraSub);
        timerBadge.classList.toggle('hidden', !isTimed);
        timerBadge.style.display = isTimed ? 'inline-block' : 'none';
        if (isTimed) {
          timerBadge.textContent = isSprintSub ? '00:00.00' : '02:00.00';
        }
      }

      if (isBlockBlastSub) {
        initBlockBlastGame();
      } else {
        startNewGame();
      }
    }

    updateStarsUI() {
      const myStarsEl = document.getElementById('myStarsVal');
      const oppStarsBadgeEl = document.getElementById('oppStarsBadgeVal');
      const oppStarsSideEl = document.getElementById('oppStarsVal');

      const myStarsText = '★'.repeat(this.myWins) + '☆'.repeat(Math.max(0, this.targetWins - this.myWins));
      const oppStarsText = '★'.repeat(this.oppWins) + '☆'.repeat(Math.max(0, this.targetWins - this.oppWins));

      if (myStarsEl) myStarsEl.textContent = myStarsText;
      if (oppStarsBadgeEl) oppStarsBadgeEl.textContent = oppStarsText;
      if (oppStarsSideEl) oppStarsSideEl.textContent = oppStarsText;
    }

    sendPlayerUpdate(data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PLAYER_UPDATE', ...data }));
      } else {
        this.broadcast('OPPONENT_UPDATE', data);
      }
    }

    sendGarbage(lineCount) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'SEND_GARBAGE', lines: lineCount }));
      } else {
        this.broadcast('RECEIVE_GARBAGE', { lines: lineCount });
      }
    }

    handleLocalPlayerTopOut() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PLAYER_TOP_OUT' }));
      } else {
        this.broadcast('PLAYER_TOP_OUT');
        this.oppWins++;
        this.updateStarsUI();
        if (this.oppWins >= this.targetWins) {
          setTimeout(() => this.showVictoryOverlay(this.opponentName, false), 800);
        } else {
          floatingTexts.push(new FloatingText('ROUND OVER!', (COLS * cellSize) / 2, 180, '#ef4444', 24));
          setTimeout(() => this.startNewVsRound(), 2000);
        }
      }
    }

    handleLocalPlayerWinRound() {
      this.myWins++;
      this.updateStarsUI();
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PLAYER_WIN_ROUND', subMode: activeVsSubMode }));
      } else {
        this.broadcast('PLAYER_WIN_ROUND');
      }

      if (this.myWins >= this.targetWins) {
        setTimeout(() => this.showVictoryOverlay(this.getPlayerName(), true), 1000);
      } else {
        setTimeout(() => this.startNewVsRound(), 2200);
      }
    }

    handleUltraTimeUp(myFinalScore) {
      const oppFinalScore = parseInt(document.getElementById('oppScoreVal')?.textContent?.replace(/,/g, '') || '0', 10);
      const won = myFinalScore >= oppFinalScore;

      if (won) {
        this.myWins++;
        floatingTexts.push(new FloatingText('TIME UP! YOU WIN! 🏆', (COLS * cellSize) / 2, 160, '#10b981', 24));
      } else {
        this.oppWins++;
        floatingTexts.push(new FloatingText('TIME UP! OPPONENT WINS!', (COLS * cellSize) / 2, 160, '#ef4444', 24));
      }
      this.updateStarsUI();

      if (this.myWins >= this.targetWins || this.oppWins >= this.targetWins) {
        setTimeout(() => this.showVictoryOverlay(won ? this.getPlayerName() : this.opponentName, won), 1200);
      } else {
        setTimeout(() => this.startNewVsRound(), 2400);
      }
    }

    handleOpponentTopOut() {
      const koEl = document.getElementById('oppKoOverlay');
      if (koEl) koEl.classList.remove('hidden');

      this.myWins++;
      this.updateStarsUI();
      floatingTexts.push(new FloatingText('KO! OPPONENT TOPPED OUT! 💥', (COLS * cellSize) / 2, 180, '#10b981', 24));

      if (this.myWins >= this.targetWins) {
        setTimeout(() => this.showVictoryOverlay(this.getPlayerName(), true), 1000);
      } else {
        setTimeout(() => this.startNewVsRound(), 2200);
      }
    }

    handleRoundOverServer(msg) {
      this.myWins = this.isHost ? msg.p1Wins : msg.p2Wins;
      this.oppWins = this.isHost ? msg.p2Wins : msg.p1Wins;
      this.updateStarsUI();

      floatingTexts.push(new FloatingText('ROUND WINNER: ' + msg.winnerName + '!', (COLS * cellSize) / 2, 180, '#fbbf24', 22));
      setTimeout(() => {
        if (this.isHost && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'START_NEXT_ROUND' }));
        }
      }, 2000);
    }

    handleMatchOverServer(msg) {
      this.myWins = this.isHost ? msg.p1Wins : msg.p2Wins;
      this.oppWins = this.isHost ? msg.p2Wins : msg.p1Wins;
      this.updateStarsUI();

      const iWon = (msg.winnerName === this.getPlayerName());
      this.showVictoryOverlay(msg.winnerName, iWon);
    }

    showVictoryOverlay(winnerName, isMe) {
      gameState = 'GAMEOVER';
      audioMgr.pauseBgm();

      const overlay = document.getElementById('vsGameOverOverlay');
      const titleEl = document.getElementById('vsWinnerTitle');
      const subEl = document.getElementById('vsWinnerSubtitle');
      const sumP1 = document.getElementById('vsSumP1');
      const sumP2 = document.getElementById('vsSumP2');
      const p1Lines = document.getElementById('vsStatLinesP1');
      const p2Lines = document.getElementById('vsStatLinesP2');

      if (titleEl) titleEl.textContent = isMe ? '🏆 YOU WIN!' : (winnerName + ' WINS!');
      if (subEl) subEl.textContent = isMe ? 'ยินดีด้วย! คุณคว้าชัยชนะในแมตช์นี้' : (winnerName + ' คว้าชัยชนะในแมตช์นี้');

      if (sumP1) sumP1.textContent = String(this.myWins);
      if (sumP2) sumP2.textContent = String(this.oppWins);
      if (p1Lines) p1Lines.textContent = String(lines);
      if (p2Lines) p2Lines.textContent = '-';

      if (overlay) overlay.classList.remove('hidden');
    }

    handleOpponentUpdate(data) {
      const oppScoreEl = document.getElementById('oppScoreVal');
      const oppLinesEl = document.getElementById('oppLinesVal');

      if (oppScoreEl && data.score !== undefined) {
        oppScoreEl.textContent = String(data.score.toLocaleString());
      }
      if (oppLinesEl && data.lines !== undefined) {
        oppLinesEl.textContent = String(data.lines);
      }

      if (data.boardSummary) {
        renderOpponentMiniBoard(data.boardSummary);
      }
    }

    refreshRooms() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'LIST_ROOMS' }));
      } else {
        this.cleanStaleRooms();
      }
    }

    renderRoomList() {
      const listEl = document.getElementById('lobbyRoomList');
      if (!listEl) return;

      listEl.innerHTML = '';
      const rooms = (this.ws && this.ws.readyState === WebSocket.OPEN) ? this.rooms : this.getRoomsFromStorage();

      if (rooms.length === 0) {
        listEl.innerHTML = '<div class="room-empty-state"><div class="room-empty-icon">📭</div><div>ยังไม่มีห้องที่เปิดอยู่</div><div style="font-size:0.75rem; color:#94a3b8;">กด "สร้างห้องใหม่" ฝั่งซ้ายเพื่อเป็น Host เปิดห้องได้เลย!</div></div>';
        return;
      }

      rooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';

        const lockIcon = room.hasPassword ? '🔒' : '🌐';
        const lockText = room.hasPassword ? 'มีรหัสผ่าน' : 'สาธารณะ';
        const lockClass = room.hasPassword ? 'room-badge-lock' : 'room-badge-public';
        const formatText = (room.rounds === 1) ? 'Best of 1' : ((room.rounds === 3) ? 'Best of 5' : 'Best of 3');

        const smMap = {
          'Modern': '✨ Modern',
          'Classic': '🕹️ Classic',
          'Sprint': '⏱️ Sprint 40',
          'Ultra': '⚡ Ultra',
          'BlockBlast': '🧩 BlockBlast'
        };
        const modeTag = smMap[room.subMode || 'Modern'] || (room.subMode || 'Modern');

        card.innerHTML = `
          <div class="room-card-info">
            <div class="room-card-title">${escapeHtml(room.name)}</div>
            <div class="room-card-meta">
              <span class="${lockClass}">${lockIcon} ${lockText}</span>
              <span>👑 ${escapeHtml(room.hostName)}</span>
              <span class="meta-chip" style="padding:2px 7px; font-size:0.7rem; background:rgba(56,189,248,0.15); color:#38bdf8;">${modeTag}</span>
              <span class="meta-chip" style="padding:2px 6px; font-size:0.7rem;">${formatText}</span>
            </div>
          </div>
          <button type="button" class="btn-lobby-accent btn-join-action" data-room-id="${room.id}">
            🎮 เข้าร่วม
          </button>
        `;

        card.querySelector('.btn-join-action').addEventListener('click', () => {
          this.joinRoom(room.id);
        });

        listEl.appendChild(card);
      });
    }
  }

  const lobbyMgr = new MultiplayerLobbyManager();


  function setGameMode(mode) {
    gameMode = mode;
    document.getElementById('modeBadge').textContent = (mode === 'Versus') ? 'MULTIPLAYER 1V1' : mode.toUpperCase();
    document.querySelectorAll('.mode-card').forEach(c => c.classList.toggle('active', c.getAttribute('data-mode') === mode));
    loadSavedData();
    applyModeUIRules();
    if (['PLAYING', 'PAUSED', 'GAMEOVER'].includes(gameState)) startNewGame();
  }

  function applyModeUIRules() {
    const isVersus = (gameMode === 'Versus');
    document.body.classList.toggle('mode-versus', isVersus);

    const btnStart = document.getElementById('btnStartGame');
    if (btnStart) {
      btnStart.textContent = isVersus ? '⚔️ เข้าสู่ล็อบบี้ห้องแข่งขัน (Multiplayer Lobby)' : '▶ เริ่มเล่นเกม';
    }

    const oppBox = document.getElementById('opponentPanelBox');
    if (oppBox) oppBox.classList.toggle('hidden', !isVersus);

    const mainGarb = document.getElementById('mainGarbageTrack');
    if (mainGarb) mainGarb.classList.toggle('hidden', !isVersus);

    const vsBadge = document.getElementById('vsMatchBadge');
    if (vsBadge) vsBadge.classList.toggle('hidden', !isVersus);

    const vsArena = document.getElementById('versusArena');
    if (vsArena) {
      vsArena.classList.add('hidden');
      vsArena.style.display = 'none';
    }

    if (isVersus) {
      audioMgr.init();
    }
    const isBlockBlast = (gameMode === 'BlockBlast');
    document.body.classList.toggle('mode-block-blast', isBlockBlast);

    const bbDock = document.getElementById('blockBlastDock');
    if (bbDock) {
      bbDock.classList.toggle('hidden', !isBlockBlast);
      bbDock.style.display = isBlockBlast ? 'flex' : 'none';
    }

    const isClassic = (gameMode === 'Classic');
    const holdBox = document.getElementById('holdPanelBox');
    const holdTitle = holdBox ? holdBox.querySelector('.panel-title') : null;
    const nextBox = document.getElementById('nextPanelBox');
    const nextTitle = document.getElementById('nextPanelTitle');
    const rightPanel = document.getElementById('rightPanel');
    const mobileControls = document.getElementById('mobileControls');
    const levelBox = document.getElementById('levelPanelBox');
    const linesBox = document.getElementById('linesPanelBox');

    if (holdBox) {
      holdBox.classList.toggle('disabled-panel', isClassic);
      holdBox.style.cursor = isClassic ? 'default' : 'pointer';
    }
    if (holdTitle) holdTitle.textContent = isClassic ? 'HOLD (OFF)' : 'HOLD (C)';

    if (nextBox) nextBox.classList.remove('disabled-panel');
    if (nextTitle) nextTitle.textContent = isClassic ? 'NEXT (1)' : 'NEXT (3)';

    const btnMcHold = document.getElementById('btnMcHold');
    const btnMcHard = document.getElementById('btnMcHard');
    if (btnMcHold) {
      btnMcHold.style.display = isClassic ? 'none' : '';
      btnMcHold.disabled = isClassic;
    }
    if (btnMcHard) {
      btnMcHard.style.display = isClassic ? 'none' : '';
      btnMcHard.disabled = isClassic;
    }

    const gestureHint = document.getElementById('gestureHint');
    if (gestureHint && !gestureHint.classList.contains('fade-out')) {
      if (isClassic) {
        gestureHint.textContent = '🕹️ โหมด Classic แท้: กราฟิก NES ไร้สกิน 100%, พรีวิว 1 ชิ้น, ไร้เงา, ไร้ระบบ Hold, ล็อกไวตามแบบฉบับดั้งเดิม';
      } else if (!isBlockBlast) {
        gestureHint.textContent = '👆 แตะในจอ = หมุนบล็อก | 👈👉 เลื่อนนิ้ว = ขยับ | 👇 รูดลง = ลงเร็ว | 👆 ปัดขึ้น = หมุนบล็อก';
      }
    }

    // ป้ายจับเวลา (แสดงเฉพาะโหมดจับเวลา Sprint และ Ultra เท่านั้น ไม่รกหน้าจอในโหมดอื่น)
    const isTimedMode = (gameMode === 'Sprint' || gameMode === 'Ultra');
    const timerBadge = document.getElementById('gameTimerBadge');
    if (timerBadge) {
      timerBadge.classList.toggle('hidden', !isTimedMode);
      timerBadge.style.display = isTimedMode ? 'inline-block' : 'none';
      if (isTimedMode) {
        timerBadge.textContent = (gameMode === 'Sprint') ? '00:00.00' : '02:00.00';
      }
    }

    if (isBlockBlast) {
      if (rightPanel) rightPanel.style.display = 'none';
      if (holdBox) holdBox.style.display = 'none';
      if (levelBox) levelBox.style.display = 'none';
      if (linesBox) linesBox.style.display = 'none';
      if (mobileControls) mobileControls.style.display = 'none';
    } else {
      if (rightPanel) rightPanel.style.display = '';
      if (holdBox) holdBox.style.display = '';
      if (levelBox) levelBox.style.display = '';
      if (linesBox) linesBox.style.display = '';
      if (mobileControls) mobileControls.style.display = 'flex';
    }
  }

  function closeOverlays() {
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('pauseOverlay').classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');
    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('achievementsOverlay').classList.add('hidden');
    const vsGov = document.getElementById('vsGameOverOverlay');
    if (vsGov) vsGov.classList.add('hidden');
    const rules = document.getElementById('rulesOverlay');
    if (rules) rules.classList.add('hidden');
    const lobby = document.getElementById('multiplayerLobby');
    if (lobby) lobby.classList.add('hidden');
    const passModal = document.getElementById('roomPasswordModal');
    if (passModal) passModal.classList.add('hidden');
  }

  
  // ==========================================
  // การควบคุมหน้าต่างกติกาและปุ่มควบคุม (Rules & Controls Guide)
  // ==========================================
  function openRulesModal(tabId = 'tabControls') {
    const overlay = document.getElementById('rulesOverlay');
    if (overlay) overlay.classList.remove('hidden');
    switchRulesTab(tabId);
  }

  function closeRulesModal() {
    const overlay = document.getElementById('rulesOverlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function switchRulesTab(tabId) {
    document.querySelectorAll('.rules-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.rules-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  }

  function openStartMenu() {
    gameState = 'START';
    audioMgr.pauseBgm();
    if (typeof versusManager !== 'undefined' && versusManager) {
      versusManager.state = 'IDLE';
    }
    const vsArena = document.getElementById('versusArena');
    if (vsArena) {
      vsArena.classList.add('hidden');
      vsArena.style.display = 'none';
    }
    closeOverlays();
    document.getElementById('startOverlay').classList.remove('hidden');
  }

  function togglePause() {
    if (gameMode === 'Versus' && typeof versusManager !== 'undefined') {
      if (versusManager.state === 'PLAYING') {
        versusManager.state = 'PAUSED';
        audioMgr.pauseBgm();
        document.getElementById('pauseOverlay').classList.remove('hidden');
      } else if (versusManager.state === 'PAUSED') {
        versusManager.state = 'PLAYING';
        audioMgr.resumeBgm();
        document.getElementById('pauseOverlay').classList.add('hidden');
      }
      return;
    }

    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      audioMgr.pauseBgm();
      document.getElementById('pauseOverlay').classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      audioMgr.resumeBgm();
      document.getElementById('pauseOverlay').classList.add('hidden');
    }
  }

  function openSettingsModal() {
    audioMgr.init();
    document.getElementById('chkToggleBgm').checked = audioMgr.bgmEnabled;
    document.getElementById('sliderBgmVolume').value = Math.round(audioMgr.bgmVolume * 100);
    document.getElementById('txtBgmVolume').textContent = `${Math.round(audioMgr.bgmVolume * 100)}%`;

    document.getElementById('chkToggleSfx').checked = audioMgr.sfxEnabled;
    document.getElementById('sliderSfxVolume').value = Math.round(audioMgr.sfxVolume * 100);
    document.getElementById('txtSfxVolume').textContent = `${Math.round(audioMgr.sfxVolume * 100)}%`;

    document.getElementById('chkReducedEffects').checked = reducedEffects;
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === currentTheme);
    });

    document.getElementById('settingsOverlay').classList.remove('hidden');
  }

  function closeSettingsModal() {
    document.getElementById('settingsOverlay').classList.add('hidden');
    updateSoundBtnIcon();
  }

  function openAchievementsModal() {
    renderAchievementsModal();
    document.getElementById('achievementsOverlay').classList.remove('hidden');
  }

  function closeAchievementsModal() {
    document.getElementById('achievementsOverlay').classList.add('hidden');
  }

  // การควบคุมคีย์บอร์ด
  window.addEventListener('keydown', (e) => {
    audioMgr.init();
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape') {
      const setM = document.getElementById('settingsModal');
      const achM = document.getElementById('achievementsModal');
      if (setM && !setM.classList.contains('hidden')) { closeSettingsModal(); return; }
      if (achM && !achM.classList.contains('hidden')) { closeAchievementsModal(); return; }
      togglePause();
      return;
    }
    if (e.code === 'KeyP') { togglePause(); return; }
    if (gameState !== 'PLAYING') return;

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      if (!inputState.left) { inputState.left = true; inputState.dasDir = -1; inputState.dasTimer = 0; inputState.arrTimer = 0; moveHorizontal(-1); }
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      if (!inputState.right) { inputState.right = true; inputState.dasDir = 1; inputState.dasTimer = 0; inputState.arrTimer = 0; moveHorizontal(1); }
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      inputState.down = true;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyX' || e.code === 'KeyW' || e.code === 'KeyK') {
      rotatePiece(1);
    } else if (e.code === 'KeyZ' || e.code === 'KeyQ' || e.code === 'KeyJ') {
      rotatePiece(-1);
    } else if (e.code === 'Space') {
      hardDrop();
    } else if (e.code === 'KeyC' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      holdCurrentPiece();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      inputState.left = false;
      if (inputState.right) { inputState.dasDir = 1; inputState.dasTimer = 0; } else { inputState.dasDir = 0; }
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      inputState.right = false;
      if (inputState.left) { inputState.dasDir = -1; inputState.dasTimer = 0; } else { inputState.dasDir = 0; }
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      inputState.down = false;
      inputState.softDropTimer = 0;
    }
  });

    function setupMobileButtonHandlers() {
    function bindRepeatingButton(btnId, actionFn, initialDelay = 150, repeatInterval = 50) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      let timer = null;
      let intervalTimer = null;

      function startPress(e) {
        if (e.cancelable) e.preventDefault();
        audioMgr.init();
        actionFn();
        clearInterval(intervalTimer);
        clearTimeout(timer);
        timer = setTimeout(() => {
          intervalTimer = setInterval(actionFn, repeatInterval);
        }, initialDelay);
      }

      function endPress(e) {
        clearTimeout(timer);
        clearInterval(intervalTimer);
        timer = null;
        intervalTimer = null;
      }

      btn.addEventListener('touchstart', startPress, { passive: false });
      btn.addEventListener('touchend', endPress, { passive: false });
      btn.addEventListener('touchcancel', endPress, { passive: false });
      btn.addEventListener('mousedown', startPress);
      btn.addEventListener('mouseup', endPress);
      btn.addEventListener('mouseleave', endPress);
    }

    function bindTapButton(btnId, actionFn) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        if (e.cancelable) e.preventDefault();
        audioMgr.init();
        actionFn();
      }, { passive: false });
      btn.addEventListener('click', (e) => {
        audioMgr.init();
        actionFn();
      });
    }

    bindRepeatingButton('btnMcLeft', () => moveHorizontal(-1), 160, 50);
    bindRepeatingButton('btnMcRight', () => moveHorizontal(1), 160, 50);
    bindRepeatingButton('btnMcDown', () => softDropStep(), 120, 40);

    bindTapButton('btnMcRotCW', () => rotatePiece(1));
    bindTapButton('btnMcRotCCW', () => rotatePiece(-1));
    bindTapButton('btnMcHard', () => hardDrop());
    bindTapButton('btnMcHold', () => holdCurrentPiece());
  }

  
  function isFullscreenActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }

  function toggleFullscreenMode() {
    try {
      if (!isFullscreenActive()) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) docEl.requestFullscreen();
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
        else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  }

  function updateFullscreenUI() {
    const btn = document.getElementById('btnFullscreen');
    if (btn) {
      const active = isFullscreenActive();
      btn.textContent = active ? '🗗 ย่อจอ' : '⛶ เต็มจอ';
      btn.title = active ? 'ออกจากโหมดเต็มจอ' : 'เข้าสู่โหมดเต็มจอ';
    }
    setTimeout(() => resizeCanvases(), 100);
  }

  function setupTouchControls() {
    // ==========================================
    // Enhanced Screen Gestures & Tap Controls
    // - Drag left/right: smooth continuous glide
    // - Tap Right half of board: Rotate Clockwise (↻)
    // - Tap Left half of board: Rotate Counter-Clockwise (↺)
    // - Flick Up: Rotate Clockwise (matching Up Arrow)
    // - Flick Down: Hard Drop
    // - Drag Down: Soft Drop
    // - Flick Left/Right: Fast 1-column move
    // ==========================================
    const boardContainer = boardCanvas.parentElement; // .board-container
    const gestureHint = document.getElementById('gestureHint');

    let activeTouchId = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastX = 0;
    let touchLastY = 0;
    let touchLastMoveX = 0;
    let touchLastDropY = 0;
    let touchStartTime = 0;
    let didDrag = false;
    let touchTotalDist = 0;

    function dismissHint() {
      if (gestureHint && !gestureHint.classList.contains('fade-out')) {
        gestureHint.classList.add('fade-out');
        setTimeout(() => { if (gestureHint) gestureHint.style.display = 'none'; }, 600);
      }
    }
    setTimeout(dismissHint, 8000);

    function spawnTouchRipple(clientX, clientY) {
      const rect = boardCanvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        touchRipples.push({
          x: x,
          y: y,
          radius: 8,
          maxRadius: Math.max(34, cellSize * 1.5),
          alpha: 0.85
        });
      }
    }

    function onGestureStart(clientX, clientY, identifier) {
      if (gameState !== 'PLAYING' || gameMode === 'BlockBlast') return;
      if (activeTouchId !== null) return;
      activeTouchId = identifier !== undefined ? identifier : 1;

      audioMgr.init();
      touchStartX = clientX;
      touchStartY = clientY;
      touchLastX = clientX;
      touchLastY = clientY;
      touchLastMoveX = clientX;
      touchLastDropY = clientY;
      touchStartTime = Date.now();
      didDrag = false;
      touchTotalDist = 0;

      dismissHint();
    }

    function onGestureMove(clientX, clientY, identifier, preventDefaultFn) {
      if (gameState !== 'PLAYING' || activeTouchId === null) return;
      if (identifier !== undefined && identifier !== activeTouchId) return;

      if (preventDefaultFn) preventDefaultFn();

      const moveDistX = clientX - touchLastX;
      const moveDistY = clientY - touchLastY;
      touchTotalDist += Math.hypot(moveDistX, moveDistY);

      if (touchTotalDist > 12) {
        didDrag = true;
      }

      // 1. Horizontal continuous glide (responsive)
      const colStepDist = Math.max(12, (cellSize || 24) * 0.58);
      const diffX = clientX - touchLastMoveX;

      if (Math.abs(diffX) >= colStepDist) {
        const step = Math.sign(diffX);
        const stepsCount = Math.floor(Math.abs(diffX) / colStepDist);
        for (let s = 0; s < Math.min(stepsCount, 4); s++) {
          moveHorizontal(step);
        }
        touchLastMoveX += step * stepsCount * colStepDist;
        if (navigator.vibrate) navigator.vibrate(6);
      }

      // 2. Vertical drag for Soft Drop
      const dropStepDist = Math.max(14, (cellSize || 24) * 0.72);
      const diffY = clientY - touchLastDropY;

      if (diffY >= dropStepDist) {
        const dropCount = Math.floor(diffY / dropStepDist);
        for (let d = 0; d < Math.min(dropCount, 4); d++) {
          softDropStep();
        }
        touchLastDropY += dropCount * dropStepDist;
        if (navigator.vibrate) navigator.vibrate(5);
      }

      touchLastX = clientX;
      touchLastY = clientY;
    }

    function onGestureEnd(clientX, clientY, identifier) {
      if (activeTouchId === null) return;
      if (identifier !== undefined && identifier !== activeTouchId) return;

      activeTouchId = null;
      if (gameState !== 'PLAYING') return;

      const elapsed = Date.now() - touchStartTime;
      const totalDeltaX = clientX - touchStartX;
      const totalDeltaY = clientY - touchStartY;
      const absX = Math.abs(totalDeltaX);
      const absY = Math.abs(totalDeltaY);

      // A. Fast Flick Down -> Hard Drop
      if (totalDeltaY > 44 && absY > absX * 1.15 && elapsed < 280) {
        hardDrop();
        if (navigator.vibrate) navigator.vibrate([15, 30, 20]);
        return;
      }

      // B. Fast Flick Up -> Rotate Clockwise (Matches Up Arrow)
      if (totalDeltaY < -36 && absY > absX * 1.15 && elapsed < 280) {
        rotatePiece(1);
        spawnTouchRipple(clientX, clientY);
        if (navigator.vibrate) navigator.vibrate(12);
        return;
      }

      // C. Fast Horizontal Flick Left / Right
      if (absX > 26 && absX > absY * 1.15 && elapsed < 300) {
        const dir = Math.sign(totalDeltaX);
        moveHorizontal(dir);
        if (navigator.vibrate) navigator.vibrate(8);
        return;
      }

      // D. Tap on Screen -> Rotate Piece!
      // Tap on Right half of board = Rotate Clockwise (↻)
      // Tap on Left half of board = Rotate Counter-Clockwise (↺)
      if (touchTotalDist < 35 && elapsed < 350) {
        const rect = boardCanvas.getBoundingClientRect();
        const touchRelX = clientX - rect.left;
        const midX = rect.width / 2;
        const rotDir = (touchRelX < midX) ? -1 : 1;
        rotatePiece(rotDir);
        spawnTouchRipple(clientX, clientY);
        if (navigator.vibrate) navigator.vibrate(12);
      }
    }

    // Touch Event Listeners on boardContainer
    boardContainer.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      if (touch) onGestureStart(touch.clientX, touch.clientY, touch.identifier);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === activeTouchId) {
          onGestureMove(t.clientX, t.clientY, t.identifier, () => {
            if (e.cancelable) e.preventDefault();
          });
          break;
        }
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === activeTouchId) {
          onGestureEnd(t.clientX, t.clientY, t.identifier);
          break;
        }
      }
    }, { passive: false });

    window.addEventListener('touchcancel', (e) => {
      activeTouchId = null;
    }, { passive: false });

    // Mouse fallback on Desktop
    let isMouseDown = false;
    boardContainer.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      onGestureStart(e.clientX, e.clientY, 9999);
    });
    window.addEventListener('mousemove', (e) => {
      if (isMouseDown) onGestureMove(e.clientX, e.clientY, 9999, null);
    });
    window.addEventListener('mouseup', (e) => {
      if (isMouseDown) {
        isMouseDown = false;
        onGestureEnd(e.clientX, e.clientY, 9999);
      }
    });

    // Tap HOLD box directly
    const holdBox = document.getElementById('holdPanelBox');
    if (holdBox) {
      holdBox.style.cursor = 'pointer';
      holdBox.addEventListener('click', () => {
        audioMgr.init();
        holdCurrentPiece();
        if (navigator.vibrate) navigator.vibrate(10);
      });
      holdBox.addEventListener('touchstart', (e) => {
        if (e.cancelable) e.preventDefault();
        audioMgr.init();
        holdCurrentPiece();
        if (navigator.vibrate) navigator.vibrate(10);
      }, { passive: false });
    }

    // Bind Mobile Control Pad Buttons
    setupMobileButtonHandlers();

    const btnFs = document.getElementById('btnFullscreen');
    if (btnFs) {
      btnFs.addEventListener('click', toggleFullscreenMode);
    }

    document.addEventListener('fullscreenchange', updateFullscreenUI);
    document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
    document.addEventListener('mozfullscreenchange', updateFullscreenUI);
    document.addEventListener('MSFullscreenChange', updateFullscreenUI);
  }

  const starBtns = document.querySelectorAll('.star-btn');
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (feedbackSubmitted) return;
      selectedRating = parseInt(btn.getAttribute('data-star'), 10);
      starBtns.forEach(b => b.classList.toggle('active', parseInt(b.getAttribute('data-star'), 10) <= selectedRating));
    });
  });

  document.getElementById('btnSubmitFeedback').addEventListener('click', async () => {
    if (feedbackSubmitted) return;
    const scriptUrl = getScriptUrl();
    const statusEl = document.getElementById('feedbackStatus');
    const feedbackText = document.getElementById('feedbackInput').value.trim();

    if (!feedbackText) {
      statusEl.textContent = '⚠️ กรุณาพิมพ์ Feedback ก่อนส่ง';
      statusEl.className = 'status-msg err';
      document.getElementById('feedbackInput').focus();
      return;
    }
    if (!scriptUrl) {
      statusEl.textContent = '⚠️ ไม่พบ URL ปลายทางสำหรับส่งข้อมูล';
      statusEl.className = 'status-msg err';
      return;
    }

    const playerName = resolvePlayerName(document.getElementById('playerNameInput').value);
    const btnSubmit = document.getElementById('btnSubmitFeedback');
    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ กำลังบันทึกข้อมูล...';
    statusEl.textContent = `กำลังส่งข้อมูล (${playerName})...`;
    statusEl.className = 'status-msg wait';

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ playerName, gameMode, score, level, linesCleared: lines, rating: selectedRating, feedback: feedbackText })
      });
      btnSubmit.textContent = '✅ บันทึกสำเร็จ';
      statusEl.textContent = 'บันทึกเรียบร้อย! ปลดล็อกปุ่มเล่นใหม่แล้ว';
      statusEl.className = 'status-msg ok';
      unlockPostFeedbackButtons();
    } catch (err) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = '📤 ส่งสถิติและ Feedback เพื่อปลดล็อก';
      statusEl.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      statusEl.className = 'status-msg err';
    }
  });

  // Event Listeners
    function safeOn(id, evt, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
  }

  
  // Rules Guide Events
  safeOn('btnAcceptRules', 'click', () => {
    audioMgr.init();
    closeRulesModal();
    openStartMenu();
  });

  safeOn('btnRulesTop', 'click', () => {
    openRulesModal('tabControls');
  });

  safeOn('btnOpenRulesFromStart', 'click', () => {
    openRulesModal('tabControls');
  });

  document.querySelectorAll('.rules-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) switchRulesTab(tabId);
    });
  });

  // Versus Victory Modal Events
  safeOn('btnVsRematch', 'click', () => {
    const overlay = document.getElementById('vsGameOverOverlay');
    if (overlay) overlay.classList.add('hidden');
    versusManager.startMatch();
  });

  safeOn('btnVsBackMenu', 'click', () => {
    const overlay = document.getElementById('vsGameOverOverlay');
    if (overlay) overlay.classList.add('hidden');
    openStartMenu();
  });

  safeOn('btnStartGame', 'click', () => {
    audioMgr.init();
    if (gameMode === 'Versus') {
      lobbyMgr.openLobby();
    } else {
      startNewGame();
    }
  });
  safeOn('btnResumeGame', 'click', () => togglePause());
  safeOn('btnOpenRulesFromPause', 'click', () => openRulesModal('tabControls'));
  safeOn('btnRestartFromPause', 'click', () => startNewGame());
    safeOn('btnMenuFromPause', 'click', () => openStartMenu());
    safeOn('btnPlayAgain', 'click', () => startNewGame());
  safeOn('btnBackToMenu', 'click', () => openStartMenu());
  safeOn('btnPause', 'click', () => togglePause());
  safeOn('btnRestartTop', 'click', () => startNewGame());

  safeOn('btnSound', 'click', () => openSettingsModal());
  safeOn('btnSettingsFromPause', 'click', () => openSettingsModal());
  safeOn('btnCloseSettings', 'click', () => closeSettingsModal());

  safeOn('btnTrophies', 'click', () => openAchievementsModal());
  safeOn('btnCloseAchievements', 'click', () => closeAchievementsModal());

  safeOn('chkToggleBgm', 'change', (e) => {
    audioMgr.setBgmEnabled(e.target.checked);
    updateSoundBtnIcon();
  });
  safeOn('sliderBgmVolume', 'input', (e) => {
    const val = parseInt(e.target.value, 10);
    const txt = document.getElementById('txtBgmVolume');
    if (txt) txt.textContent = `${val}%`;
    audioMgr.setBgmVolume(val / 100);
  });

  safeOn('chkToggleSfx', 'change', (e) => {
    audioMgr.setSfxEnabled(e.target.checked);
    updateSoundBtnIcon();
  });
  safeOn('sliderSfxVolume', 'input', (e) => {
    const val = parseInt(e.target.value, 10);
    const txt = document.getElementById('txtSfxVolume');
    if (txt) txt.textContent = `${val}%`;
    audioMgr.setSfxVolume(val / 100);
  });

  safeOn('chkReducedEffects', 'change', (e) => {
    reducedEffects = e.target.checked;
    try { localStorage.setItem('tetris_wood_reduced_effects', String(reducedEffects)); } catch (err) {}
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.getAttribute('data-theme'));
    });
  });

  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      setGameMode(card.getAttribute('data-mode'));
    });
  });

  

  window.addEventListener('DOMContentLoaded', () => {
    openRulesModal('tabControls');
    try { localStorage.removeItem('tetris_google_script_url'); } catch (e) {}
    initSecurityProtection();
    loadSavedTheme();
    loadAchievements();
    loadSavedData();
    applyModeUIRules();
    updateSoundBtnIcon();
    board = createEmptyBoard();
    initNextQueue();
    
    setupTouchControls();
    setupBlockBlastDragHandlers();
    setupMultiplayerLobbyEvents();
    resizeCanvases();
    requestAnimationFrame(gameLoop);
  });

  // Wire Multiplayer Lobby UI Events (ภายใน IIFE Scope)
  function setupMultiplayerLobbyEvents() {
    safeOn('btnLobbyBackMenu', 'click', () => {
      lobbyMgr.leaveRoom(false);
      openStartMenu();
    });

    safeOn('btnToggleRoomPass', 'click', () => {
      const input = document.getElementById('inputRoomPass');
      if (input) {
        input.type = (input.type === 'password') ? 'text' : 'password';
      }
    });

    // Event delegation สำหรับเลือกรอบตัดสิน Best of 1/3/5
    const segRounds = document.getElementById('lobbyRoundsSegment');
    if (segRounds) {
      segRounds.addEventListener('click', (e) => {
        const btn = e.target.closest('.seg-btn');
        if (!btn) return;
        segRounds.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        lobbyMgr.selectedRounds = parseInt(btn.getAttribute('data-rounds') || '2', 10);
      });
    }

    // Event delegation สำหรับเลือกโหมด 5 โหมดใน Multiplayer Lobby
    const picker = document.getElementById('lobbyModePicker');
    if (picker) {
      picker.addEventListener('click', (e) => {
        const btn = e.target.closest('.mode-pick-btn');
        if (!btn) return;
        picker.querySelectorAll('.mode-pick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sm = btn.getAttribute('data-submode') || 'Modern';
        lobbyMgr.selectedSubMode = sm;

        const descMap = {
          'Modern': '✨ แบบใหม่: กติกามาตรฐาน สุ่ม 7-Bag, SRS, Ghost, ดู 3 ชิ้นถัดไป, และมีบล็อกพิเศษผสม',
          'Classic': '🕹️ ดั้งเดิม: เรโทรแท้ 100%, 7 ชิ้นมาตรฐาน ไร้บล็อกพิเศษ, ไร้เงา, ไร้ระบบ Hold',
          'Sprint': '⏱️ จับเวลา: แข่งความเร็ว 1v1 ล้างครบ 40 แถวก่อนชนะรอบทันที!',
          'Ultra': '⚡ 2 นาที: จำกัดเวลา 120 วินาที ใครทำคะแนนสูงสุดเมื่อหมดเวลาชนะรอบ!',
          'BlockBlast': '🧩 ลากบล็อก: แข่งวางบล็อก 3 ชิ้นอิสระ ล้างแถวแนวนอน/แนวตั้งเพื่อทำแต้ม!'
        };
        const descEl = document.getElementById('lobbySubModeDesc');
        if (descEl) descEl.textContent = descMap[sm] || '';
      });
    }

    safeOn('btnCreateRoomSubmit', 'click', () => {
      const nameInput = document.getElementById('inputRoomName');
      const passInput = document.getElementById('inputRoomPass');
      const name = nameInput ? nameInput.value.trim() : '';
      const pass = passInput ? passInput.value.trim() : '';
      lobbyMgr.createRoom(name, pass, lobbyMgr.selectedRounds);
    });

    safeOn('btnRefreshRooms', 'click', () => lobbyMgr.refreshRooms());

    safeOn('btnQuickJoin', 'click', () => {
      const input = document.getElementById('inputQuickCode');
      if (input && input.value.trim()) {
        lobbyMgr.joinRoom(input.value.trim());
      }
    });

    safeOn('btnLeaveRoom', 'click', () => lobbyMgr.leaveRoom(true));

    safeOn('btnStartMatch', 'click', () => lobbyMgr.startMatchCountdown());

    safeOn('btnSubmitPassModal', 'click', () => lobbyMgr.submitPasswordPrompt());
    safeOn('btnCancelPassModal', 'click', () => {
      const modal = document.getElementById('roomPasswordModal');
      if (modal) modal.classList.add('hidden');
      lobbyMgr.pendingJoinRoom = null;
    });

    safeOn('btnVsBackLobby', 'click', () => {
      const overlay = document.getElementById('vsGameOverOverlay');
      if (overlay) overlay.classList.add('hidden');
      versusManager.state = 'IDLE';
      lobbyMgr.openLobby();
    });
  }

  // เรียกผูก Event ทันทีด้วย
  setupMultiplayerLobbyEvents();
})();
