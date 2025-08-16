// games/fallblocks.js (mini Tetris-like)
const W = 10, H = 20, TILE = 24;
const SHAPES = [
  [[1,1,1,1]], // I
  [[1,1,0],[0,1,1]], // Z
  [[0,1,1],[1,1,0]], // S
  [[1,1],[1,1]], // O
  [[1,0,0],[1,1,1]], // J
  [[0,0,1],[1,1,1]], // L
  [[0,1,0],[1,1,1]], // T
];
function rnd(n){ return Math.floor(Math.random()*n); }

export function init({ canvas, ctx, width, height }) {
  const s = {
    ctx, offx: Math.floor((width - W*TILE)/2), offy: Math.floor((height - H*TILE)/2),
    grid: Array.from({length:H},()=>Array(W).fill(0)),
    cur: newPiece(),
    t: 0, speed: 500, over: false, score: 0
  };
  window.addEventListener('keydown', e=>handleKey(e,s));
  return s;
}

function newPiece(){
  const shape = SHAPES[rnd(SHAPES.length)];
  return { shape, x: 3, y: 0 };
}

function collide(s, nx, ny, shape){
  for (let y=0; y<shape.length; y++)
    for (let x=0; x<shape[y].length; x++)
      if (shape[y][x]) {
        const gx = nx + x, gy = ny + y;
        if (gx<0||gx>=W||gy>=H|| (gy>=0 && s.grid[gy][gx])) return true;
      }
  return false;
}

function rotate(shape){
  const h=shape.length,w=shape[0].length;
  const r=Array.from({length:w},()=>Array(h).fill(0));
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) r[x][h-1-y]=shape[y][x];
  return r;
}

export function update(s, t){
  if (s.over) return;
  if (!s._lt) s._lt = t;
  if (t - s._lt > s.speed) {
    s._lt = t;
    const ny = s.cur.y + 1;
    if (!collide(s, s.cur.x, ny, s.cur.shape)) s.cur.y = ny; else {
      // lock piece
      const {
