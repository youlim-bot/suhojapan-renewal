/* ===== SUHO JAPAN — Interactive 3D Website ===== */

// Dark mode only
document.documentElement.setAttribute('data-theme', 'dark');

// ── Loader ──────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    initAnimations();
  }, 2000);
});

// ── Custom Cursor ────────────────────────────────────
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursor-trail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

function animateCursor() {
  tx += (mx - tx) * 0.12;
  ty += (my - ty) * 0.12;
  trail.style.left = tx + 'px';
  trail.style.top  = ty + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ── Navbar scroll ────────────────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNav();
});

function updateActiveNav() {
  const sections = ['hero','ai-service','cloud','managed','products','about'];
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.scrollY >= el.offsetTop - 200) current = id;
  });
  navLinks.forEach(a => {
    const href = a.getAttribute('href').replace('#','');
    a.classList.toggle('active', href === current);
  });
}

// ── Hamburger ────────────────────────────────────────
const ham   = document.getElementById('hamburger');
const mMenu = document.getElementById('mobileMenu');
ham.addEventListener('click', () => {
  ham.classList.toggle('open');
  mMenu.classList.toggle('open');
});
mMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    ham.classList.remove('open');
    mMenu.classList.remove('open');
  });
});

// ── Smooth Scroll ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Scroll Reveal ────────────────────────────────────
function initAnimations() {
  const revealEls = document.querySelectorAll(
    '.card-3d, .mf-card, .product-card, .feature-item, .value-item, .about-stat, .partner-item, .section-header, .split-content'
  );
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-delay-1');
    if (i % 3 === 2) el.classList.add('reveal-delay-2');
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  revealEls.forEach(el => observer.observe(el));
}

// ── Counter animation ────────────────────────────────
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.target);
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = ease * target;
      el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── 3D Card Tilt ─────────────────────────────────────
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
  });
});

// ── Tabs ─────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');
  });
});

// ── Contact form ──────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.innerHTML = '<span>送信完了 ✓</span>';
  btn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<span>送信する</span><svg viewBox="0 0 20 20" fill="none"><path d="M3 10h14M10 4l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
});

/* ─────────────────────────────────────────────────────
   THREE.JS SCENES
───────────────────────────────────────────────────── */

// ── HERO: Particle Universe ──────────────────────────
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // Particles
  const COUNT = 3000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const palette = [
    new THREE.Color('#6366f1'),
    new THREE.Color('#06b6d4'),
    new THREE.Color('#a855f7'),
    new THREE.Color('#ffffff'),
  ];
  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random()-0.5) * 20;
    pos[i*3+1] = (Math.random()-0.5) * 20;
    pos[i*3+2] = (Math.random()-0.5) * 20;
    const c = palette[Math.floor(Math.random() * palette.length)];
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.8 });
  scene.add(new THREE.Points(geo, mat));

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.03;
    scene.rotation.y = t * 0.02;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.parentElement.offsetWidth;
    const h = canvas.parentElement.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

// ── AI SERVICE: Neural Network ───────────────────────
(function initAI() {
  const canvas = document.getElementById('ai-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const w = canvas.parentElement.offsetWidth;
  const h = canvas.parentElement.offsetHeight || 600;
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Neural network nodes
  const layers = [3, 5, 5, 3];
  const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const nodes = [];
  const nodePositions = [];

  layers.forEach((count, li) => {
    const lNodes = [];
    for (let ni = 0; ni < count; ni++) {
      const mat = new THREE.MeshBasicMaterial({ color: li === 0 ? 0x06b6d4 : li === layers.length-1 ? 0xa855f7 : 0x6366f1 });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      const x = (li - (layers.length-1)/2) * 1.8;
      const y = (ni - (count-1)/2) * 0.9;
      mesh.position.set(x, y, 0);
      scene.add(mesh);
      lNodes.push(mesh);
    }
    nodes.push(lNodes);
    nodePositions.push(lNodes.map(n => n.position.clone()));
  });

  // Connections
  const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.2 });
  for (let li = 0; li < nodes.length - 1; li++) {
    nodes[li].forEach(a => {
      nodes[li+1].forEach(b => {
        const geo = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
        scene.add(new THREE.Line(geo, lineMat.clone()));
      });
    });
  }

  // Floating particles along lines
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    pPos[i*3]   = (Math.random()-0.5)*8;
    pPos[i*3+1] = (Math.random()-0.5)*6;
    pPos[i*3+2] = (Math.random()-0.5)*2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.04, color: 0x06b6d4, transparent: true, opacity: 0.6 })));

  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    nodes.forEach((layer, li) => {
      layer.forEach((n, ni) => {
        n.material.opacity = 0.5 + 0.5 * Math.sin(t * 2 + li * 1.5 + ni);
        n.scale.setScalar(0.8 + 0.4 * Math.abs(Math.sin(t + li + ni)));
      });
    });
    scene.rotation.y = Math.sin(t * 0.3) * 0.2;
    renderer.render(scene, camera);
  }
  animate();
})();

// ── CLOUD: Isometric Cube Network ────────────────────
(function initCloud() {
  const canvas = document.getElementById('cloud-3d');
  if (!canvas) return;

  const DPR = Math.min(devicePixelRatio, 2);
  let W = canvas.offsetWidth  || 600;
  let H = canvas.offsetHeight || 520;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  /* ══ Proper isometric cube ══
     Anchor (cx,cy) = visual center of cube
     s = half-width of the horizontal diamond on top        */
  function isoCube(cx, cy, s, type) {
    const H2 = s * 0.5;   // height of each side face = s*0.5 (half the diamond)
    // 7 key screen points
    const t  = [cx,       cy - s];          // top peak
    const ml = [cx - s,   cy - H2];         // mid-left
    const mr = [cx + s,   cy - H2];         // mid-right
    const fc = [cx,       cy];              // front-center (equator)
    const bl = [cx - s,   cy + H2];         // bottom-left
    const br = [cx + s,   cy + H2];         // bottom-right
    const b  = [cx,       cy + s];          // bottom peak

    const fill  = { r:0, g:0, b:0 };
    let topA, leftA, rightA, edgeCol;

    if (type === 'metal') {
      topA   = 'rgba(175,188,205,0.96)';
      leftA  = 'rgba(100,115,132,0.96)';
      rightA = 'rgba(78,92,108,0.96)';
      edgeCol= 'rgba(150,175,200,0.75)';
    } else if (type === 'glass') {
      topA   = 'rgba(110,175,225,0.38)';
      leftA  = 'rgba(65,125,195,0.32)';
      rightA = 'rgba(50,105,178,0.30)';
      edgeCol= 'rgba(80,190,235,0.85)';
    } else { // concrete
      topA   = 'rgba(82,93,108,0.95)';
      leftA  = 'rgba(52,60,73,0.95)';
      rightA = 'rgba(40,48,60,0.95)';
      edgeCol= 'rgba(70,100,130,0.55)';
    }

    ctx.lineWidth = 0.9;
    ctx.strokeStyle = edgeCol;

    // ── Top face (diamond) ──
    if (type === 'glass') {
      const gTop = ctx.createLinearGradient(t[0], t[1], b[0], b[1]);
      gTop.addColorStop(0, 'rgba(140,210,255,0.5)');
      gTop.addColorStop(1, 'rgba(70,140,220,0.30)');
      ctx.fillStyle = gTop;
    } else if (type === 'metal') {
      const gTop = ctx.createLinearGradient(ml[0], ml[1], mr[0], mr[1]);
      gTop.addColorStop(0, 'rgba(155,170,190,0.97)');
      gTop.addColorStop(0.5,'rgba(200,212,225,0.97)');
      gTop.addColorStop(1, 'rgba(155,170,190,0.97)');
      ctx.fillStyle = gTop;
    } else {
      ctx.fillStyle = topA;
    }
    ctx.beginPath();
    ctx.moveTo(...t); ctx.lineTo(...mr); ctx.lineTo(...fc); ctx.lineTo(...ml);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // ── Left face ──
    if (type === 'glass') {
      const gL = ctx.createLinearGradient(ml[0], ml[1], bl[0], bl[1]);
      gL.addColorStop(0, 'rgba(65,130,200,0.35)'); gL.addColorStop(1, 'rgba(40,95,170,0.25)');
      ctx.fillStyle = gL;
    } else { ctx.fillStyle = leftA; }
    ctx.beginPath();
    ctx.moveTo(...ml); ctx.lineTo(...fc); ctx.lineTo(...b); ctx.lineTo(...bl);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // ── Right face ──
    if (type === 'glass') {
      const gR = ctx.createLinearGradient(mr[0], mr[1], br[0], br[1]);
      gR.addColorStop(0, 'rgba(55,115,185,0.32)'); gR.addColorStop(1, 'rgba(35,85,160,0.22)');
      ctx.fillStyle = gR;
    } else { ctx.fillStyle = rightA; }
    ctx.beginPath();
    ctx.moveTo(...mr); ctx.lineTo(...br); ctx.lineTo(...b); ctx.lineTo(...fc);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // ── Metal top highlight ──
    if (type === 'metal') {
      ctx.beginPath(); ctx.moveTo(...t); ctx.lineTo(...mr);
      ctx.strokeStyle = 'rgba(230,240,252,0.65)'; ctx.lineWidth = 1.3; ctx.stroke();
    }
    // ── Glass inner glow ──
    if (type === 'glass') {
      const gr = ctx.createRadialGradient(cx, cy - s * 0.3, 0, cx, cy - s * 0.3, s * 1.1);
      gr.addColorStop(0, 'rgba(60,190,255,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(...t); ctx.lineTo(...mr); ctx.lineTo(...fc); ctx.lineTo(...ml);
      ctx.closePath(); ctx.fill();
    }
  }

  /* ══ Cloud icon (stroke) ══ */
  function cloudIcon(cx, cy, r, alpha) {
    ctx.save(); ctx.globalAlpha = alpha || 0.85;
    ctx.strokeStyle = 'rgba(90,185,255,0.95)';
    ctx.lineWidth = r * 0.13; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx,      cy - r * 0.05, r * 0.30, Math.PI, 0);
    ctx.arc(cx + r * 0.24, cy - r * 0.14, r * 0.18, Math.PI, -0.1);
    ctx.arc(cx - r * 0.18, cy - r * 0.12, r * 0.16, Math.PI, 0.1, true);
    ctx.stroke(); ctx.restore();
  }

  /* ══ Cloud-chip icon (center cube) ══ */
  function chipIcon(cx, cy, s) {
    const f = s * 0.72;
    ctx.save(); ctx.translate(cx, cy - s * 0.08);
    const cw = f * 0.65, ch = f * 0.4;
    const gC = ctx.createLinearGradient(-cw/2,-ch/2,cw/2,ch/2);
    gC.addColorStop(0,'rgba(110,155,200,0.95)'); gC.addColorStop(1,'rgba(65,105,160,0.95)');
    ctx.fillStyle = gC;
    ctx.beginPath(); ctx.roundRect(-cw/2,-ch/2,cw,ch,4); ctx.fill();
    ctx.strokeStyle='rgba(90,175,220,0.8)'; ctx.lineWidth=0.8; ctx.stroke();
    // pins
    ctx.strokeStyle='rgba(120,205,240,0.75)'; ctx.lineWidth=0.7;
    [-cw*0.25,0,cw*0.25].forEach(x=>{
      ctx.beginPath();ctx.moveTo(x,-ch/2-5);ctx.lineTo(x,-ch/2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x, ch/2); ctx.lineTo(x, ch/2+5);ctx.stroke();
    });
    // cloud on chip
    ctx.fillStyle='rgba(155,220,255,0.95)';
    ctx.beginPath();
    ctx.arc(0,-3,f*0.10,Math.PI,0);
    ctx.arc(f*0.09,-5,f*0.07,Math.PI,0);
    ctx.arc(-f*0.07,-5,f*0.065,Math.PI,0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ══ Cable bundle ══ */
  function cable(x1,y1,x2,y2,t,idx){
    const N=4, sp=3.2;
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
    const nx=-dy/len,ny=dx/len;
    const mx=(x1+x2)/2,my=(y1+y2)/2;
    const cpx=mx+nx*len*0.05,cpy=my+ny*len*0.05;

    // outer glow
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cpx,cpy,x2,y2);
    ctx.strokeStyle='rgba(0,195,218,0.07)';ctx.lineWidth=16;ctx.stroke();

    for(let i=0;i<N;i++){
      const off=(i-(N-1)/2)*sp;
      const ox=nx*off,oy=ny*off;
      ctx.beginPath();
      ctx.moveTo(x1+ox,y1+oy);
      ctx.quadraticCurveTo(cpx+ox,cpy+oy,x2+ox,y2+oy);
      const center=(i===1||i===2);
      const g=ctx.createLinearGradient(x1,y1,x2,y2);
      const a=center?0.7:0.22;
      g.addColorStop(0,`rgba(0,195,218,${a*0.7})`);
      g.addColorStop(0.5,`rgba(6,182,212,${a})`);
      g.addColorStop(1,`rgba(0,195,218,${a*0.7})`);
      ctx.strokeStyle=g; ctx.lineWidth=center?1.4:0.6; ctx.stroke();
    }
    // bead
    const prog=((t*0.38+idx*0.23)%1+1)%1;
    const bx=x1+(x2-x1)*prog, by=y1+(y2-y1)*prog;
    const bg=ctx.createRadialGradient(bx,by,0,bx,by,7);
    bg.addColorStop(0,'rgba(200,242,255,0.98)');
    bg.addColorStop(0.45,'rgba(0,200,222,0.65)');
    bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(bx,by,4,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();
  }

  /* ══ Node dot ══ */
  function dot(x,y,r){
    const g=ctx.createRadialGradient(x,y,0,x,y,r*2.8);
    g.addColorStop(0,'rgba(190,238,255,0.98)');
    g.addColorStop(0.5,'rgba(0,195,218,0.55)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
  }

  /* ══ Scene layout ══ */
  const ANGLES = [-90,-45,0,45,90,135,180,-135];
  const TYPES  = ['concrete','glass','concrete','glass','concrete','glass','concrete','glass'];
  const ICONS  = [false,true,false,true,false,true,false,false];

  let T = 0;

  function render(){
    ctx.clearRect(0,0,W,H);

    const cx=W*0.5, cy=H*0.52;
    const R  = Math.min(W,H) * 0.33;   // ring radius — responsive
    const RS = Math.min(W,H) * 0.088;  // ring cube half-size
    const CS = Math.min(W,H) * 0.115;  // center cube half-size

    // ring positions
    const ring = ANGLES.map((a,i)=>{
      const rad=a*Math.PI/180;
      const fl=Math.sin(T*0.65+i*0.8)*6;
      return {
        x: cx+Math.cos(rad)*R,
        y: cy+Math.sin(rad)*R*0.52+fl,
        type:TYPES[i], icon:ICONS[i]
      };
    });
    const cfl=Math.sin(T*0.5)*5;
    const cpx=cx, cpy=cy+cfl;

    // 1. cables (behind everything)
    ring.forEach((r,i)=>cable(cpx,cpy,r.x,r.y,T,i));

    // 2. endpoint dots
    ring.forEach(r=>dot(r.x,r.y,4.5));
    dot(cpx,cpy,6);

    // 3. ring cubes — back-to-front (sort by y)
    [...ring].sort((a,b)=>a.y-b.y).forEach(r=>{
      isoCube(r.x, r.y, RS, r.type);
      if(r.icon) cloudIcon(r.x, r.y-RS*0.55, RS*0.55);
    });

    // 4. center cube on top
    isoCube(cpx, cpy, CS, 'metal');
    chipIcon(cpx, cpy, CS);

    T+=0.013;
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener('resize',()=>{
    W=canvas.offsetWidth||600; H=canvas.offsetHeight||520;
    canvas.width=W*DPR; canvas.height=H*DPR; ctx.scale(DPR,DPR);
  });
})();

// ── PRODUCTS: Orbit Scene ────────────────────────────
(function initProducts() {
  const canvas = document.getElementById('products-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const w = canvas.parentElement.offsetWidth;
  const h = canvas.parentElement.offsetHeight || 600;
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Orbiting particles
  const COUNT = 1500;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const radii = new Float32Array(COUNT);
  const offsets = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    radii[i] = 1 + Math.random() * 4;
    offsets[i] = Math.random() * Math.PI * 2;
    speeds[i] = (0.2 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
    pos[i*3+2] = (Math.random() - 0.5) * 3;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.03, color: 0x6366f1, transparent: true, opacity: 0.7 });
  const points = new THREE.Points(geo, pMat);
  scene.add(points);

  // Central torus
  const tGeo = new THREE.TorusKnotGeometry(1, 0.3, 128, 16);
  const tMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.15 });
  const torus = new THREE.Mesh(tGeo, tMat);
  scene.add(torus);

  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    const posArr = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const angle = offsets[i] + t * speeds[i] * 0.1;
      posArr[i*3]   = Math.cos(angle) * radii[i];
      posArr[i*3+1] = Math.sin(angle) * radii[i];
    }
    geo.attributes.position.needsUpdate = true;
    torus.rotation.x = t * 0.3;
    torus.rotation.y = t * 0.4;
    renderer.render(scene, camera);
  }
  animate();
})();

// ── ABOUT: Globe ─────────────────────────────────────
(function initAbout() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const w = canvas.parentElement.offsetWidth;
  const h = canvas.parentElement.offsetHeight || 600;
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Globe wireframe
  const globeGeo = new THREE.SphereGeometry(2, 32, 32);
  const globeMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.07 });
  scene.add(new THREE.Mesh(globeGeo, globeMat));

  // Lat/lon dots
  const dotGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
  const cities = [
    [35.6, 139.7],  // Tokyo
    [34.7, 135.5],  // Osaka
    [37.6, 127.0],  // Seoul
    [31.2, 121.5],  // Shanghai
    [22.3, 114.2],  // Hong Kong
    [1.3, 103.8],   // Singapore
    [51.5, -0.1],   // London
    [48.9, 2.3],    // Paris
    [40.7, -74.0],  // New York
    [37.8, -122.4], // SF
  ];
  cities.forEach(([lat, lon]) => {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const dot = new THREE.Mesh(dotGeo, dotMat.clone());
    dot.position.set(
      -2 * Math.sin(phi) * Math.cos(theta),
       2 * Math.cos(phi),
       2 * Math.sin(phi) * Math.sin(theta)
    );
    dot.material.color.set(Math.random() > 0.5 ? 0x06b6d4 : 0xa855f7);
    scene.add(dot);
  });

  // Atmospheric glow ring
  const atmGeo = new THREE.SphereGeometry(2.1, 32, 32);
  const atmMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.04, side: THREE.BackSide });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  const globe = scene.children[0];
  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.003;
    renderer.render(scene, camera);
  }
  animate();
})();

// ── CONTACT: Starfield ────────────────────────────────
(function initContact() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const w = canvas.parentElement.offsetWidth;
  const h = canvas.parentElement.offsetHeight || 500;
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.z = 3;

  const COUNT = 1000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random()-0.5)*20;
    pos[i*3+1] = (Math.random()-0.5)*20;
    pos[i*3+2] = (Math.random()-0.5)*10;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.04, color: 0x6366f1, transparent: true, opacity: 0.6 })));

  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.001;
    renderer.render(scene, camera);
  }
  animate();
})();
