'use strict';

function showArenaReplay(card, sport, result) {
  const replay = document.createElement('div');
  replay.className = 'arena-replay';
  replay.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 500;
  const call = document.createElement('p');
  call.className = 'arena-call';
  call.textContent = result.correct ? (sport === 'NFL' ? 'IT’S GOOD!' : 'SWISH!') : 'NO GOOD';
  replay.append(canvas, call);
  card.prepend(replay);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const football = sport === 'NFL';
  const made = result.correct;
  const goal = football ? [748, 178] : [735, 221];
  const start = football ? [255, 359] : [230, 276];
  const impact = made ? goal : [goal[0] - (football ? 124 : 25), goal[1] + (football ? 39 : -7)];
  const duration = 1560;
  const crowd = Array.from({length: 430}, (_, i) => {
    const row = Math.floor(i / 86);
    return [i % 86 * 12 + (i * 37 % 7), 104 + row * 28 + (i * 47 % 13), i * 29 % 7];
  });
  const colors = ['#bd594c','#e9aa73','#9ea8bb','#49718a','#63718b','#d3d6cd','#6d4d69'];

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
    surface(['#131923','#30364c'], 0, 500);
    for (const x of [92, 295, 710, 907]) {
      const light = ctx.createRadialGradient(x, 49, 3, x, 49, 175);
      light.addColorStop(0, '#fff1caa0');
      light.addColorStop(1, '#ffebc900');
      ctx.fillStyle = light;
      ctx.fillRect(x - 175, 0, 350, 224);
      for (let i = -1; i <= 1; i++) oval(x + i * 13, 47, 4.5, 3, '#fff4d8');
    }
    for (let row = 0; row < 5; row++) {
      const y = 99 + row * 28;
      ctx.fillStyle = row % 2 ? '#242b3e' : '#151d2e';
      ctx.fillRect(0, y, 1000, 27);
      line([[0,y + 25],[1000,y + 25]], '#8991a440', 2);
    }
    for (const [x,y,color] of crowd) {
      line([[x,y + 10],[x,y + 5]], colors[color], 5);
      oval(x,y,2.6,3,'#c6a98d');
    }
    ctx.fillStyle = '#0c141f';
    ctx.fillRect(0, 246, 1000, 33);
    ctx.fillStyle = '#d3d9e3';
    ctx.font = '700 14px system-ui';
    ctx.textAlign = 'center';
    for (const x of [125,375,625,875]) ctx.fillText('BALL360', x, 268);

    surface(football ? ['#285044','#16312c'] : ['#9c603b','#d79a63'], 279, 500);
    for (let i = 0; i <= 10; i++) {
      const margin = i * 92;
      line([[margin,280],[margin * 1.48 - 215,500]], football ? '#e5f2db80' : '#73412e66', football ? 2 : 1);
    }
    for (const y of [291,329,378,447]) {
      line([[0,y],[1000,y]], football ? '#d8f3db65' : '#f9d8aa73', football ? 2 : 1);
    }
    if (!football) {
      line([[663,297],[590,414],[832,414],[847,297]], '#ffe9cc', 3);
      ctx.beginPath();
      ctx.ellipse(707, 414, 117, 37, 0, 0, Math.PI);
      ctx.strokeStyle = '#ffe9cc';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = '#111726';
    ctx.fillRect(403, 29, 194, 43);
    ctx.fillStyle = '#fff2d2';
    ctx.font = '700 17px system-ui';
    ctx.fillText(football ? 'SUNDAY KICKOFF' : 'BALL360 ARENA', 500, 56);
  }

  function drawGoal(time) {
    if (football) {
      line([[748,293],[748,219],[678,219],[678,119]], '#eec451', 7);
      line([[748,219],[818,219],[818,119]], '#eec451', 7);
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
    ctx.strokeStyle = '#ff6848';
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
    line([[0,-37],[-4,-4],[13,0],[16,-34],[0,-37]], '#bf4f43', 14);
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
    for (let i = 4; i >= 1; i--) {
      const [x,y] = ballPosition(Math.max(0, t - i * .016));
      oval(x, y, 9 - i, 8 - i, '#ffc77e18');
    }
    const [x,y] = ballPosition(t);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(t * (football ? 15 : 9));
    oval(0,0,football ? 13 : 11,football ? 7 : 11,football ? '#c28450' : '#eb943f');
    line([[-7,0],[7,0]], football ? '#ffead6' : '#633f29', 1.5);
    for (const k of [-3,0,3]) line([[k,-2],[k,2]], football ? '#ffe1bb' : '#78492b', 1);
    ctx.restore();
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let began;
  function frame(now) {
    if (!replay.isConnected) return;
    began ??= now;
    const elapsed = Math.min(1, (now - began) / duration);
    const time = reduced ? 1 : Math.max(0, (elapsed - .12) / .88);
    drawVenue();
    drawGoal(time);
    drawPlayer(reduced ? 1 : elapsed);
    drawBall(time);
    if (!reduced && elapsed < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
