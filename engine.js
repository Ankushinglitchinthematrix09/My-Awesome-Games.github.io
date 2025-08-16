// engine.js
const listEl = document.getElementById('game-list');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const stage = document.getElementById('stage');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const titleEl = document.getElementById('game-title');
const instructionsEl = document.getElementById('instructions');

let manifest = []; // loaded from games/manifest.json
let active = null; // { module, state, frameReq }

async function loadManifest() {
  const bust = `?_=${Date.now()}`; // let refresh button bypass cache
  const res = await fetch(`./games/manifest.json${bust}`);
  manifest = await res.json();
  renderList();
}

function renderList() {
  const q = (searchEl.value || '').toLowerCase();
  const sorted = [...manifest].sort((a,b)=> {
    if (sortEl.value === 'date') return new Date(b.added) - new Date(a.added);
    return a.name.localeCompare(b.name);
  }).filter(g => g.name.toLowerCase().includes(q));

  listEl.innerHTML = '';
  for (const g of sorted) {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${g.cover || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTInIGhlaWdodD0nNTInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzUyJyBoZWlnaHQ9JzUyJyByeD0nMTAnIGZpbGw9JyMxNjFhMmYnLz48dGV4dCB4PSc2JyB5PSczMCcgZmlsbD0nIzk5YScgZm9udC1zaXplPScxMCc+Tm8gQ292ZXI8L3RleHQ+PC9zdmc+'}" alt="cover" />
      <div class="meta">
        <strong>${g.name}</strong>
        <small>${g.author || 'Unknown'} • ${new Date(g.added).toLocaleDateString()}</small>
      </div>`;
    li.addEventListener('click', ()=> startGame(g));
    listEl.appendChild(li);
  }
}

async function startGame(gameMeta) {
  stopGame();
  titleEl.textContent = gameMeta.name;
  instructionsEl.textContent = gameMeta.instructions || 'Use keyboard/mouse. Press Esc to exit game.';

  // dynamic import of the game module
  const mod = await import(`./${gameMeta.path}`);
  const state = mod.init({ canvas, ctx, width: canvas.width, height: canvas.height });

  function frame(t) {
    mod.update(state, t);
    mod.draw(state, ctx);
    active.frameReq = requestAnimationFrame(frame);
  }
  active = { module: mod, state, frameReq: requestAnimationFrame(frame) };
}

function stopGame() {
  if (!active) return;
  cancelAnimationFrame(active.frameReq);
  if (active.module && typeof active.module.destroy === 'function') {
    try { active.module.destroy(active.state); } catch {}
  }
  active = null;
  ctx.clearRect(0,0,canvas.width, canvas.height);
}

// UI controls
searchEl.addEventListener('input', renderList);
sortEl.addEventListener('change', renderList);
document.getElementById('refresh').addEventListener('click', loadManifest);

document.getElementById('fullscreen').addEventListener('click', ()=>{
  if (canvas.requestFullscreen) canvas.requestFullscreen();
});

window.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') stopGame();
});

// boot
loadManifest();
