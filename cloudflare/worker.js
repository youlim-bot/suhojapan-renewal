/**
 * SUHO News API — Cloudflare Worker
 *
 * Routes:
 *   GET    /articles          → 全記事取得（公開）
 *   POST   /articles          → 記事追加（要認証）
 *   PUT    /articles/:id      → 記事更新（要認証）
 *   DELETE /articles/:id      → 記事削除（要認証）
 *   POST   /upload            → 画像アップロード（要認証）
 *   GET    /image/:filename   → 画像配信（公開）
 *   POST   /seed              → 初期データ投入（要認証）
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url  = new URL(request.url);
    const path = url.pathname;
    const { method } = request;

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });

    const authed = () => {
      const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
      return token === env.ADMIN_TOKEN;
    };

    try {
      /* ── GET / ─────────────────────────────────── */
      if (path === '/' && method === 'GET') {
        const raw  = await env.NEWS_KV.get('articles');
        const count = raw ? JSON.parse(raw).length : 0;
        return new Response(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>SUHO News API</title>
<style>body{font-family:sans-serif;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#1e293b;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:40px;text-align:center;max-width:420px}
h1{background:linear-gradient(135deg,#6366f1,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:1.8rem;margin:0 0 8px}
p{color:#94a3b8;margin:6px 0}.badge{display:inline-block;background:rgba(16,185,129,.15);color:#10b981;border:1px solid rgba(16,185,129,.3);border-radius:8px;padding:4px 14px;font-size:.85rem;font-weight:700;margin-bottom:20px}
.ep{background:#0f172a;border-radius:10px;padding:14px;text-align:left;font-size:.82rem;color:#94a3b8;margin-top:20px}
.ep div{padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)}.ep div:last-child{border:none}
.method{color:#6366f1;font-weight:700;margin-right:8px}</style></head>
<body><div class="card">
<h1>SUHO News API</h1>
<div class="badge">✅ 稼働中</div>
<p>記事数: <strong style="color:#f1f5f9">${count}件</strong></p>
<div class="ep">
<div><span class="method">GET</span>/articles</div>
<div><span class="method">POST</span>/articles</div>
<div><span class="method">PUT</span>/articles/:id</div>
<div><span class="method">DELETE</span>/articles/:id</div>
<div><span class="method">POST</span>/upload</div>
<div><span class="method">GET</span>/image/:filename</div>
</div></div></body></html>`, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...CORS },
        });
      }

      /* ── GET /articles ─────────────────────────── */
      if (path === '/articles' && method === 'GET') {
        const raw = await env.NEWS_KV.get('articles');
        return json({ articles: raw ? JSON.parse(raw) : [] });
      }

      /* ── POST /articles ────────────────────────── */
      if (path === '/articles' && method === 'POST') {
        if (!authed()) return json({ error: 'Unauthorized' }, 401);
        const article = await request.json();
        const raw = await env.NEWS_KV.get('articles');
        const list = raw ? JSON.parse(raw) : [];
        article.id = `${Date.now()}`;
        list.unshift(article);
        await env.NEWS_KV.put('articles', JSON.stringify(list));
        return json(article, 201);
      }

      /* ── PUT /articles/:id ─────────────────────── */
      if (/^\/articles\/[^/]+$/.test(path) && method === 'PUT') {
        if (!authed()) return json({ error: 'Unauthorized' }, 401);
        const id = path.split('/')[2];
        const updates = await request.json();
        const raw = await env.NEWS_KV.get('articles');
        const list = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex(a => a.id === id);
        if (idx === -1) return json({ error: 'Not found' }, 404);
        list[idx] = { ...list[idx], ...updates };
        await env.NEWS_KV.put('articles', JSON.stringify(list));
        return json(list[idx]);
      }

      /* ── DELETE /articles/:id ──────────────────── */
      if (/^\/articles\/[^/]+$/.test(path) && method === 'DELETE') {
        if (!authed()) return json({ error: 'Unauthorized' }, 401);
        const id = path.split('/')[2];
        const raw = await env.NEWS_KV.get('articles');
        const list = raw ? JSON.parse(raw) : [];
        await env.NEWS_KV.put('articles', JSON.stringify(list.filter(a => a.id !== id)));
        return json({ success: true });
      }

      /* ── POST /upload ──────────────────────────── */
      if (path === '/upload' && method === 'POST') {
        if (!authed()) return json({ error: 'Unauthorized' }, 401);
        const formData = await request.formData();
        const file = formData.get('image');
        if (!file) return json({ error: 'No image provided' }, 400);

        const ext      = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const filename = `${Date.now()}.${ext}`;
        await env.NEWS_R2.put(`news/${filename}`, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        // Worker が直接画像を配信するので、R2公開URLは不要
        const imageUrl = `${url.origin}/image/${filename}`;
        return json({ url: imageUrl });
      }

      /* ── GET /image/:filename ──────────────────── */
      if (path.startsWith('/image/') && method === 'GET') {
        const filename = decodeURIComponent(path.slice('/image/'.length));
        const obj = await env.NEWS_R2.get(`news/${filename}`);
        if (!obj) return new Response('Not found', { status: 404, headers: CORS });
        return new Response(obj.body, {
          headers: {
            ...CORS,
            'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      }

      /* ── POST /seed ────────────────────────────── */
      if (path === '/seed' && method === 'POST') {
        if (!authed()) return json({ error: 'Unauthorized' }, 401);
        const { articles } = await request.json();
        const seeded = articles.map((a, i) => ({
          id: a.id || `seed-${Date.now()}-${i}`,
          ...a,
        }));
        await env.NEWS_KV.put('articles', JSON.stringify(seeded));
        return json({ success: true, count: seeded.length });
      }

      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  },
};
