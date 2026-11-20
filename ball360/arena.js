'use strict';

function showArenaReplay(card, sport, result, runScore) {
  const replay = document.createElement('div');
  replay.className = 'arena-replay';
  replay.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 500;
  const call = document.createElement('p');
  call.className = 'arena-call';
  call.textContent = result.correct ? (sport === 'NFL' ? 'IT’S GOOD!' : 'SWISH!') : 'NO GOOD';
  const scoreboard = document.createElement('div');
  scoreboard.className = 'arena-scoreboard';
  const league = document.createElement('span');
  league.textContent = sport + ' · ' + result.wager + ' PT WAGER';
  const total = document.createElement('strong');
  scoreboard.append(league, total);
  replay.append(canvas, scoreboard, call);
  card.prepend(replay);
  let ctx = canvas.getContext('2d');
  if (!ctx) return;

  const football = sport === 'NFL';
  const made = result.correct;
  const goal = football ? [748, 178] : [735, 221];
  const start = football ? [255, 359] : [230, 276];
  const impact = made ? goal : [goal[0] - (football ? 124 : 25), goal[1] + (football ? 39 : -7)];
  const duration = 2280;
  const earned = result.earned || 0;
  const before = (runScore || earned) - earned;
  const accent = made ? '#ff6377' : '#ddd2d5';
  const crowd = Array.from({length: 430}, (_, i) => {
    const row = Math.floor(i / 86);
    return [i % 86 * 12 + (i * 37 % 7), 104 + row * 28 + (i * 47 % 13), i * 29 % 7];
  });
  const colors = ['#6f222e','#993b49','#99535c','#55515d','#77707d','#9e8587','#684354'];

  function line(points, color, width) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  function oval(x, y, rx, ry, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function surface(colors, from, to) {
    const gradient = ctx.createLinearGradient(0, from, 0, to);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, from, 1000, to - from);
  }

  function drawVenue() {
    surface(['#1b1117','#34232d'], 0, 500);
    for (const x of [92, 295, 710, 907]) {
      const light = ctx.createRadialGradient(x, 49, 3, x, 49, 175);
      light.addColorStop(0, '#ffc1ba96');
      light.addColorStop(1, '#ff767100');
      ctx.fillStyle = light;
      ctx.fillRect(x - 175, 0, 350, 224);
      for (let i = -1; i <= 1; i++) oval(x + i * 13, 47, 4.5, 3, '#fff4d8');
    }
    for (let row = 0; row < 5; row++) {
      const y = 99 + row * 28;
      ctx.fillStyle = row % 2 ? '#3c252e' : '#251b23';
      ctx.fillRect(0, y, 1000, 27);
      line([[0,y + 25],[1000,y + 25]], '#8991a440', 2);
    }
    for (const [x,y,color] of crowd) {
      line([[x,y + 10],[x,y + 5]], colors[color], 5);
      oval(x,y,2.6,3,'#c6a98d');
    }
    ctx.fillStyle = '#1b1117';
    ctx.fillRect(0, 246, 1000, 33);
    ctx.fillStyle = '#d3d9e3';
    ctx.font = '700 14px system-ui';
    ctx.textAlign = 'center';
    for (const x of [125,375,625,875]) ctx.fillText('BALL360', x, 268);

    surface(football ? ['#383131','#201c20'] : ['#674347','#30222b'], 279, 500);
    for (let i = 0; i <= 10; i++) {
      const margin = i * 92;
      line([[margin,280],[margin * 1.48 - 215,500]], football ? '#d8bcbc68' : '#18141670', football ? 2 : 1);
    }
    for (const y of [291,329,378,447]) {
      line([[0,y],[1000,y]], football ? '#d8bcbc50' : '#f5c3ba66', football ? 2 : 1);
    }
    if (!football) {
      line([[663,297],[590,414],[832,414],[847,297]], '#f6c6be', 3);
      ctx.beginPath();
      ctx.ellipse(707, 414, 117, 37, 0, 0, Math.PI);
      ctx.strokeStyle = '#f6c6be';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const x = 60 + i * 127;
      line([[x - 23, 107], [x + 10, 93], [x + 35, 111]], '#af52604d', 1);
    }
    const vignette = ctx.createRadialGradient(500,260,155,500,260,575);
    vignette.addColorStop(0,'#00000000');
    vignette.addColorStop(1,'#120b13be');
    ctx.fillStyle = vignette;
    ctx.fillRect(0,0,1000,500);
    ctx.fillStyle = '#21131c';
    ctx.fillRect(403, 29, 194, 43);
    ctx.fillStyle = '#fff1ef';
    ctx.font = '700 17px system-ui';
    ctx.fillText(football ? 'BALL360 STADIUM' : 'BALL360 ARENA', 500, 56);
  }

  function drawGoal(time) {
    if (football) {
      line([[748,293],[748,219],[678,219],[678,119]], '#f4a8ae', 7);
      line([[748,219],[818,219],[818,119]], '#f4a8ae', 7);
      line([[748,289],[748,262]], '#e9ecec', 13);
      return;
    }
    line([[834,314],[834,161],[773,161]], '#58667c', 12);
    ctx.fillStyle = '#b2d5ef38';
    ctx.fillRect(728, 151, 74, 61);
    ctx.strokeStyle = '#e0f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(728, 151, 74, 61);
    ctx.strokeRect(731, 180, 37, 27);
    const sway = made && time > .69 ? Math.sin((time - .69) * 36) * (1 - time) * 19 : 0;
    for (let i = 0; i <= 8; i++) {
      line([[708 + 6.75 * i,221],[718 + i * 4.3 + sway,248],[761 - i * 4 + sway,222]], '#e6ebf4a0', 1.4);
    }
    line([[719+sway,247],[753+sway,247]], '#e6ebf4', 2);
    ctx.beginPath();
    ctx.ellipse(735, 220, 28, 6, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ff5a6d';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function drawPlayer(t) {
    const jump = football ? 0 : Math.sin(Math.min(1, t / .43) * Math.PI) * 25;
    const swing = Math.sin(Math.min(1, t / .45) * Math.PI);
    ctx.save();
    ctx.translate(199, 333 - jump);
    oval(8, 47 + jump, 33, 5, '#10131d70');
    line([[0,1],[-14,22],[-16,42]], '#dbe4ed', 13);
    line([[9,0],[19 + 22 * swing,22 - 20 * swing],[22 + 28 * swing,41 - 36 * swing]], '#aabbd4', 13);
    line([[-19,43],[-6,43]], '#1a2030', 7);
    line([[0,-37],[-4,-4],[13,0],[16,-34],[0,-37]], '#d74356', 14);
    line([[7,-31],[24,-43 * (football ? .25 : 1) - 9 * swing],[30,-60 * (football ? .2 : 1) - 10 * swing]], '#d1946e', 8);
    line([[-6,-31],[-19,-20],[-27,-13]], '#b77858', 7);
    oval(6,-53,10,11,football ? '#e6e9ef' : '#b87857');
    if (football) line([[13,-50],[21,-48],[19,-43]], '#cbdaf0', 2);
    else oval(4,-60,9,4,'#212433');
    ctx.fillStyle = '#fff2da';
    ctx.font = 'bold 12px system-ui';
    ctx.fillText('36', 5, -17);
    ctx.restore();
  }

  function ballPosition(t) {
    if (t < .73) {
      const f = t / .73;
      return [
        start[0] + (impact[0] - start[0]) * f,
        start[1] + (impact[1] - start[1]) * f - (football ? 174 : 184) * Math.sin(Math.PI * f)
      ];
    }
    const tail = (t - .73) / .27;
    if (made) return [goal[0] + tail * (football ? 74 : 8), goal[1] + tail * (football ? 21 : 140)];
    return [impact[0] - tail * 130, impact[1] + tail * 155 - 30 * Math.sin(Math.PI * tail)];
  }
  function drawBall(t) {
    for (let i = 12; i >= 1; i--) {
      const previous = ballPosition(Math.max(0,t - i * .008));
      const next = ballPosition(Math.max(0,t - (i - 1) * .008));
      const opacity = Math.round((13 - i) * (made ? 9 : 5)).toString(16).padStart(2,'0');
      line([previous,next], '#ff8b9c' + opacity, 1 + (13 - i) / 2);
    }
    const [x,y] = ballPosition(t);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(t * (football ? 15 : 9));
    const sheen = ctx.createRadialGradient(-3,-4,1,0,0,12);
    sheen.addColorStop(0, football ? '#e8a07e' : '#ffc287');
    sheen.addColorStop(1, football ? '#703b36' : '#993f31');
    oval(0,0,football ? 13 : 11,football ? 7 : 11,sheen);
    line([[-7,0],[7,0]], football ? '#ffead6' : '#633f29', 1.5);
    for (const k of [-3,0,3]) line([[k,-2],[k,2]], football ? '#ffe1bb' : '#78492b', 1);
    ctx.restore();
  }

  const background = document.createElement('canvas');
  background.width = canvas.width;
  background.height = canvas.height;
  const staticContext = background.getContext('2d');
  if (staticContext) {
    const foreground = ctx;
    ctx = staticContext;
    drawVenue();
    ctx = foreground;
  }

  function drawReaction(time) {
    const reaction = Math.max(0, Math.min(1, (time - .73) / .27));
    if (!reaction) return;
    const opacity = Math.max(0, 1 - reaction);
    ctx.save();
    ctx.globalAlpha = opacity;
    for (let i = 0; i < (made ? 24 : 9); i++) {
      const angle = i * 2.4;
      const radius = reaction * (26 + (i * 19 % 78)) * (1 + earned / 160);
      oval(impact[0] + radius * Math.cos(angle), impact[1] + radius * Math.sin(angle), 2, 2, accent);
    }
    ctx.restore();
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let began;
  let displayedScore;
  function frame(now) {
    if (!replay.isConnected) return;
    began ??= now;
    const elapsed = reduced ? 1 : Math.min(1, (now - began) / duration);
    const time = Math.max(0, (elapsed - .13) / .87);
    const reveal = time >= .73;
    const scored = Math.min(1, Math.max(0, (time - .73) / .20));
    const shown = before + Math.round(earned * (1 - (1-scored) ** 3));
    if (shown !== displayedScore) {
      total.textContent = shown + ' / 360';
      displayedScore = shown;
    }
    if (reveal && !call.classList.contains('resolved')) {
      call.textContent += earned ? '  ·  +' + earned + ' PTS' : '  ·  +0 PTS';
      call.classList.add('resolved');
    }

    if (!staticContext) drawVenue();
    ctx.save();
    // Zoom toward the target with an eased zoom that settles after impact.
    const zoom = 1 + .095 * Math.sin(Math.PI * elapsed / 2) ** 2;
    ctx.translate(610,245);
    ctx.scale(zoom,zoom);
    ctx.translate(-610,-245);
    if (staticContext) ctx.drawImage(background,0,0);
    drawGoal(time);
    drawPlayer(elapsed);
    drawReaction(time);
    drawBall(time);
    ctx.restore();
    if (elapsed < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
