(() => {
  'use strict';

  function gameCfg(key, fallback) {
    const s = window.YunfanDebugSettings?.get?.();
    if (!s) return fallback;
    const v = s[key];
    return v === undefined || v === null || v === '' ? fallback : v;
  }

  function drawStar(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawFlagCN(ctx, w, h) {
    ctx.fillStyle = '#DE2910';
    ctx.fillRect(0, 0, w, h);
    const u = w / 30;
    drawStar(ctx, 5 * u, 5 * u, 3 * u, '#FFDE00');
    [[10, 2], [12, 4], [12, 7], [10, 9]].forEach(([x, y]) => drawStar(ctx, x * u, y * u, u, '#FFDE00'));
  }

  function drawFlagUS(ctx, w, h) {
    const sh = h / 13;
    const cw = w * 0.4;
    const ch = sh * 7;
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#B22234' : '#FFFFFF';
      ctx.fillRect(0, i * sh, w, sh);
    }
    ctx.fillStyle = '#3C3B6E';
    ctx.fillRect(0, 0, cw, ch);
    const cols = 6;
    const rows = 5;
    const padX = cw * 0.08;
    const padY = ch * 0.12;
    const innerW = cw - padX * 2;
    const innerH = ch - padY * 2;
    const stepX = innerW / (cols - 0.5);
    const stepY = innerH / (rows - 1);
    const starR = Math.min(stepX, stepY) * 0.32;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = (r % 2) * stepX * 0.5;
        const x = padX + ox + c * stepX;
        const y = padY + r * stepY;
        if (x >= padX && x <= cw - padX && y >= padY && y <= ch - padY) {
          drawStar(ctx, x, y, starR, '#FFFFFF');
        }
      }
    }
  }

  function drawFlagJP(ctx, w, h) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#BC002D';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, h * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFlagGB(ctx, w, h) {
    ctx.fillStyle = '#012169';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = h * 0.14;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.stroke();
    ctx.strokeStyle = '#C8102E';
    ctx.lineWidth = h * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w * 0.42, 0, w * 0.16, h);
    ctx.fillRect(0, h * 0.38, w, h * 0.24);
    ctx.fillStyle = '#C8102E';
    ctx.fillRect(w * 0.45, 0, w * 0.1, h);
    ctx.fillRect(0, h * 0.41, w, h * 0.18);
  }

  function drawFlagFR(ctx, w, h) {
    ['#002395', '#FFFFFF', '#ED2939'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(i * w / 3, 0, w / 3, h);
    });
  }

  function drawFlagDE(ctx, w, h) {
    ['#000000', '#DD0000', '#FFCE00'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, i * h / 3, w, h / 3);
    });
  }

  function drawFlagIT(ctx, w, h) {
    ['#009246', '#FFFFFF', '#CE2B37'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(i * w / 3, 0, w / 3, h);
    });
  }

  function drawFlag(ctx, code, w, h) {
    ctx.clearRect(0, 0, w, h);
    switch (code) {
      case 'cn': drawFlagCN(ctx, w, h); break;
      case 'us': drawFlagUS(ctx, w, h); break;
      case 'jp': drawFlagJP(ctx, w, h); break;
      case 'gb': drawFlagGB(ctx, w, h); break;
      case 'fr': drawFlagFR(ctx, w, h); break;
      case 'de': drawFlagDE(ctx, w, h); break;
      case 'it': drawFlagIT(ctx, w, h); break;
      default: ctx.fillStyle = '#ccc'; ctx.fillRect(0, 0, w, h);
    }
  }

  function avgColorFromCanvas(canvas) {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 100) continue;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
    return n ? [Math.round(r / n), Math.round(g / n), Math.round(b / n)] : [0, 0, 0];
  }

  function colorMatch(a, b, tol = 42) {
    return Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
  }

  function drawGameBg(ctx, W, H, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function computeSwapGroup(code, pieceIndex, color) {
    const [r, g, b] = color;
    if (code === 'cn') {
      if (pieceIndex === 0 || (g > 85 && r > 140)) return `cn-star-${pieceIndex}`;
      if (r > 150 && g < 95 && b < 95) return 'cn-red';
      return `cn-${pieceIndex}`;
    }
    if (code === 'jp') {
      if (pieceIndex === 4 || (r > 120 && g < 140 && b < 140)) return 'jp-center';
      if ([0, 2, 6, 8].includes(pieceIndex) || (r > 195 && g > 195 && b > 195)) return 'jp-white';
      return `jp-${pieceIndex}`;
    }
    if (['fr', 'de', 'it'].includes(code)) {
      const q = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`;
      return `solid-${q}`;
    }
    return `exact-${pieceIndex}`;
  }

  const GENDERS = ['男', '女', '男同', '女同', '双', '武装直升机', '沃尔玛塑料袋', '猫'];

  /** 打砖块选性别 */
  function initGenderBrick(canvas, { onDone, toast }) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const GENDER_H = 28;
    const GENDER_Y = H - GENDER_H;
    const PADDLE_H = 10;
    const PADDLE_Y = GENDER_Y - PADDLE_H - 18;
    const paddle = { w: 110, h: PADDLE_H, x: W / 2 - 55, y: PADDLE_Y };
    let ball = null;
    let running = false;
    let done = false;
    let animId = null;
    const bricks = [];
    const cols = 10, bw = W / cols - 4, bh = 20;
    const colors = ['#64748b', '#475569', '#334155'];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({ x: 2 + c * (bw + 4), y: 36 + r * (bh + 4), w: bw, h: bh, alive: true, color: colors[r], isGender: false });
      }
    }
    const gw = W / GENDERS.length;
    GENDERS.forEach((g, i) => {
      bricks.push({
        x: i * gw, y: GENDER_Y, w: gw, h: GENDER_H,
        alive: true, gender: g, isGender: true,
        color: `hsl(${(i * 47) % 360}, 70%, 50%)`,
      });
    });

    function upperCleared() {
      return !bricks.some((b) => b.alive && !b.isGender);
    }

    function launch() {
      if (ball || done) return;
      ball = { x: paddle.x + paddle.w / 2, y: paddle.y - 10, vx: 3.5 * (Math.random() > 0.5 ? 1 : -1), vy: -5, r: 7 };
      running = true;
      if (!animId) animId = requestAnimationFrame(tick);
    }

    function draw() {
      drawGameBg(ctx, W, H, '#0c1222', '#1a1040');
      ctx.strokeStyle = 'rgba(99,102,241,0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      bricks.forEach((b) => {
        if (!b.alive) return;
        const grd = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        grd.addColorStop(0, b.color);
        grd.addColorStop(1, b.isGender ? b.color : '#1e293b');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
        if (b.isGender) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 11px "Segoe UI", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const label = b.gender.length > 5 ? b.gender.slice(0, 5) : b.gender;
          ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2);
        }
      });
      const pg = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
      pg.addColorStop(0, '#60a5fa');
      pg.addColorStop(1, '#2563eb');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
      ctx.fill();
      const genderBottom = GENDER_Y + GENDER_H;
      if (genderBottom < H) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, genderBottom, W, H - genderBottom);
      }
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GENDER_Y);
      ctx.lineTo(W, GENDER_Y);
      ctx.stroke();
      if (ball) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function resolveBrickHit(b) {
      if (b.isGender && !upperCleared()) {
        ball.vy *= -1;
        ball.y = Math.min(ball.y, b.y - ball.r - 0.5);
        return;
      }
      b.alive = false;
      ball.vy *= -1;
      if (b.isGender && !done) {
        done = true;
        running = false;
        ball = null;
        onDone(b.gender);
        toast(`性别砖块命中：${b.gender}`);
      }
    }

    function tick() {
      animId = requestAnimationFrame(tick);
      if (!running || !ball) { draw(); return; }

      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < ball.r) { ball.x = ball.r; ball.vx *= -1; }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx *= -1; }
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy *= -1; }

      bricks.forEach((b) => {
        if (!b.alive) return;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w
          && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          resolveBrickHit(b);
        }
      });

      const genderBottom = GENDER_Y + GENDER_H;
      if (ball.y + ball.r >= genderBottom) {
        ball.y = genderBottom - ball.r;
        ball.vy *= -1;
      } else if (!upperCleared() && ball.y + ball.r >= GENDER_Y && ball.vy > 0) {
        ball.y = GENDER_Y - ball.r;
        ball.vy *= -1;
      }

      if (ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h
        && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w && ball.vy > 0) {
        ball.vy = -Math.abs(ball.vy);
        ball.vx += (ball.x - (paddle.x + paddle.w / 2)) * 0.12;
        ball.y = paddle.y - ball.r;
      }

      draw();
    }

    function movePaddle(dx) {
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x + dx));
      paddle.y = PADDLE_Y;
    }

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      paddle.x = Math.max(0, Math.min(W - paddle.w, (e.clientX - rect.left) * (W / rect.width) - paddle.w / 2));
      paddle.y = PADDLE_Y;
    });
    canvas.addEventListener('click', launch);
    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); launch(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); movePaddle(-18); }
      if (e.key === 'ArrowRight') { e.preventDefault(); movePaddle(18); }
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      paddle.x = Math.max(0, Math.min(W - paddle.w, (t.clientX - rect.left) * (W / rect.width) - paddle.w / 2));
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); launch(); });

    draw();
    animId = requestAnimationFrame(tick);
    return { launch };
  }

  /** 坦克大战收集手机号 */
  function initTankPhone(canvas, ui, { onDigit, onComplete, onPlayerDeath, onResumePlay, toast, logEvent }) {
    const ctx = canvas.getContext('2d');
    const TS = 24;
    const COLS = 20, ROWS = 16;
    const W = COLS * TS, H = ROWS * TS;
    canvas.width = W;
    canvas.height = H;
    canvas.setAttribute('tabindex', '0');
    canvas.style.outline = 'none';

    const map = [];
    for (let r = 0; r < ROWS; r++) {
      map[r] = [];
      for (let c = 0; c < COLS; c++) {
        const border = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
        const block = !border && ((r % 2 === 0 && c % 2 === 0 && Math.random() < 0.45)
          || (r % 3 === 1 && c % 4 === 2 && Math.random() < 0.35));
        map[r][c] = border || block ? 1 : 0;
      }
    }
    for (let c = 1; c < COLS - 1; c++) { map[1][c] = 0; map[ROWS - 2][c] = 0; }
    for (let r = 1; r < ROWS - 1; r++) { map[r][1] = 0; map[r][COLS - 2] = 0; }

    const PLAYER_HOME = { gx: 2, gy: ROWS - 3 };
    const ENEMY_HOME = { gx: COLS - 3, gy: 2 };

    function clearHomeZone(home) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const gx = home.gx + dx;
          const gy = home.gy + dy;
          if (gx >= 1 && gy >= 1 && gx < COLS - 1 && gy < ROWS - 1) map[gy][gx] = 0;
        }
      }
    }
    clearHomeZone(PLAYER_HOME);
    clearHomeZone(ENEMY_HOME);

    const MOVE_DELAY = () => gameCfg('tankMoveDelay', 12);

    let slot = 0;
    const digits = [];
    const player = { gx: PLAYER_HOME.gx, gy: PLAYER_HOME.gy, dir: 1, cd: 0, moveCd: 0, inv: 0 };
    let bullets = [];
    let enemies = [];
    let animId = null;
    let tickN = 0;
    let started = false;
    let gameComplete = false;
    let debugFrozen = false;

    function nearHomeGrid(home) {
      for (let i = 0; i < 24; i++) {
        const gx = home.gx + Math.floor(Math.random() * 5) - 2;
        const gy = home.gy + Math.floor(Math.random() * 5) - 2;
        if (tileFreeInt(gx, gy, null)) return { gx, gy };
      }
      return { gx: home.gx, gy: home.gy };
    }

    const ENEMY_OFFSETS = [
      { gx: 0, gy: 0 }, { gx: -1, gy: 0 }, { gx: -2, gy: 0 },
      { gx: 0, gy: 1 }, { gx: -1, gy: 1 }, { gx: -2, gy: 1 },
      { gx: 0, gy: 2 }, { gx: -1, gy: 2 }, { gx: -2, gy: 2 }, { gx: -3, gy: 0 },
    ];

    function makeEnemy(digit) {
      const off = ENEMY_OFFSETS[digit] || { gx: 0, gy: 0 };
      let gx = ENEMY_HOME.gx + off.gx;
      let gy = ENEMY_HOME.gy + off.gy;
      if (!tileFreeInt(gx, gy, null)) {
        const p = nearHomeGrid(ENEMY_HOME);
        gx = p.gx; gy = p.gy;
      }
      return {
        gx, gy, digit, hp: 1,
        dir: Math.floor(Math.random() * 4),
        moveCd: Math.floor(Math.random() * 20),
        shootCd: 40 + Math.floor(Math.random() * 50),
      };
    }

    function initEnemies() {
      enemies = [];
      for (let d = 0; d <= 9; d++) enemies.push(makeEnemy(d));
    }
    initEnemies();

    function respawnEnemy(digit) {
      const i = enemies.findIndex((e) => e.digit === digit);
      if (i >= 0) enemies[i] = makeEnemy(digit);
    }

    function tileFreeInt(gx, gy, self) {
      if (gx < 1 || gy < 1 || gx >= COLS - 1 || gy >= ROWS - 1) return false;
      if (map[gy][gx]) return false;
      if (enemies.some((e) => e !== self && e.hp > 0 && e.gx === gx && e.gy === gy)) return false;
      if (self !== 'player' && player.gx === gx && player.gy === gy) return false;
      return true;
    }

    function tryPlayerMove(dgx, dgy, dir) {
      player.dir = dir;
      const nx = player.gx + dgx;
      const ny = player.gy + dgy;
      if (tileFreeInt(nx, ny, 'player')) {
        player.gx = nx;
        player.gy = ny;
        player.moveCd = MOVE_DELAY();
        return true;
      }
      return false;
    }

    function shoot(from, x, y, dir) {
      const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      const [dx, dy] = dirs[dir];
      bullets.push({ x, y, dx, dy, from });
    }

    function playerFire() {
      if (player.cd > 0) return;
      shoot('player', player.gx + 0.5, player.gy + 0.5, player.dir);
      player.cd = 28;
    }

    function resetDigits() {
      if (gameComplete) return;
      digits.length = 0;
      slot = 0;
      onPlayerDeath?.();
      updateUI();
    }

    function playerDie() {
      if (gameComplete) return;
      player.gx = PLAYER_HOME.gx;
      player.gy = PLAYER_HOME.gy;
      player.inv = 90;
      resetDigits();
      toast('坦克被击毁！号码已全部清零');
    }

    function updateUI() {
      const shown = digits.length ? digits.join(' ') : '';
      ui.display.textContent = shown + (slot < 11 ? ' _'.repeat(11 - digits.length) : '');
      ui.hint.textContent = debugFrozen
        ? '调试已跳过 · 点击画布可重新游玩'
        : gameComplete
        ? '手机号已集齐，本关结束'
        : slot < 11
          ? `场上 0-9 各一辆 · 格子对齐移动 · 敌方会射击 · 第 ${slot + 1}/11 位`
          : '号码已集齐';
    }

    function finishPhone() {
      if (gameComplete) return;
      const num = digits.join('');
      gameComplete = true;
      bullets = [];
      keys = {};
      updateUI();
      onComplete(num);
      toast('手机号收集完成！');
    }

    function collectDigit(d) {
      if (gameComplete || slot >= 11) return;
      if (slot === 0 && d !== 1) {
        toast('第一位必须是 1');
        return;
      }
      digits.push(d);
      slot++;
      logEvent('phone_tank', `第${slot}位=${d}`);
      onDigit(digits.join(''), slot);
      updateUI();
      if (slot >= 11) {
        const num = digits.join('');
        if (num === '10000000000') {
          toast('不允许 1 后全 0，请重新收集后几位');
          digits.splice(1);
          slot = 1;
          onDigit(digits.join(''), slot);
          updateUI();
          return;
        }
        finishPhone();
      }
    }

    function moveEnemies() {
      const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      enemies.forEach((e) => {
        if (e.hp <= 0) return;
        e.moveCd--;
        if (e.moveCd <= 0) {
          e.moveCd = gameCfg('tankEnemyMoveCdMin', 22)
            + Math.floor(Math.random() * (gameCfg('tankEnemyMoveCdMax', 39) - gameCfg('tankEnemyMoveCdMin', 22) + 1));
          if (Math.random() < 0.35) e.dir = Math.floor(Math.random() * 4);
          const [dx, dy] = dirs[e.dir];
          const nx = e.gx + dx;
          const ny = e.gy + dy;
          if (tileFreeInt(nx, ny, e)) { e.gx = nx; e.gy = ny; }
          else e.dir = Math.floor(Math.random() * 4);
        }
        e.shootCd = Math.max(0, e.shootCd - 1);
        if (e.shootCd <= 0 && Math.random() < 0.05) {
          shoot('enemy', e.gx + 0.5, e.gy + 0.5, e.dir);
          e.shootCd = 70 + Math.floor(Math.random() * 50);
        }
      });
    }

    function step() {
      if (!started || gameComplete) {
        draw();
        animId = requestAnimationFrame(step);
        return;
      }

      tickN++;
      player.cd = Math.max(0, player.cd - 1);
      player.moveCd = Math.max(0, player.moveCd - 1);
      if (player.inv > 0) player.inv--;

      if (tickN % 2 === 0) moveEnemies();

      bullets = bullets.filter((b) => {
        const spd = b.from === 'enemy' ? 0.1 : 0.2;
        b.x += b.dx * spd;
        b.y += b.dy * spd;
        const tx = Math.floor(b.x), ty = Math.floor(b.y);
        if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false;
        if (map[ty][tx]) return false;

        if (b.from === 'enemy' && player.inv <= 0
          && Math.abs(b.x - (player.gx + 0.5)) < 0.45
          && Math.abs(b.y - (player.gy + 0.5)) < 0.45) {
          playerDie();
          return false;
        }

        const hit = enemies.find((e) => e.hp > 0
          && e.gx === tx && e.gy === ty);
        if (hit && b.from === 'player') {
          const d = hit.digit;
          hit.hp = 0;
          if (slot < 11) collectDigit(d);
          setTimeout(() => respawnEnemy(d), 450);
          return false;
        }
        return true;
      });

      draw();
      animId = requestAnimationFrame(step);
    }

    function drawHome(home, color, label) {
      const x = home.gx * TS, y = home.gy * TS;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.22;
      ctx.fillRect(x - TS, y - TS, TS * 2, TS * 2);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - TS + 2, y - TS + 2, TS * 2 - 4, TS * 2 - 4);
      ctx.fillStyle = color;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, home.gx * TS + TS * 0.5, home.gy * TS - TS * 0.55);
    }

    function drawTank(x, y, color, digit) {
      const px = x * TS, py = y * TS;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(px - TS * 0.38, py - TS * 0.38, TS * 0.76, TS * 0.76, 4);
      ctx.fill();
      if (digit !== '') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(digit), px, py);
      }
    }

    function draw() {
      drawGameBg(ctx, W, H, '#14141f', '#0a1628');
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(30,41,59,0.45)' : 'rgba(15,23,42,0.45)';
          ctx.fillRect(c * TS, r * TS, TS, TS);
          if (map[r][c]) {
            ctx.fillStyle = '#475569';
            ctx.fillRect(c * TS + 1, r * TS + 1, TS - 2, TS - 2);
          }
        }
      }
      drawHome(PLAYER_HOME, '#22c55e', '我方基地');
      drawHome(ENEMY_HOME, '#ef4444', '敌方基地');
      enemies.forEach((e) => { if (e.hp > 0) drawTank(e.gx + 0.5, e.gy + 0.5, '#dc2626', e.digit); });
      if (player.inv > 0 && Math.floor(tickN / 4) % 2 === 0) {
        drawTank(player.gx + 0.5, player.gy + 0.5, '#86efac', '');
      } else {
        drawTank(player.gx + 0.5, player.gy + 0.5, '#22c55e', '');
      }
      bullets.forEach((b) => {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(b.x * TS, b.y * TS, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!started && !gameComplete) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('点击画布开始 · WASD 移动 · 空格射击', W / 2, H / 2);
      } else if (gameComplete) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = debugFrozen ? '#fde68a' : '#86efac';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(debugFrozen ? '调试已跳过' : '号码已集齐', W / 2, H / 2 - 10);
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText(digits.join(''), W / 2, H / 2 + 16);
        if (debugFrozen) {
          ctx.font = '12px sans-serif';
          ctx.fillText('点击画布可重新游玩', W / 2, H / 2 + 38);
        }
      } else if (document.activeElement !== canvas) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('点击画布 · WASD 移动 · 空格射击', W / 2, H / 2);
      }
    }

    function handleMoveKey(e) {
      if (!started || gameComplete) return;
      if (e.repeat) return;
      if (player.moveCd > 0) return;
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') tryPlayerMove(0, -1, 0);
      else if (k === 's' || k === 'arrowdown') tryPlayerMove(0, 1, 2);
      else if (k === 'a' || k === 'arrowleft') tryPlayerMove(-1, 0, 3);
      else if (k === 'd' || k === 'arrowright') tryPlayerMove(1, 0, 1);
    }

    function onKey(e) {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
        e.preventDefault();
      }
      if (k === ' ') {
        if (!e.repeat) playerFire();
        return;
      }
      handleMoveKey(e);
    }

    function resetPhoneGame() {
      slot = 0;
      digits.length = 0;
      gameComplete = false;
      debugFrozen = false;
      started = false;
      bullets = [];
      player.gx = PLAYER_HOME.gx;
      player.gy = PLAYER_HOME.gy;
      player.cd = 0;
      player.moveCd = 0;
      player.inv = 0;
      initEnemies();
      updateUI();
    }

    function markDebugSkipped(num) {
      debugFrozen = true;
      gameComplete = true;
      started = false;
      digits.length = 0;
      for (const ch of String(num)) digits.push(parseInt(ch, 10));
      slot = digits.length;
      bullets = [];
      updateUI();
    }

    canvas.addEventListener('click', () => {
      if (debugFrozen) {
        debugFrozen = false;
        onResumePlay?.();
        resetPhoneGame();
        return;
      }
      started = true;
      canvas.focus();
    });
    canvas.addEventListener('keydown', onKey);

    updateUI();
    draw();
    animId = requestAnimationFrame(step);
    return { resetPhone: resetPhoneGame, markDebugSkipped };
  }

  /** 老式转盘电话拨号生日 */
  function initBirthdayDial(root, { onDone, toast, logEvent }) {
    const y = 1980 + Math.floor(Math.random() * 40);
    const m = 1 + Math.floor(Math.random() * 12);
    const d = 1 + Math.floor(Math.random() * 28);
    const target = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
    const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    let dialed = '';
    let dragging = false;
    let lastPointerAngle = 0;
    let panelRot = 0;
    let pulse = 0;
    let snapAnim = null;

    root.innerHTML = `
      <div class="dial-phone">
        <div class="dial-display" id="dialDisplay">已拨：_ _ _ _ _ _ _ _</div>
        <p class="hint-text" id="dialHint">请拨出：${y}年${m}月${d}日 · 拖动面板旋转，松手确认数字</p>
        <div class="dial-wrap">
          <canvas id="dialCanvas" width="300" height="300"></canvas>
        </div>
      </div>
    `;
    const canvas = root.querySelector('#dialCanvas');
    const ctx = canvas.getContext('2d');
    const CX = 150, CY = 150, R = 118, HOLE_R = 16;

    function updateDisplay() {
      const slots = Array.from({ length: 8 }, (_, i) => dialed[i] ?? '_').join(' ');
      root.querySelector('#dialDisplay').textContent = `已拨：${slots}`;
    }

    function pointerAngle(e) {
      const rect = canvas.getBoundingClientRect();
      const sx = 300 / rect.width, sy = 300 / rect.height;
      const x = ((e.clientX ?? e.touches?.[0]?.clientX) - rect.left) * sx - CX;
      const y = ((e.clientY ?? e.touches?.[0]?.clientY) - rect.top) * sy - CY;
      return Math.atan2(y, x);
    }

    function digitAtHole() {
      const holeAng = panelRot - Math.PI / 2;
      let best = DIGITS[0], bestD = Infinity;
      DIGITS.forEach((n, i) => {
        const a = (i * 36 - 90) * Math.PI / 180;
        let diff = Math.abs(Math.atan2(Math.sin(a - holeAng), Math.cos(a - holeAng)));
        if (diff < bestD) { bestD = diff; best = n; }
      });
      return best;
    }

    function drawDial() {
      ctx.clearRect(0, 0, 300, 300);
      const bg = ctx.createRadialGradient(CX, CY, 20, CX, CY, R + 30);
      bg.addColorStop(0, '#fef3c7');
      bg.addColorStop(1, '#d4a574');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(CX, CY, R + 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(CX, CY, R - 50, 0, Math.PI * 2);
      ctx.fill();

      DIGITS.forEach((n, i) => {
        const a = (i * 36 - 90) * Math.PI / 180;
        const nx = CX + Math.cos(a) * (R - 22);
        const ny = CY + Math.sin(a) * (R - 22);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(nx, ny, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n), nx, ny);
      });

      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(panelRot);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, R - 8, 0, Math.PI * 2);
      ctx.arc(0, 0, R - 52, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, R - 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const holeAng = panelRot - Math.PI / 2;
      const hx = CX + Math.cos(holeAng) * (R - 30);
      const hy = CY + Math.sin(holeAng) * (R - 30);
      const holeDigit = digitAtHole();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(hx, hy, HOLE_R + 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(hx, hy, HOLE_R + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(holeDigit), hx, hy);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(CX - 10, 10);
      ctx.lineTo(CX + 10, 10);
      ctx.lineTo(CX, 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('读数窗', CX, 8);

      if (pulse > 0) {
        ctx.strokeStyle = `rgba(251,191,36,${pulse})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(CX, CY, R + 8, 0, Math.PI * 2);
        ctx.stroke();
        pulse = Math.max(0, pulse - 0.06);
      }
    }

    function snapBack(cb) {
      const start = panelRot;
      const t0 = performance.now();
      if (snapAnim) cancelAnimationFrame(snapAnim);
      const run = (t) => {
        const p = Math.min(1, (t - t0) / 320);
        panelRot = start * (1 - p);
        drawDial();
        if (p < 1) snapAnim = requestAnimationFrame(run);
        else { panelRot = 0; drawDial(); cb?.(); }
      };
      snapAnim = requestAnimationFrame(run);
    }

    function commitDigit(d) {
      if (dialed.length >= 8) return;
      dialed += String(d);
      logEvent('birthday_dial', `第${dialed.length}位=${d}`);
      pulse = 1;
      updateDisplay();
      toast(`拨号：${d}`);
      if (dialed.length >= 8) {
        if (dialed === target) {
          const date = `${dialed.slice(0, 4)}-${dialed.slice(4, 6)}-${dialed.slice(6, 8)}`;
          root.querySelector('#dialHint').textContent = `生日确认：${date}`;
          onDone(date);
          toast('转盘拨号完成！');
        } else {
          toast('号码不对，请重新拨号');
          dialed = '';
          updateDisplay();
        }
      }
    }

    function onDown(e) {
      e.preventDefault();
      if (dialed.length >= 8) return;
      dragging = true;
      lastPointerAngle = pointerAngle(e);
    }

    function onMove(e) {
      if (!dragging) return;
      e.preventDefault();
      const a = pointerAngle(e);
      let delta = a - lastPointerAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      panelRot += delta;
      lastPointerAngle = a;
      drawDial();
    }

    function onUp() {
      if (!dragging || dialed.length >= 8) { dragging = false; return; }
      dragging = false;
      const d = digitAtHole();
      snapBack(() => commitDigit(d));
    }

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    updateDisplay();
    drawDial();
    setInterval(() => { if (pulse > 0) drawDial(); }, 30);
  }

  const PAC_PARTS = [
    { id: 'eyes', label: '眼睛', emoji: '👀' },
    { id: 'nose', label: '鼻子', emoji: '👃' },
    { id: 'mouth', label: '嘴巴', emoji: '👄' },
    { id: 'hair', label: '头发', kind: 'shape', shape: 'hair' },
    { id: 'earL', label: '左耳', emoji: '👂' },
    { id: 'earR', label: '右耳', emoji: '👂' },
    { id: 'brow', label: '眉毛', kind: 'shape', shape: 'brow' },
  ];

  /** 吃豆人头像 */
  function initPacAvatar(canvas, dropzone, partsTray, { onAllEaten, onPlaced, onCaught, onResumePlay, toast }) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const TS = 20;
    const cols = Math.floor(W / TS), rows = Math.floor(H / TS);
    const MOVE_DELAY = () => gameCfg('pacMoveDelay', 12);
    const BEAN_PENALTY = () => gameCfg('pacBeanPenalty', 8);
    const PARTS_NEEDED = () => gameCfg('pacPartsNeeded', 7);
    const RESPAWN_GHOST_DIST = () => gameCfg('pacRespawnGhostDist', 5);
    const map = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) map[r][c] = 1;
      }
    }
    for (let c = 2; c < cols - 2; c += 2) map[Math.floor(rows / 2)][c] = 1;
    for (let r = 2; r < rows - 2; r += 3) {
      for (let c = 3; c < cols - 3; c += 4) map[r][c] = 1;
    }
    for (let c = 1; c < cols - 1; c++) if (c % 5 === 0) { map[2][c] = 1; map[rows - 3][c] = 1; }
    map[2][2] = 0; map[2][3] = 0; map[rows - 3][cols - 4] = 0;

    let ghosts = [];

    function cellFree(gx, gy, ignoreGhosts = false) {
      if (gx < 1 || gy < 1 || gx >= cols - 1 || gy >= rows - 1) return false;
      if (map[gy][gx]) return false;
      if (!ignoreGhosts && ghosts.some((g) => g.gx === gx && g.gy === gy)) return false;
      return true;
    }

    function occupy(gx, gy, list) {
      return list.some((o) => o.gx === gx && o.gy === gy);
    }

    function randomFreeCell(lists = []) {
      for (let t = 0; t < 80; t++) {
        const gx = 1 + Math.floor(Math.random() * (cols - 2));
        const gy = 1 + Math.floor(Math.random() * (rows - 2));
        if (!cellFree(gx, gy, true)) continue;
        if (lists.some((list) => occupy(gx, gy, list))) continue;
        return { gx, gy };
      }
      return null;
    }

    const portals = [];
    const portalPairs = [
      { color: '#a855f7', a: [3, 2], b: [cols - 4, rows - 3] },
      { color: '#22d3ee', a: [cols - 4, 2], b: [3, rows - 3] },
      { color: '#f97316', a: [Math.floor(cols / 2), 1], b: [Math.floor(cols / 2), rows - 2] },
      { color: '#84cc16', a: [2, Math.floor(rows / 2)], b: [cols - 3, Math.floor(rows / 2)] },
    ];
    portalPairs.forEach((pair, id) => {
      map[pair.a[1]][pair.a[0]] = 0;
      map[pair.b[1]][pair.b[0]] = 0;
      portals.push({ gx: pair.a[0], gy: pair.a[1], pairId: id, color: pair.color });
      portals.push({ gx: pair.b[0], gy: pair.b[1], pairId: id, color: pair.color });
    });

    const beans = [];
    for (let n = 0; n < gameCfg('pacInitialBeans', 48); n++) {
      const p = randomFreeCell([beans, portals]);
      if (p) beans.push({ ...p, eaten: false });
    }
    let beansRequired = beans.length;

    const partPellets = [];
    let pelletUid = 0;
    PAC_PARTS.forEach((part) => {
      for (let n = 0; n < 2; n++) {
        const p = randomFreeCell([beans, portals, partPellets]);
        if (p) partPellets.push({ uid: pelletUid++, ...part, ...p, eaten: false });
      }
    });

    function nextGhostMoveCd() {
      const min = gameCfg('pacGhostMoveCdMin', 22);
      const max = gameCfg('pacGhostMoveCdMax', 39);
      return min + Math.floor(Math.random() * (max - min + 1));
    }

    ghosts.push(
      { gx: cols - 3, gy: 2, color: '#ef4444', name: '赤鬼', attackRange: gameCfg('redGhostAttackRange', 3), style: 'chase', moveCd: Math.floor(Math.random() * 20) },
      { gx: cols - 3, gy: rows - 3, color: '#ec4899', name: '粉鬼', attackRange: 0, style: 'ambush', moveCd: Math.floor(Math.random() * 20) },
      { gx: 2, gy: rows - 3, color: '#06b6d4', name: '青鬼', attackRange: 0, style: 'lag', moveCd: Math.floor(Math.random() * 20) },
    );
    ghosts.forEach((g) => { map[g.gy][g.gx] = 0; });

    let player = { gx: 1, gy: 1, moveCd: 0, inv: 0, mouth: 0 };
    let lastPlayerDir = { dx: 1, dy: 0 };
    let phase = 'eat';
    let beansEaten = 0;
    let partsEaten = 0;
    let partsPlaced = 0;
    let animId = null;
    let started = false;
    let debugFrozen = false;
    let tickN = 0;
    let lastPortal = -1;
    let selectedTrayPart = null;

    function drawPac(gx, gy, mouthOpen, ghosted) {
      const px = gx * TS + TS / 2, py = gy * TS + TS / 2;
      const r = TS * 0.4;
      if (ghosted) ctx.globalAlpha = 0.45;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, r, 0.12, Math.PI * 2 - 0.12);
      ctx.lineTo(px, py);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (mouthOpen) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px + r * 0.35, py, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawGhostRange(g) {
      if (!g.attackRange) return;
      const px = g.gx * TS + TS / 2;
      const py = g.gy * TS + TS / 2;
      const r = TS * (g.attackRange + 0.35);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    function drawGhost(g) {
      const px = g.gx * TS + TS / 2;
      const py = g.gy * TS + TS / 2;
      const scale = g.attackRange ? 1.12 : 1;
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(px, py - 2, TS * 0.34 * scale, Math.PI, 0);
      ctx.lineTo(px + TS * 0.34 * scale, py + TS * 0.28 * scale);
      ctx.lineTo(px + TS * 0.12 * scale, py + TS * 0.14 * scale);
      ctx.lineTo(px - TS * 0.12 * scale, py + TS * 0.28 * scale);
      ctx.lineTo(px - TS * 0.34 * scale, py + TS * 0.28 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px - 4, py - 4, 3, 0, Math.PI * 2);
      ctx.arc(px + 4, py - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(px - 4, py - 4, 1.5, 0, Math.PI * 2);
      ctx.arc(px + 4, py - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPortal(p) {
      const x = p.gx * TS + 2, y = p.gy * TS + 2, s = TS - 4;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(x, y, s, s);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⇄', p.gx * TS + TS / 2, p.gy * TS + TS / 2);
    }

    function drawShapePellet(px, py, shape) {
      if (shape === 'hair') {
        ctx.strokeStyle = '#4a3728';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py + 2, 7, Math.PI, 0);
        ctx.stroke();
      } else if (shape === 'brow') {
        ctx.strokeStyle = '#4a3728';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 6, py);
        ctx.quadraticCurveTo(px, py - 3, px + 6, py);
        ctx.stroke();
      }
    }

    function createShapeNode(shape, small = false) {
      const wrap = document.createElement('span');
      wrap.className = 'part-shape-preview';
      if (shape === 'hair') {
        const d = document.createElement('div');
        d.className = 'shape-hair';
        if (small) { d.style.width = '28px'; d.style.height = '12px'; d.style.borderWidth = '2px'; }
        wrap.appendChild(d);
      } else if (shape === 'brow') {
        const d = document.createElement('div');
        d.className = 'shape-brow left';
        if (small) { d.style.width = '20px'; d.style.height = '3px'; }
        wrap.appendChild(d);
      }
      return wrap;
    }

    function drawMaze() {
      drawGameBg(ctx, W, H, '#050510', '#0f172a');
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (map[r][c]) {
            const g = ctx.createLinearGradient(c * TS, r * TS, c * TS, r * TS + TS);
            g.addColorStop(0, '#3b82f6');
            g.addColorStop(1, '#1e3a8a');
            ctx.fillStyle = g;
            ctx.fillRect(c * TS, r * TS, TS, TS);
            ctx.strokeStyle = 'rgba(147,197,253,0.3)';
            ctx.strokeRect(c * TS + 0.5, r * TS + 0.5, TS - 1, TS - 1);
          }
        }
      }
      portals.forEach(drawPortal);
      beans.forEach((b) => {
        if (b.eaten) return;
        const px = b.gx * TS + TS / 2, py = b.gy * TS + TS / 2;
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      partPellets.forEach((p) => {
        if (p.eaten) return;
        const px = p.gx * TS + TS / 2, py = p.gy * TS + TS / 2;
        if (p.kind === 'shape') drawShapePellet(px, py, p.shape);
        else {
          ctx.font = `${TS - 4}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, px, py);
        }
      });
      ghosts.forEach(drawGhostRange);
      ghosts.forEach(drawGhost);
      if (phase === 'eat') {
        const blink = player.inv > 0 && Math.floor(tickN / 4) % 2 === 0;
        if (!blink) drawPac(player.gx, player.gy, Math.sin(player.mouth) > 0, false);
      }
      if (phase === 'eat') {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`豆子 ${beansEaten}/${beansRequired} · 部件 ${partsEaten}/${PARTS_NEEDED()}`, 8, 14);
      }
      if (phase === 'eat' && debugFrozen) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('调试已跳过', W / 2, H / 2 - 12);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText('点击画布可重新游玩', W / 2, H / 2 + 10);
      } else if (phase === 'eat' && !started) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('点击画布开始 · 格子移动 · 吃够豆子并收集 7 个部件', W / 2, H / 2 - 18);
        ctx.font = '12px sans-serif';
        ctx.fillText('鬼魂会自行巡逻追击 · 赤鬼远距抓人', W / 2, H / 2 + 6);
        ctx.fillText('粉鬼预判 · 青鬼滞后 · 同色传送门可互换', W / 2, H / 2 + 24);
      }
    }

    function addPartToTray(part) {
      const el = document.createElement('div');
      el.className = 'avatar-part pac-part';
      el.dataset.partId = part.id;
      el.dataset.partUid = String(part.uid);
      if (part.kind === 'shape') {
        el.dataset.partShape = part.shape;
        el.appendChild(createShapeNode(part.shape, true));
        el.appendChild(document.createTextNode(` ${part.label}`));
      } else {
        el.dataset.emoji = part.emoji;
        el.textContent = `${part.emoji} ${part.label}`;
      }
      partsTray.appendChild(el);
    }

    function placeOnDropzone(id, uid, emoji, localX, localY, trayEl, shape) {
      if (phase !== 'drag') return;
      if (partsPlaced >= PARTS_NEEDED()) return;
      if (dropzone.querySelector(`[data-part-uid="${uid}"]`)) return;
      const rect = dropzone.getBoundingClientRect();
      const el = document.createElement('div');
      el.className = 'placed-part pac-placed';
      el.dataset.partId = id;
      el.dataset.partUid = uid;
      if (shape) {
        el.dataset.partShape = shape;
        el.appendChild(createShapeNode(shape));
      } else {
        el.textContent = emoji;
      }
      el.style.left = Math.max(0, Math.min(rect.width - 24, localX - 12)) + 'px';
      el.style.top = Math.max(0, Math.min(rect.height - 24, localY - 12)) + 'px';
      enableDrag(el, dropzone);
      dropzone.appendChild(el);
      dropzone.classList.add('has-parts');
      dropzone.classList.remove('drop-target-active');
      trayEl?.remove();
      partsPlaced++;
      selectedTrayPart = null;
      partsTray.querySelectorAll('.pac-part').forEach((el) => el.classList.remove('selected'));
      onPlaced();
    }

    function selectTrayPart(partEl) {
      if (phase !== 'drag' || !partEl) return;
      partsTray.querySelectorAll('.pac-part').forEach((el) => el.classList.remove('selected'));
      partEl.classList.add('selected');
      selectedTrayPart = partEl;
      dropzone.classList.add('drop-target-active');
      toast('点击头像区域放置，或拖拽过去');
    }

    function setupTrayPointerDrag() {
      partsTray.addEventListener('click', (e) => {
        const partEl = e.target.closest('.pac-part');
        if (partEl) selectTrayPart(partEl);
      });
      partsTray.addEventListener('pointerdown', (e) => {
        const partEl = e.target.closest('.pac-part');
        if (!partEl || phase !== 'drag') return;
        if (partsPlaced >= PARTS_NEEDED()) return;
        e.preventDefault();
        selectTrayPart(partEl);
        const id = partEl.dataset.partId;
        const uid = partEl.dataset.partUid;
        const emoji = partEl.dataset.emoji;
        const shape = partEl.dataset.partShape;
        const ghost = document.createElement('div');
        ghost.className = 'pac-drag-ghost';
        ghost.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:9999;font-size:2rem;transform:translate(-50%,-50%);';
        if (shape) ghost.appendChild(createShapeNode(shape));
        else ghost.textContent = emoji;
        document.body.appendChild(ghost);
        const moveGhost = (ev) => {
          ghost.style.left = ev.clientX + 'px';
          ghost.style.top = ev.clientY + 'px';
        };
        const endDrag = (ev) => {
          document.removeEventListener('pointermove', moveGhost);
          document.removeEventListener('pointerup', endDrag);
          document.removeEventListener('pointercancel', endDrag);
          ghost.remove();
          const dzRect = dropzone.getBoundingClientRect();
          if (ev.clientX >= dzRect.left && ev.clientX <= dzRect.right
            && ev.clientY >= dzRect.top && ev.clientY <= dzRect.bottom) {
            placeOnDropzone(id, uid, emoji, ev.clientX - dzRect.left, ev.clientY - dzRect.top, partEl, shape);
          }
        };
        document.addEventListener('pointermove', moveGhost);
        document.addEventListener('pointerup', endDrag);
        document.addEventListener('pointercancel', endDrag);
        moveGhost(e);
      });
    }

    function tryTeleport() {
      const here = portals.find((p) => p.gx === player.gx && p.gy === player.gy);
      if (!here || here.pairId === lastPortal) return;
      const dest = portals.find((p) => p.pairId === here.pairId && (p.gx !== here.gx || p.gy !== here.gy));
      if (dest && cellFree(dest.gx, dest.gy, true)) {
        player.gx = dest.gx;
        player.gy = dest.gy;
        lastPortal = here.pairId;
      }
    }

    function collectAt(gx, gy) {
      const bean = beans.find((b) => !b.eaten && b.gx === gx && b.gy === gy);
      if (bean) {
        bean.eaten = true;
        beansEaten++;
      }
      const part = partPellets.find((p) => !p.eaten && p.gx === gx && p.gy === gy);
      if (part && partsEaten < PARTS_NEEDED()) {
        part.eaten = true;
        partsEaten++;
        addPartToTray(part);
      }
    }

    function minGhostDist(gx, gy) {
      return Math.min(...ghosts.map((g) => Math.abs(g.gx - gx) + Math.abs(g.gy - gy)));
    }

    function findPlayerRespawn() {
      const safe = [];
      const fallback = [];
      for (let gy = 1; gy < rows - 1; gy++) {
        for (let gx = 1; gx < cols - 1; gx++) {
          if (!cellFree(gx, gy, true)) continue;
          if (ghosts.some((g) => g.gx === gx && g.gy === gy)) continue;
          const d = minGhostDist(gx, gy);
          fallback.push({ gx, gy, d });
          if (d >= RESPAWN_GHOST_DIST()) safe.push({ gx, gy, d });
        }
      }
      const pool = safe.length ? safe : fallback;
      if (!pool.length) return { gx: 1, gy: 1 };
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function ghostTarget(g) {
      if (g.style === 'ambush') {
        return {
          gx: player.gx + lastPlayerDir.dx * 4,
          gy: player.gy + lastPlayerDir.dy * 4,
        };
      }
      if (g.style === 'lag') {
        return {
          gx: player.gx - lastPlayerDir.dx * 4,
          gy: player.gy - lastPlayerDir.dy * 4,
        };
      }
      return { gx: player.gx, gy: player.gy };
    }

    function moveGhostOneStep(g, reserved) {
      const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      const target = ghostTarget(g);
      const options = [];
      dirs.forEach(([dx, dy]) => {
        const nx = g.gx + dx;
        const ny = g.gy + dy;
        const key = `${nx},${ny}`;
        if (nx < 1 || ny < 1 || nx >= cols - 1 || ny >= rows - 1) return;
        if (map[ny][nx]) return;
        if (ghosts.some((o) => o !== g && o.gx === nx && o.gy === ny)) return;
        if (reserved.has(key)) return;
        const d = Math.abs(nx - target.gx) + Math.abs(ny - target.gy);
        options.push({ nx, ny, d, key });
      });
      if (!options.length) return false;
      options.sort((a, b) => a.d - b.d);
      const bestD = options[0].d;
      const tied = options.filter((o) => o.d === bestD);
      const pick = tied[Math.floor(Math.random() * tied.length)];
      g.gx = pick.nx;
      g.gy = pick.ny;
      reserved.add(pick.key);
      return true;
    }

    function moveGhosts() {
      const reserved = new Set();
      ghosts.forEach((g) => {
        g.moveCd--;
        if (g.moveCd > 0) return;
        moveGhostOneStep(g, reserved);
        g.moveCd = nextGhostMoveCd();
      });
    }

    function tickGhosts() {
      if (phase !== 'eat' || !started || debugFrozen || tickN % 2 !== 0) return;
      moveGhosts();
      checkGhostHit();
    }

    function ghostHitsPlayer(g) {
      const dist = Math.abs(g.gx - player.gx) + Math.abs(g.gy - player.gy);
      if (g.attackRange && dist > 0 && dist <= g.attackRange) return true;
      return dist === 0;
    }

    function checkGhostHit() {
      if (player.inv > 0) return;
      const attacker = ghosts.find((g) => ghostHitsPlayer(g));
      if (!attacker) return;
      beansEaten = Math.max(0, beansEaten - BEAN_PENALTY());
      let respawned = 0;
      for (const b of beans) {
        if (b.eaten && respawned < BEAN_PENALTY()) {
          b.eaten = false;
          respawned++;
        }
      }
      while (respawned < BEAN_PENALTY()) {
        const p = randomFreeCell([beans, portals, partPellets.filter((x) => !x.eaten)]);
        if (!p) break;
        beans.push({ ...p, eaten: false });
        beansRequired++;
        respawned++;
      }
      player.inv = 70;
      const spawn = findPlayerRespawn();
      player.gx = spawn.gx;
      player.gy = spawn.gy;
      lastPortal = -1;
      toast(attacker.attackRange
        ? `${attacker.name}远程抓住了你！豆子 -${BEAN_PENALTY()}`
        : `被${attacker.name}抓住！豆子 -${BEAN_PENALTY()}`);
      onCaught?.();
    }

    function tryFinishEatPhase() {
      if (beansEaten < beansRequired || partsEaten < PARTS_NEEDED()) return;
      phase = 'drag';
      toast('豆子与部件已集齐，请拖到头像区域');
      onAllEaten();
    }

    function tryPlayerMove(dgx, dgy) {
      if (debugFrozen || player.moveCd > 0) return;
      const nx = player.gx + dgx;
      const ny = player.gy + dgy;
      if (!cellFree(nx, ny)) return;
      if (dgx !== 0 || dgy !== 0) lastPlayerDir = { dx: dgx, dy: dgy };
      player.gx = nx;
      player.gy = ny;
      player.moveCd = MOVE_DELAY();
      lastPortal = -1;
      tryTeleport();
      collectAt(player.gx, player.gy);
      checkGhostHit();
      tryFinishEatPhase();
    }

    function handleMoveKey(e) {
      if (phase !== 'eat' || !started || debugFrozen) return;
      if (e.repeat) return;
      if (player.moveCd > 0) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') tryPlayerMove(0, -1);
      else if (k === 'arrowdown' || k === 's') tryPlayerMove(0, 1);
      else if (k === 'arrowleft' || k === 'a') tryPlayerMove(-1, 0);
      else if (k === 'arrowright' || k === 'd') tryPlayerMove(1, 0);
    }

    function step() {
      tickN++;
      if (phase === 'eat' && started) {
        player.mouth += 0.2;
        player.moveCd = Math.max(0, player.moveCd - 1);
        if (player.inv > 0) player.inv--;
        tickGhosts();
      }
      drawMaze();
      animId = requestAnimationFrame(step);
    }

    dropzone.addEventListener('dragover', (e) => e.preventDefault());
    dropzone.addEventListener('dragenter', (e) => e.preventDefault());
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('partId') || e.dataTransfer.getData('text/partId');
      const uid = e.dataTransfer.getData('partUid') || e.dataTransfer.getData('text/partUid');
      const emoji = e.dataTransfer.getData('emoji') || e.dataTransfer.getData('text/emoji');
      const shape = e.dataTransfer.getData('partShape') || e.dataTransfer.getData('text/partShape');
      if (!uid || (!id && !shape)) return;
      const rect = dropzone.getBoundingClientRect();
      const trayEl = partsTray.querySelector(`[data-part-uid="${uid}"]`);
      placeOnDropzone(id, uid, emoji, e.clientX - rect.left, e.clientY - rect.top, trayEl, shape || undefined);
    });

    setupTrayPointerDrag();

    dropzone.addEventListener('click', (e) => {
      if (phase !== 'drag' || !selectedTrayPart || partsPlaced >= PARTS_NEEDED()) return;
      const rect = dropzone.getBoundingClientRect();
      const id = selectedTrayPart.dataset.partId;
      const uid = selectedTrayPart.dataset.partUid;
      const emoji = selectedTrayPart.dataset.emoji;
      const shape = selectedTrayPart.dataset.partShape;
      placeOnDropzone(id, uid, emoji, e.clientX - rect.left, e.clientY - rect.top, selectedTrayPart, shape || undefined);
    });

    function enableDrag(el, zone) {
      el.style.position = 'absolute';
      el.style.cursor = 'grab';
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        el.setPointerCapture(ev.pointerId);
        el.style.cursor = 'grabbing';
        const rect = zone.getBoundingClientRect();
        const startX = ev.clientX;
        const startY = ev.clientY;
        const origL = parseFloat(el.style.left) || 0;
        const origT = parseFloat(el.style.top) || 0;
        const onMove = (ev2) => {
          const nl = origL + ev2.clientX - startX;
          const nt = origT + ev2.clientY - startY;
          el.style.left = Math.max(0, Math.min(rect.width - 20, nl)) + 'px';
          el.style.top = Math.max(0, Math.min(rect.height - 20, nt)) + 'px';
        };
        const onUp = () => {
          el.style.cursor = 'grab';
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerup', onUp);
          el.removeEventListener('pointercancel', onUp);
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
      });
    }

    function onKey(e) {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
        handleMoveKey(e);
      }
    }
    function markDebugSkipped() {
      debugFrozen = true;
      started = false;
    }

    function unmarkDebugSkipped() {
      debugFrozen = false;
      started = false;
    }

    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('click', () => {
      if (debugFrozen) {
        debugFrozen = false;
        onResumePlay?.();
        started = false;
        return;
      }
      started = true;
      canvas.focus();
    });
    canvas.addEventListener('keydown', onKey);
    drawMaze();
    animId = requestAnimationFrame(step);
    return { getPhase: () => phase, markDebugSkipped, unmarkDebugSkipped, PAC_PARTS };
  }

  window.RegisterGames = {
    drawFlag,
    avgColorFromCanvas,
    colorMatch,
    computeSwapGroup,
    GENDERS,
    initGenderBrick,
    initTankPhone,
    initBirthdayDial,
    initPacAvatar,
    PAC_PARTS,
  };
})();
