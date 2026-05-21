/**
 * SUHO Content Loader
 * ページ読み込み時に Worker KV からコンテンツを取得して DOM に適用します
 */
(async () => {
  const WORKER = localStorage.getItem('suho_worker_url')
               || 'https://suho-news-api.biz-e3c.workers.dev';
  const page = document.documentElement.dataset.page;
  if (!page) return;

  try {
    const res = await fetch(`${WORKER}/content/${page}`, { cache: 'no-store' });
    if (!res.ok) return;
    const content = await res.json();
    if (!content || !Object.keys(content).length) return;
    if (page === 'home')    applyHome(content);
    if (page === 'recruit') applyRecruit(content);
  } catch (e) { /* fallback to default HTML */ }

  /* ── helpers ─────────────────────────────────── */
  function setText(sel, val) {
    if (!val) return;
    const el = document.querySelector(sel);
    if (el) el.textContent = val;
  }
  function setHtml(sel, val) {
    if (!val) return;
    const el = document.querySelector(sel);
    if (el) el.innerHTML = val;
  }
  function setAttr(sel, attr, val) {
    if (!val) return;
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }
  function setSectionHead(sectionSel, data) {
    if (!data) return;
    setText(`${sectionSel} .section-tag`, data.tag);
    if (data.title || data.titleAccent) {
      const h2 = document.querySelector(`${sectionSel} .section-title`);
      if (h2) h2.innerHTML =
        `${data.title || ''}<br/><span class="gradient-text">${data.titleAccent || ''}</span>`;
    }
    setText(`${sectionSel} .section-desc`, data.desc);
  }

  /* ── HOME ─────────────────────────────────────── */
  function applyHome(c) {
    /* Hero */
    const h = c.hero || {};
    if (h.badge) {
      const badgeEl = document.querySelector('.hero-badge');
      if (badgeEl) {
        const dot = badgeEl.querySelector('.badge-dot');
        badgeEl.textContent = h.badge;
        if (dot) badgeEl.prepend(dot);
      }
    }
    if (h.title) {
      const lines = document.querySelectorAll('.hero-title .line');
      h.title.forEach((t, i) => { if (lines[i]) lines[i].textContent = t; });
    }
    setHtml('.hero-sub', h.subtitle);
    setText('.hero-actions .btn-primary span', h.btnPrimary);
    setText('.hero-actions .btn-ghost', h.btnGhost);
    if (h.stats) {
      const statEls = document.querySelectorAll('.hero-stats .stat');
      h.stats.forEach((s, i) => {
        if (!statEls[i]) return;
        const numEl = statEls[i].querySelector('.stat-n');
        const supEl = statEls[i].querySelector('sup');
        const pEl   = statEls[i].querySelector('p');
        if (numEl && s.number) { numEl.setAttribute('data-target', s.number); numEl.textContent = '0'; }
        if (supEl && s.unit)   supEl.textContent = s.unit;
        if (pEl   && s.label)  pEl.textContent   = s.label;
      });
    }

    /* AI Service */
    setSectionHead('#ai-service', c.aiService);
    if (c.aiService?.cards) {
      const cardEls = document.querySelectorAll('#ai-service .card-3d');
      c.aiService.cards.forEach((card, i) => {
        if (!cardEls[i]) return;
        setText.call(null, null, null); // noop
        const inner = cardEls[i].querySelector('.card-3d-inner');
        if (!inner) return;
        const h3  = inner.querySelector('h3');
        const p   = inner.querySelector('p');
        const lis = inner.querySelectorAll('.card-list li');
        if (h3 && card.title) h3.textContent = card.title;
        if (p  && card.desc)  p.textContent  = card.desc;
        if (card.items) lis.forEach((li, j) => { if (card.items[j]) li.textContent = card.items[j]; });
      });
    }

    /* Cloud */
    setSectionHead('#cloud', c.cloud);
    if (c.cloud?.features) {
      const fItems = document.querySelectorAll('#cloud .feature-item');
      c.cloud.features.forEach((f, i) => {
        if (!fItems[i]) return;
        const div = fItems[i].querySelector('div:not(.feature-icon)') || fItems[i];
        const h4 = div.querySelector('h4') || div.querySelector('strong');
        const p  = div.querySelector('p');
        if (h4 && f.title) h4.textContent = f.title;
        if (p  && f.desc)  p.textContent  = f.desc;
      });
    }

    /* Managed */
    setSectionHead('#managed', c.managed);
    if (c.managed?.cards) {
      const mfCards = document.querySelectorAll('#managed .mf-card');
      c.managed.cards.forEach((card, i) => {
        if (!mfCards[i]) return;
        const h3 = mfCards[i].querySelector('h3');
        const p  = mfCards[i].querySelector('p');
        if (h3 && card.title) h3.textContent = card.title;
        if (p  && card.desc)  p.textContent  = card.desc;
      });
    }

    /* Products */
    setSectionHead('#products', c.products);

    /* About */
    const ab = c.about || {};
    setText('#about .section-tag', ab.tag);
    if (ab.title || ab.titleAccent) {
      const h2 = document.querySelector('#about .section-title');
      if (h2) h2.innerHTML = `${ab.title || ''}<br/><span class="gradient-text">${ab.titleAccent || ''}</span>`;
    }
    setText('#about .about-lead', ab.lead);
    setText('#about .about-body', ab.body);
    if (ab.stats) {
      const asEls = document.querySelectorAll('#about .about-stat');
      ab.stats.forEach((s, i) => {
        if (!asEls[i]) return;
        const numEl = asEls[i].querySelector('.as-num');
        const supEl = asEls[i].querySelector('.as-sup');
        const pEl   = asEls[i].querySelector('p');
        if (numEl && s.number) { numEl.setAttribute('data-target', s.number); numEl.textContent = '0'; }
        if (supEl && s.unit)   supEl.textContent = s.unit;
        if (pEl   && s.label)  pEl.textContent   = s.label;
      });
    }

    /* Contact */
    const ct = c.contact || {};
    setText('#contact .section-tag', ct.tag);
    setText('#contact .section-title', ct.title);
    setText('#contact p', ct.desc);
  }

  /* ── RECRUIT ──────────────────────────────────── */
  function applyRecruit(c) {
    /* Hero */
    const h = c.hero || {};
    setText('.section-tag', h.tag);
    if (h.title || h.titleAccent) {
      const h1 = document.querySelector('.page-hero-title');
      if (h1) h1.innerHTML = `${h.title || ''}<br/><span class="gradient-text">${h.titleAccent || ''}</span>`;
    }
    setText('.page-hero-sub', h.subtitle);
    if (h.stats) {
      const phsEls = document.querySelectorAll('.phs');
      h.stats.forEach((s, i) => {
        if (!phsEls[i]) return;
        const numEl = phsEls[i].querySelector('.phs-num');
        if (numEl && s.number) {
          const sup = numEl.querySelector('sup');
          numEl.textContent = s.number;
          if (sup) { numEl.appendChild(sup); sup.textContent = s.unit || ''; }
          else if (s.unit) { const newSup = document.createElement('sup'); newSup.textContent = s.unit; numEl.appendChild(newSup); }
        }
        const pEl = phsEls[i].querySelector('p');
        if (pEl && s.label) pEl.textContent = s.label;
      });
    }

    /* Conditions */
    const cond = c.conditions || {};
    const sections = document.querySelectorAll('.section');
    const condSec = [...sections].find(s => s.querySelector('.section-tag')?.textContent?.includes('勤務'));
    if (condSec) {
      setText.call(null, null, null);
      const tag = condSec.querySelector('.section-tag'); if (tag && cond.tag) tag.textContent = cond.tag;
      const h2  = condSec.querySelector('.section-title');
      if (h2 && (cond.title || cond.titleAccent))
        h2.innerHTML = `${cond.title || ''}<span class="gradient-text">${cond.titleAccent || ''}</span>`;
      const desc = condSec.querySelector('.section-desc'); if (desc && cond.desc) desc.textContent = cond.desc;
      if (cond.cards) {
        const vcards = condSec.querySelectorAll('.value-card');
        cond.cards.forEach((card, i) => {
          if (!vcards[i]) return;
          const vi = vcards[i].querySelector('.vi'); if (vi && card.icon) vi.textContent = card.icon;
          const h3 = vcards[i].querySelector('h3');  if (h3 && card.title) h3.textContent = card.title;
          const p  = vcards[i].querySelector('p');   if (p  && card.desc)  p.textContent  = card.desc;
        });
      }
    }

    /* Benefits */
    const ben = c.benefits || {};
    const benSec = [...sections].find(s => s.querySelector('.section-tag')?.textContent?.includes('福利'));
    if (benSec && ben.items) {
      const bItems = benSec.querySelectorAll('.benefit-item');
      ben.items.forEach((item, i) => {
        if (!bItems[i]) return;
        const ic = bItems[i].querySelector('.benefit-icon'); if (ic && item.icon) ic.textContent = item.icon;
        const h4 = bItems[i].querySelector('h4');           if (h4 && item.title) h4.textContent = item.title;
        const p  = bItems[i].querySelector('p');            if (p  && item.desc)  p.textContent  = item.desc;
      });
    }

    /* CTA */
    const cta = c.cta || {};
    const ctaSec = [...sections].find(s => s.querySelector('.recruit-cta'));
    if (ctaSec) {
      if (cta.title) {
        const h2 = ctaSec.querySelector('.recruit-cta h2');
        if (h2) h2.innerHTML = `${cta.title}<br/><span class="gradient-text">${cta.titleAccent || ''}</span>`;
      }
      setText.call(null, null, null);
      const p = ctaSec.querySelector('.recruit-cta p'); if (p && cta.desc) p.textContent = cta.desc;
      const btn = ctaSec.querySelector('.btn-primary span'); if (btn && cta.btnText) btn.textContent = cta.btnText;
    }
  }
})();
