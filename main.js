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

// ── CLOUD: Isometric Cube Network (cloud image style) ─
(function initCloud() {
  const canvas = document.getElementById('cloud-3d');
  if (!canvas) return;

  const DPR = Math.min(devicePixelRatio, 2);
  let W = canvas.offsetWidth  || 560;
  let H = canvas.offsetHeight || 480;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  /* ══ Isometric projection ══ */
  // X right-forward, Y up, Z left-forward  →  screen
  function iso(x, y, z) {
    return {
      sx:  (x - z) * 0.866,
      sy: -(y) + (x + z) * 0.5,
    };
  }

  /* ══ Draw one isometric cube ══
     cx,cy  = screen anchor (bottom-center of cube footprint)
     s      = half-size in pixels
     type   = 'metal'|'glass'|'concrete'
     glow   = bool  */
  function cube(cx, cy, s, type, glow) {
    // 8 corners in iso-grid coords [x,y,z] (y=up)
    const T = s * 0.95; // top face height
    const p = (x,y,z) => { const r=iso(x,y,z); return [cx+r.sx*s, cy+r.sy*s]; };

    // -- color palettes --
    const pal = {
      metal:    { top:'rgba(185,195,210,0.95)', left:'rgba(120,132,148,0.95)', right:'rgba(95,107,122,0.95)',  edge:'rgba(160,180,200,0.7)' },
      glass:    { top:'rgba(130,185,230,0.45)', left:'rgba(80,140,200,0.4)',   right:'rgba(60,115,180,0.4)',   edge:'rgba(100,200,240,0.8)' },
      concrete: { top:'rgba(90,100,115,0.9)',   left:'rgba(58,65,78,0.9)',     right:'rgba(44,50,62,0.9)',     edge:'rgba(80,110,140,0.5)'  },
    };
    const c = pal[type] || pal.metal;
    const lw = 0.8;

    // top face: corners (0,1,0),(1,1,0),(1,1,1),(0,1,1)
    const tl=p(0,1,0), tr=p(1,1,0), br=p(1,1,1), bl=p(0,1,1);
    ctx.beginPath();
    ctx.moveTo(...tl);ctx.lineTo(...tr);ctx.lineTo(...br);ctx.lineTo(...bl);ctx.closePath();
    if(type==='glass'){
      const grd=ctx.createLinearGradient(tl[0],tl[1],br[0],br[1]);
      grd.addColorStop(0,'rgba(160,220,255,0.55)');grd.addColorStop(1,'rgba(80,150,220,0.35)');
      ctx.fillStyle=grd;
    } else { ctx.fillStyle=c.top; }
    ctx.strokeStyle=c.edge; ctx.lineWidth=lw; ctx.fill(); ctx.stroke();

    // left face: (0,0,0),(0,1,0),(0,1,1),(0,0,1)
    const ll0=p(0,0,0),ll1=p(0,1,0),ll2=p(0,1,1),ll3=p(0,0,1);
    ctx.beginPath();
    ctx.moveTo(...ll0);ctx.lineTo(...ll1);ctx.lineTo(...ll2);ctx.lineTo(...ll3);ctx.closePath();
    if(type==='glass'){
      const grd=ctx.createLinearGradient(ll0[0],ll0[1],ll2[0],ll2[1]);
      grd.addColorStop(0,'rgba(70,130,200,0.38)');grd.addColorStop(1,'rgba(40,90,170,0.28)');
      ctx.fillStyle=grd;
    } else { ctx.fillStyle=c.left; }
    ctx.strokeStyle=c.edge; ctx.lineWidth=lw; ctx.fill(); ctx.stroke();

    // right face: (1,0,0),(1,1,0),(1,1,1),(1,0,1)
    const rl0=p(1,0,0),rl1=p(1,1,0),rl2=p(1,1,1),rl3=p(1,0,1);
    ctx.beginPath();
    ctx.moveTo(...rl0);ctx.lineTo(...rl1);ctx.lineTo(...rl2);ctx.lineTo(...rl3);ctx.closePath();
    if(type==='glass'){
      const grd=ctx.createLinearGradient(rl0[0],rl0[1],rl2[0],rl2[1]);
      grd.addColorStop(0,'rgba(60,120,190,0.35)');grd.addColorStop(1,'rgba(35,80,160,0.25)');
      ctx.fillStyle=grd;
    } else { ctx.fillStyle=c.right; }
    ctx.strokeStyle=c.edge; ctx.lineWidth=lw; ctx.fill(); ctx.stroke();

    // inner glow for glass
    if(type==='glass'||glow){
      const center=p(0.5,0.5,0.5);
      const gr=ctx.createRadialGradient(center[0],center[1]-s*0.2,0,center[0],center[1],s*0.9);
      gr.addColorStop(0,'rgba(80,200,255,0.22)');
      gr.addColorStop(1,'rgba(0,100,200,0)');
      ctx.fillStyle=gr;
      ctx.beginPath();
      ctx.moveTo(...tl);ctx.lineTo(...tr);ctx.lineTo(...br);ctx.lineTo(...bl);ctx.closePath();
      ctx.fill();
    }

    // edge highlight line on top
    if(type==='metal'){
      ctx.beginPath();ctx.moveTo(...tl);ctx.lineTo(...tr);
      ctx.strokeStyle='rgba(220,230,245,0.6)';ctx.lineWidth=1.2;ctx.stroke();
    }

    return p(0.5,1,0.5); // top center point for icon placement
  }

  /* ══ Cloud chip icon on top of cube ══ */
  function drawCloudChip(cx,cy,s){
    const f=s*0.55;
    ctx.save();
    ctx.translate(cx,cy-s*0.12);
    // chip body
    const cw=f*0.7, ch=f*0.45;
    const rnd=ctx.createLinearGradient(-cw/2,-ch/2,cw/2,ch/2);
    rnd.addColorStop(0,'rgba(120,160,200,0.9)');rnd.addColorStop(1,'rgba(70,110,160,0.9)');
    ctx.fillStyle=rnd;
    ctx.beginPath();ctx.roundRect(-cw/2,-ch/2,cw,ch,f*0.06);ctx.fill();
    ctx.strokeStyle='rgba(100,180,220,0.8)';ctx.lineWidth=0.8;ctx.stroke();
    // circuit lines
    ctx.strokeStyle='rgba(140,210,240,0.7)';ctx.lineWidth=0.6;
    [-cw*0.25,0,cw*0.25].forEach(x=>{
      ctx.beginPath();ctx.moveTo(x,-ch/2-f*0.08);ctx.lineTo(x,-ch/2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,ch/2);ctx.lineTo(x,ch/2+f*0.08);ctx.stroke();
    });
    // cloud icon
    ctx.fillStyle='rgba(160,220,255,0.9)';
    ctx.beginPath();ctx.arc(0,-f*0.04,f*0.12,Math.PI,0);
    ctx.arc(f*0.1,-f*0.06,f*0.09,Math.PI,0);
    ctx.arc(-f*0.08,-f*0.06,f*0.08,Math.PI,0);
    ctx.closePath();ctx.fill();
    ctx.restore();
  }

  /* ══ Cloud icon ══ */
  function drawCloudIcon(cx,cy,s,alpha){
    const f=s*0.4;
    ctx.save();ctx.globalAlpha=alpha||0.9;ctx.translate(cx,cy-s*0.08);
    ctx.strokeStyle='rgba(100,190,255,0.9)';ctx.lineWidth=f*0.12;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.arc(0,-f*0.05,f*0.32,Math.PI*0.95,Math.PI*0.05);
    ctx.arc(f*0.28,-f*0.12,f*0.2,Math.PI*0.85,-Math.PI*0.1);
    ctx.arc(-f*0.2,-f*0.1,f*0.18,Math.PI*1.1,Math.PI*0.05,true);
    ctx.stroke();
    ctx.restore();
  }

  /* ══ Cable bundle connection ══ */
  function drawCable(x1,y1,x2,y2,t,idx){
    const LINES=4;
    const spread=3.5;
    const dx=x2-x1, dy=y2-y1;
    const len=Math.hypot(dx,dy);
    const nx=-dy/len, ny=dx/len; // normal

    for(let i=0;i<LINES;i++){
      const off=(i-(LINES-1)/2)*spread;
      const ox=nx*off, oy=ny*off;
      // slight curve via quadratic bezier
      const mx=(x1+x2)/2+nx*len*0.06, my=(y1+y2)/2+ny*len*0.06;
      ctx.beginPath();
      ctx.moveTo(x1+ox,y1+oy);
      ctx.quadraticCurveTo(mx+ox,my+oy,x2+ox,y2+oy);
      const bright=i===Math.floor(LINES/2);
      const g=ctx.createLinearGradient(x1,y1,x2,y2);
      g.addColorStop(0,  `rgba(0,200,220,${bright?0.55:0.2})`);
      g.addColorStop(0.5,`rgba(6,182,212,${bright?0.75:0.3})`);
      g.addColorStop(1,  `rgba(0,200,220,${bright?0.55:0.2})`);
      ctx.strokeStyle=g;
      ctx.lineWidth=bright?1.5:0.7;
      ctx.stroke();
    }
    // outer glow
    ctx.beginPath();
    ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2,x2,y2);
    ctx.strokeStyle=`rgba(0,200,220,0.08)`;ctx.lineWidth=14;ctx.stroke();

    // traveling bead
    const prog=((t*0.35+idx*0.19)%1+1)%1;
    const bt=prog, bx=x1+(x2-x1)*bt, by=y1+(y2-y1)*bt;
    ctx.beginPath();ctx.arc(bx,by,3.5,0,Math.PI*2);
    const bg2=ctx.createRadialGradient(bx,by,0,bx,by,7);
    bg2.addColorStop(0,'rgba(200,240,255,0.95)');
    bg2.addColorStop(0.5,'rgba(0,200,220,0.6)');
    bg2.addColorStop(1,'rgba(0,180,200,0)');
    ctx.fillStyle=bg2;ctx.fill();
  }

  /* ══ Node dot ══ */
  function nodeDot(x,y,r){
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
    const g=ctx.createRadialGradient(x,y,0,x,y,r*2.5);
    g.addColorStop(0,'rgba(180,230,255,0.95)');
    g.addColorStop(0.6,'rgba(0,200,220,0.55)');
    g.addColorStop(1,'rgba(0,180,200,0)');
    ctx.fillStyle=g;ctx.fill();
  }

  /* ══ Layout ══
     9 cubes: 1 center + 8 around in ring (like image)
     Screen coords relative to canvas center              */
  const R = 148; // ring radius
  const RING_CUBES = [
    // 8 positions around ring, top = index 0, clockwise
    // angle offsets for isometric look (top-center first)
    { a: -90, type:'concrete', icon:''       },  // top
    { a: -35, type:'glass',    icon:'cloud'  },  // top-right
    { a:  35, type:'concrete', icon:''       },  // right
    { a:  90, type:'glass',    icon:'circuit'},  // bottom-right
    { a: 140, type:'concrete', icon:''       },  // bottom
    { a:-140, type:'glass',    icon:'glow'   },  // bottom-left
    { a:-100, type:'concrete', icon:''       },  // left (slightly up)
    { a: -55, type:'glass',    icon:'cloud'  },  // top-left-ish → adjust
  ];
  // Re-map to clean 8-way ring
  const ANGLES = [-90, -45, 0, 45, 90, 135, 180, -135];
  const TYPES  = ['concrete','glass','concrete','glass','concrete','glass','concrete','glass'];
  const ICONS  = ['',        'cloud','',        'circuit','',      'glow', '',        'cloud'];

  let animT = 0;

  function render() {
    ctx.clearRect(0, 0, W, H);

    const cx = W * 0.5;
    const cy = H * 0.52;

    // subtle background radial
    const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,W*0.55);
    bg.addColorStop(0,'rgba(10,25,60,0.12)');
    bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // compute ring cube positions (with float)
    const ringPos = ANGLES.map((a,i)=>{
      const rad = a * Math.PI/180;
      const float = Math.sin(animT*0.65+i*0.8)*5;
      return {
        x: cx + Math.cos(rad)*R,
        y: cy + Math.sin(rad)*R*0.55 + float,  // *0.55 = isometric squash
        type: TYPES[i],
        icon: ICONS[i],
        fo: i,
      };
    });
    const centerFloat = Math.sin(animT*0.5)*4;
    const centerPos = { x:cx, y:cy+centerFloat };

    // Draw connections first (behind cubes)
    ringPos.forEach((rp,i)=>{
      drawCable(centerPos.x, centerPos.y, rp.x, rp.y, animT, i);
    });

    // Node dots on connection endpoints
    ringPos.forEach(rp => nodeDot(rp.x, rp.y-2, 4));
    nodeDot(centerPos.x, centerPos.y-4, 5.5);

    // Draw ring cubes (sorted by y for depth)
    const sorted = [...ringPos].sort((a,b)=>a.y-b.y);
    sorted.forEach(rp=>{
      const s = W < 400 ? 28 : 32;
      cube(rp.x, rp.y, s, rp.type, rp.type==='glass');
      if(rp.icon==='cloud')   drawCloudIcon(rp.x, rp.y-s*0.55, s, 0.85);
      if(rp.icon==='glow'){
        // bright glow glass
        const g=ctx.createRadialGradient(rp.x,rp.y-s*0.3,0,rp.x,rp.y-s*0.3,s*0.7);
        g.addColorStop(0,'rgba(100,210,255,0.35)');g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(rp.x,rp.y-s*0.3,s*0.7,0,Math.PI*2);ctx.fill();
      }
    });

    // Draw center cube (larger, on top of connections)
    const CS = W < 400 ? 40 : 46;
    cube(centerPos.x, centerPos.y, CS, 'metal', false);
    drawCloudChip(centerPos.x, centerPos.y - CS * 0.6, CS);

    animT += 0.013;
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener('resize', () => {
    W = canvas.offsetWidth || 560;
    H = canvas.offsetHeight || 480;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);
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
