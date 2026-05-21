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

  const W = canvas.offsetWidth  || 600;
  const H = canvas.offsetHeight || 500;
  canvas.width  = W * Math.min(devicePixelRatio, 2);
  canvas.height = H * Math.min(devicePixelRatio, 2);
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(devicePixelRatio, 2);
  ctx.scale(DPR, DPR);

  /* ── Isometric helpers ── */
  const ISO_X =  0.866;  // cos30
  const ISO_Y =  0.5;    // sin30

  function isoProject(x, y, z) {
    return {
      sx: (x - z) * ISO_X,
      sy: (x + z) * ISO_Y - y,
    };
  }

  /* ── Cube drawing ── */
  function drawCube(cx, cy, gx, gy, gz, size, colors, alpha = 1) {
    const s = size;
    const pts = (dx,dy,dz) => {
      const p = isoProject(gx+dx, gy+dy, gz+dz);
      return [cx + p.sx * s, cy + p.sy * s];
    };

    // Top face
    ctx.beginPath();
    ctx.moveTo(...pts(0,1,0)); ctx.lineTo(...pts(1,1,0));
    ctx.lineTo(...pts(1,1,1)); ctx.lineTo(...pts(0,1,1));
    ctx.closePath();
    ctx.fillStyle   = `rgba(${colors.top},${alpha})`;
    ctx.strokeStyle = `rgba(${colors.edge},${alpha * 0.8})`;
    ctx.lineWidth = 0.7;
    ctx.fill(); ctx.stroke();

    // Left face
    ctx.beginPath();
    ctx.moveTo(...pts(0,0,0)); ctx.lineTo(...pts(0,1,0));
    ctx.lineTo(...pts(0,1,1)); ctx.lineTo(...pts(0,0,1));
    ctx.closePath();
    ctx.fillStyle = `rgba(${colors.left},${alpha})`;
    ctx.fill(); ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(...pts(1,0,0)); ctx.lineTo(...pts(1,1,0));
    ctx.lineTo(...pts(1,1,1)); ctx.lineTo(...pts(1,0,1));
    ctx.closePath();
    ctx.fillStyle = `rgba(${colors.right},${alpha})`;
    ctx.fill(); ctx.stroke();
  }

  /* ── Logo text on cube top ── */
  function drawLabel(cx, cy, gx, gy, gz, size, text, color) {
    const s  = size;
    const pt = isoProject(gx + 0.5, gy + 1.02, gz + 0.5);
    const tx = cx + pt.sx * s;
    const ty = cy + pt.sy * s;
    ctx.save();
    ctx.font = `bold ${size * 0.28}px "Inter", sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Isometric skew
    ctx.transform(ISO_X, -ISO_Y, ISO_X, ISO_Y, tx - ISO_X * 0 * s, ty);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  /* ── Glowing connection line ── */
  function drawConnection(x1, y1, x2, y2, progress, alpha) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const nx  = (x2 - x1) / len;
    const ny  = (y2 - y1) / len;

    // Base line
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0,   `rgba(6,182,212,${alpha * 0.15})`);
    g.addColorStop(0.5, `rgba(99,102,241,${alpha * 0.4})`);
    g.addColorStop(1,   `rgba(6,182,212,${alpha * 0.15})`);
    ctx.strokeStyle = g;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Glow line
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(6,182,212,${alpha * 0.1})`;
    ctx.lineWidth   = 4;
    ctx.stroke();

    // Traveling particle
    const px = x1 + nx * len * progress;
    const py = y1 + ny * len * progress;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    const pg = ctx.createRadialGradient(px, py, 0, px, py, 6);
    pg.addColorStop(0,   `rgba(160,200,255,${alpha})`);
    pg.addColorStop(0.5, `rgba(6,182,212,${alpha * 0.8})`);
    pg.addColorStop(1,   'rgba(6,182,212,0)');
    ctx.fillStyle = pg;
    ctx.fill();

    // Node dots at each end
    [  [x1, y1], [x2, y2]  ].forEach(([nx2, ny2]) => {
      ctx.beginPath();
      ctx.arc(nx2, ny2, 4, 0, Math.PI * 2);
      const ng = ctx.createRadialGradient(nx2, ny2, 0, nx2, ny2, 7);
      ng.addColorStop(0,   `rgba(180,220,255,${alpha * 0.9})`);
      ng.addColorStop(0.6, `rgba(6,182,212,${alpha * 0.5})`);
      ng.addColorStop(1,   'rgba(6,182,212,0)');
      ctx.fillStyle = ng;
      ctx.fill();
    });
  }

  /* ── Cube configs ── */
  // Colors: top / left / right / edge
  const METAL  = { top:'180,188,200', left:'120,130,145', right:'95,105,120',  edge:'140,160,180' };
  const GLASS  = { top:'160,200,230', left:'100,150,190', right:'80,130,170',  edge:'100,180,220' };
  const DARK   = { top:'50,65,85',    left:'35,45,60',    right:'28,38,52',    edge:'60,100,140'  };

  // [gridX, gridY, gridZ, size, style, label, labelColor, floatOffset]
  const CUBES = [
    // Center main
    { gx:0, gy:0, gz:0, sz:52, col:METAL, lbl:'☁',  lc:'rgba(160,210,255,0.95)', fo:0 },
    // Top
    { gx:0, gy:0, gz:0, sz:38, col:GLASS, lbl:'GCP', lc:'rgba(255,200,80,0.9)',  fo:0.5, ox:80,  oy:-110 },
    // Top right
    { gx:0, gy:0, gz:0, sz:36, col:GLASS, lbl:'☁',  lc:'rgba(160,210,255,0.9)', fo:1.2, ox:160, oy:-60  },
    // Left
    { gx:0, gy:0, gz:0, sz:38, col:METAL, lbl:'aws', lc:'rgba(255,165,0,0.9)',   fo:0.8, ox:-160,oy:-20  },
    // Bottom left
    { gx:0, gy:0, gz:0, sz:34, col:GLASS, lbl:'A',   lc:'rgba(0,180,255,0.9)',   fo:1.5, ox:-90, oy:100  },
    // Bottom center
    { gx:0, gy:0, gz:0, sz:34, col:DARK,  lbl:'',    lc:'',                      fo:2.0, ox:20,  oy:130  },
    // Bottom right
    { gx:0, gy:0, gz:0, sz:36, col:DARK,  lbl:'[:]', lc:'rgba(100,180,255,0.8)', fo:1.0, ox:130, oy:100  },
    // Far right
    { gx:0, gy:0, gz:0, sz:36, col:METAL, lbl:'GC',  lc:'rgba(80,200,120,0.9)',  fo:0.3, ox:185, oy:30   },
    // Top left
    { gx:0, gy:0, gz:0, sz:32, col:DARK,  lbl:'',    lc:'',                      fo:1.8, ox:-50, oy:-90  },
    // Small extra
    { gx:0, gy:0, gz:0, sz:28, col:DARK,  lbl:'',    lc:'',                      fo:2.5, ox:50,  oy:-60  },
  ];

  // Connections: [from index, to index]
  const CONNS = [
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,2],[3,4],[6,7]
  ];

  const cx = W * 0.5;
  const cy = H * 0.52;
  let t = 0;

  function getCenter(cube, t) {
    const float = Math.sin(t * 0.6 + cube.fo) * 5;
    const x = cx + (cube.ox || 0);
    const y = cy + (cube.oy || 0) + float;
    return { x, y };
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Background glow
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55);
    bg.addColorStop(0,   'rgba(6,20,50,0.0)');
    bg.addColorStop(0.5, 'rgba(6,30,60,0.0)');
    bg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Draw connections
    CONNS.forEach(([ai, bi], ci) => {
      const a = getCenter(CUBES[ai], t);
      const b = getCenter(CUBES[bi], t);
      const prog = ((t * 0.4 + ci * 0.37) % 1 + 1) % 1;
      drawConnection(a.x, a.y, b.x, b.y, prog, 0.85);
    });

    // Draw cubes (sorted by y for pseudo-depth)
    [...CUBES]
      .map((c, i) => ({ ...c, i, ...getCenter(c, t) }))
      .sort((a, b) => a.y - b.y)
      .forEach(c => {
        const float = Math.sin(t * 0.6 + c.fo) * 5;
        const bx = cx + (c.ox || 0);
        const by = cy + (c.oy || 0) + float;

        // Shadow
        const sh = ctx.createRadialGradient(bx, by + c.sz * 0.6, 0, bx, by + c.sz * 0.6, c.sz * 0.7);
        sh.addColorStop(0, 'rgba(0,10,30,0.35)');
        sh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sh; ctx.fillRect(bx - c.sz, by, c.sz * 2, c.sz);

        drawCube(bx, by, 0, 0, 0, c.sz, c.col, 0.92);
        if (c.lbl) drawLabel(bx, by, 0, 0, 0, c.sz, c.lbl, c.lc);
      });

    t += 0.012;
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener('resize', () => {
    const nw = canvas.offsetWidth || 600;
    const nh = canvas.offsetHeight || 500;
    canvas.width  = nw * DPR;
    canvas.height = nh * DPR;
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
