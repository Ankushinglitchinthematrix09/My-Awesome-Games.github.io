export function init({ canvas, ctx, width, height }) {
  const state = {
    w: width, h: height,
    ball: { x: width/2, y: height/2, vx: 4, vy: 3, r: 8 },
    paddle: { x: width/2 - 50, y: height - 24, w: 100, h: 12 },
    score: 0,
  };
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    state.paddle.x = Math.max(0, Math.min(state.w - state.paddle.w, e.clientX - rect.left - state.paddle.w/2));
  });
  return state;
}

export function update(s) {
  const b = s.ball, p = s.paddle;
  b.x += b.vx; b.y += b.vy;
  if (b.x < b.r || b.x > s.w - b.r) b.vx *= -1;
  if (b.y < b.r) b.vy *= -1;
  if (b.y + b.r >= p.y && b.x > p.x && b.x < p.x + p.w && b.vy > 0) {
    b.vy *= -1;
    const hit = (b.x - (p.x + p.w/2)) / (p.w/2);
    b.vx = 6 * hit;
    s.score++;
  }
  if (b.y - b.r > s.h) { b.x = s.w/2; b.y = s.h/2; b.vx = 4; b.vy = -3; s.score = 0; }
}

export function draw(s, ctx) {
  ctx.clearRect(0,0,s.w,s.h);
  ctx.fillStyle = '#0b0f1e';
  ctx.fillRect(0,0,s.w,s.h);
  ctx.strokeStyle = '#273059';
  ctx.setLineDash([8,8]);
  ctx.beginPath();
  ctx.moveTo(s.w/2, 0); ctx.lineTo(s.w/2, s.h); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#6ab0ff';
  ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, s.ball.r, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e7e9f6';
  ctx.fillRect(s.paddle.x, s.paddle.y, s.paddle.w, s.paddle.h);
  ctx.fillStyle = '#9aa3c3';
  ctx.font = '16px ui-monospace';
  ctx.fillText(`Score: ${s.score}`, 16, 24);
}

export function destroy() {}