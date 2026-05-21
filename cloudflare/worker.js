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
