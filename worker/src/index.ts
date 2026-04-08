import { adminHtml } from './admin-html';
import { EmailMessage } from 'cloudflare:email';

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function buildRawEmail(from: string, to: string, subject: string, htmlBody: string): string {
  const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subject)}?=`;
  const base64Body = utf8ToBase64(htmlBody);
  const wrappedBody = (base64Body.match(/.{1,76}/g) ?? [base64Body]).join('\r\n');
  return [
    'MIME-Version: 1.0',
    `From: NG7 Customs <${from}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrappedBody,
  ].join('\r\n');
}

interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  SEND_EMAIL: SendEmail;
  ADMIN_PASSWORD: string;
  NOTIFY_EMAIL: string;
  FROM_EMAIL: string;
  ALLOWED_ORIGIN: string;
  VERCEL_DEPLOY_HOOK: string;
}

interface SendEmail {
  send(message: EmailMessage): Promise<void>;
}

// In-memory rate limit (resets per Worker instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

function sanitize(input: string): string {
  return input.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// HMAC-SHA256 token — stateless, derived from admin password
async function createToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('ng7-admin-v1'));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function isAuthed(request: Request, env: Env): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const expected = await createToken(env.ADMIN_PASSWORD);
  // Constant-time comparison
  const a = auth.slice(7);
  if (a.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= a.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, 401);
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    const method = request.method;
    const baseUrl = url.origin;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // ── ADMIN UI ──────────────────────────────────────
    if (path === '/admin' && method === 'GET') {
      return new Response(adminHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // ── LOGIN ─────────────────────────────────────────
    if (path === '/admin/login' && method === 'POST') {
      try {
        const body = await request.json() as { password?: string };
        if (!body.password || body.password !== env.ADMIN_PASSWORD) {
          return json({ error: 'Invalid password' }, 401);
        }
        const token = await createToken(env.ADMIN_PASSWORD);
        return json({ token });
      } catch {
        return json({ error: 'Bad request' }, 400);
      }
    }

    // ── PUBLIC: GET /api/werke  (for Astro build) ─────
    if (path === '/api/werke' && method === 'GET') {
      const kategorie = url.searchParams.get('kategorie');
      const withBilder = url.searchParams.get('with_bilder') === '1';
      let query = 'SELECT id, name, kategorie, bild_key, aktiv, reihenfolge, beschreibung FROM werke WHERE aktiv = 1';
      const params: string[] = [];
      if (kategorie) { query += ' AND kategorie = ?'; params.push(kategorie); }
      query += ' ORDER BY reihenfolge ASC, created_at ASC';
      const { results } = await env.DB.prepare(query).bind(...params).all();
      const werke = results.map(w => ({
        ...w,
        bild_url: w.bild_key ? `/images/${w.bild_key}` : null,
      }));

      if (withBilder && werke.length > 0) {
        const ids = werke.map(w => w.id as string);
        const placeholders = ids.map(() => '?').join(',');
        const { results: bilderResults } = await env.DB.prepare(
          `SELECT id, werk_id, bild_key, beschreibung, reihenfolge FROM werk_bilder WHERE werk_id IN (${placeholders}) ORDER BY reihenfolge ASC, created_at ASC`
        ).bind(...ids).all();
        const bilderMap: Record<string, { bild_url: string; beschreibung: string | null }[]> = {};
        bilderResults.forEach(b => {
          const wid = String(b.werk_id);
          if (!bilderMap[wid]) bilderMap[wid] = [];
          bilderMap[wid].push({ bild_url: `/images/${b.bild_key}`, beschreibung: b.beschreibung as string | null });
        });
        return new Response(JSON.stringify(werke.map(w => ({ ...w, bilder: bilderMap[String(w.id)] || [] }))), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
        });
      }

      return new Response(JSON.stringify(werke), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    // ── PUBLIC: GET /api/settings ─────────────────────
    if (path === '/api/settings' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT key, bild_key FROM settings').all();
      const out: Record<string, string | null> = {};
      results.forEach(r => { out[String(r.key)] = r.bild_key ? `/images/${r.bild_key}` : null; });
      return new Response(JSON.stringify(out), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
      });
    }

    // ── PUBLIC: serve image from R2 ───────────────────
    if (path.startsWith('/images/') && method === 'GET') {
      const key = path.slice('/images/'.length);
      if (!key || key.includes('..')) return new Response('Not found', { status: 404 });
      const object = await env.IMAGES.get(key);
      if (!object) return new Response('Not found', { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(object.body, { headers });
    }

    // ── PUBLIC: GET /api/werke/:id/bilder ────────────
    const werkBilderPub = path.match(/^\/api\/werke\/([a-f0-9]+)\/bilder$/);
    if (werkBilderPub && method === 'GET') {
      const werkId = werkBilderPub[1];
      const { results } = await env.DB.prepare(
        'SELECT id, werk_id, bild_key, beschreibung, reihenfolge FROM werk_bilder WHERE werk_id = ? ORDER BY reihenfolge ASC, created_at ASC'
      ).bind(werkId).all();
      const bilder = results.map(b => ({ ...b, bild_url: `/images/${b.bild_key}` }));
      return new Response(JSON.stringify(bilder), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ── PUBLIC: POST /api/contact — contact form ──────
    if ((path === '/api/contact' || path === '/') && method === 'POST') {
      return handleContact(request, env);
    }

    // ── PROTECTED: all remaining routes need auth ─────
    if (!(await isAuthed(request, env))) return unauthorized();

    // PUT /api/settings/:key
    const settingMatch = path.match(/^\/api\/settings\/([a-z_]+)$/);
    if (settingMatch && method === 'PUT') {
      const key = settingMatch[1];
      const body = await request.json() as { bild_key?: string | null };
      await env.DB.prepare("UPDATE settings SET bild_key=?, updated_at=datetime('now') WHERE key=?")
        .bind(body.bild_key ?? null, key).run();
      return json({ ok: true });
    }

    // GET /api/werke/all — admin sees all including inactive
    if (path === '/api/werke/all' && method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM werke ORDER BY reihenfolge ASC, created_at ASC'
      ).all();
      const werke = results.map(w => ({
        ...w,
        bild_url: w.bild_key ? `/images/${w.bild_key}` : null,
      }));
      return json(werke);
    }

    // POST /api/werke — create
    if (path === '/api/werke' && method === 'POST') {
      try {
        const body = await request.json() as {
          name: string; kategorie: string; bild_key?: string | null;
          aktiv?: number; reihenfolge?: number; beschreibung?: string | null;
        };
        if (!body.name || !body.kategorie) return json({ error: 'name and kategorie required' }, 400);
        const id = generateId();
        await env.DB.prepare(
          'INSERT INTO werke (id, name, kategorie, bild_key, aktiv, reihenfolge, beschreibung) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, sanitize(body.name), body.kategorie, body.bild_key ?? null, body.aktiv ?? 1, body.reihenfolge ?? 0, body.beschreibung ?? null).run();
        return json({ id });
      } catch {
        return json({ error: 'Fehler beim Anlegen' }, 500);
      }
    }

    // PUT /api/werke/:id — update
    const werkUpdateMatch = path.match(/^\/api\/werke\/([a-f0-9]+)$/);
    if (werkUpdateMatch && method === 'PUT') {
      try {
        const id = werkUpdateMatch[1];
        const body = await request.json() as {
          name?: string; kategorie?: string; aktiv?: number;
          reihenfolge?: number; beschreibung?: string | null;
        };
        await env.DB.prepare(
          "UPDATE werke SET name=?, kategorie=?, aktiv=?, reihenfolge=?, beschreibung=?, updated_at=datetime('now') WHERE id=?"
        ).bind(
          sanitize(body.name ?? ''), body.kategorie ?? 'einzelstuecke',
          body.aktiv ?? 1, body.reihenfolge ?? 0, body.beschreibung ?? null, id
        ).run();
        return json({ ok: true });
      } catch {
        return json({ error: 'Fehler beim Speichern' }, 500);
      }
    }

    // DELETE /api/werke/:id
    const werkDeleteMatch = path.match(/^\/api\/werke\/([a-f0-9]+)$/);
    if (werkDeleteMatch && method === 'DELETE') {
      const id = werkDeleteMatch[1];
      // Get bild_key first to delete from R2
      const werk = await env.DB.prepare('SELECT bild_key FROM werke WHERE id = ?').bind(id).first();
      if (werk?.bild_key) {
        await env.IMAGES.delete(String(werk.bild_key));
      }
      await env.DB.prepare('DELETE FROM werke WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    // POST /api/werke/:id/bilder — add gallery image
    const werkBilderPost = path.match(/^\/api\/werke\/([a-f0-9]+)\/bilder$/);
    if (werkBilderPost && method === 'POST') {
      const werkId = werkBilderPost[1];
      try {
        const body = await request.json() as { bild_key: string; beschreibung?: string | null; reihenfolge?: number };
        if (!body.bild_key) return json({ error: 'bild_key required' }, 400);
        const id = generateId();
        await env.DB.prepare(
          'INSERT INTO werk_bilder (id, werk_id, bild_key, beschreibung, reihenfolge) VALUES (?, ?, ?, ?, ?)'
        ).bind(id, werkId, body.bild_key, body.beschreibung ?? null, body.reihenfolge ?? 0).run();
        // Auto-set cover if werk has no image yet
        const werk = await env.DB.prepare('SELECT bild_key FROM werke WHERE id=?').bind(werkId).first();
        if (!werk?.bild_key) {
          await env.DB.prepare("UPDATE werke SET bild_key=?, updated_at=datetime('now') WHERE id=?")
            .bind(body.bild_key, werkId).run();
        }
        return json({ id });
      } catch { return json({ error: 'Fehler beim Anlegen' }, 500); }
    }

    // PUT /api/werke/bilder/:bildId — update description
    const bildUpdate = path.match(/^\/api\/werke\/bilder\/([a-f0-9]+)$/);
    if (bildUpdate && method === 'PUT') {
      const bildId = bildUpdate[1];
      try {
        const body = await request.json() as { beschreibung?: string | null; reihenfolge?: number };
        await env.DB.prepare('UPDATE werk_bilder SET beschreibung=?, reihenfolge=? WHERE id=?')
          .bind(body.beschreibung ?? null, body.reihenfolge ?? 0, bildId).run();
        return json({ ok: true });
      } catch { return json({ error: 'Fehler' }, 500); }
    }

    // DELETE /api/werke/bilder/:bildId
    const bildDelete = path.match(/^\/api\/werke\/bilder\/([a-f0-9]+)$/);
    if (bildDelete && method === 'DELETE') {
      const bildId = bildDelete[1];
      const bild = await env.DB.prepare('SELECT bild_key, werk_id FROM werk_bilder WHERE id = ?').bind(bildId).first();
      if (!bild) return json({ ok: true });
      if (bild.bild_key) await env.IMAGES.delete(String(bild.bild_key));
      await env.DB.prepare('DELETE FROM werk_bilder WHERE id = ?').bind(bildId).run();
      // Sync cover with first remaining image
      const first = await env.DB.prepare(
        'SELECT bild_key FROM werk_bilder WHERE werk_id=? ORDER BY reihenfolge ASC, created_at ASC LIMIT 1'
      ).bind(String(bild.werk_id)).first();
      await env.DB.prepare("UPDATE werke SET bild_key=?, updated_at=datetime('now') WHERE id=?")
        .bind(first?.bild_key ?? null, String(bild.werk_id)).run();
      return json({ ok: true });
    }

    // PUT /api/werke/:id/bilder/reorder — drag-drop reorder
    const reorderMatch = path.match(/^\/api\/werke\/([a-f0-9]+)\/bilder\/reorder$/);
    if (reorderMatch && method === 'PUT') {
      const werkId = reorderMatch[1];
      try {
        const { order } = await request.json() as { order: string[] };
        if (!order?.length) return json({ error: 'order required' }, 400);
        for (let i = 0; i < order.length; i++) {
          await env.DB.prepare('UPDATE werk_bilder SET reihenfolge=? WHERE id=? AND werk_id=?')
            .bind(i, order[i], werkId).run();
        }
        // Sync cover to first item
        const first = await env.DB.prepare('SELECT bild_key FROM werk_bilder WHERE id=?').bind(order[0]).first();
        if (first?.bild_key) {
          await env.DB.prepare("UPDATE werke SET bild_key=?, updated_at=datetime('now') WHERE id=?")
            .bind(String(first.bild_key), werkId).run();
        }
        return json({ ok: true });
      } catch { return json({ error: 'Fehler' }, 500); }
    }

    // POST /api/upload — image to R2
    if (path === '/api/upload' && method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) return json({ error: 'Keine Datei' }, 400);

        // Validate type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          return json({ error: 'Nur Bilder erlaubt (jpg, png, webp)' }, 400);
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
          return json({ error: 'Bild zu groß (max. 10 MB)' }, 400);
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const key = `werke/${generateId()}.${ext}`;
        await env.IMAGES.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type },
        });
        return json({ key, url: `/images/${key}` });
      } catch {
        return json({ error: 'Upload fehlgeschlagen' }, 500);
      }
    }

    // POST /api/deploy — trigger Vercel rebuild
    if (path === '/api/deploy' && method === 'POST') {
      if (!env.VERCEL_DEPLOY_HOOK) return json({ error: 'Deploy Hook nicht konfiguriert' }, 500);
      const res = await fetch(env.VERCEL_DEPLOY_HOOK, { method: 'POST' });
      return json({ ok: res.ok });
    }

    return new Response('Not found', { status: 404 });
  },
};

// ── Contact form handler ───────────────────────────────────────────────────
async function handleContact(request: Request, env: Env): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Zu viele Anfragen. Bitte warte ein paar Minuten.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json() as { name?: string; email?: string; kategorie?: string; nachricht?: string };

    if (!body.name || !body.email || !body.nachricht) {
      return new Response(JSON.stringify({ error: 'Pflichtfelder fehlen.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(JSON.stringify({ error: 'Ungültige E-Mail-Adresse.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (/https?:\/\//i.test(body.nachricht)) {
      return new Response(JSON.stringify({ error: 'Links sind nicht erlaubt.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const safeName = sanitize(body.name);
    const safeEmail = sanitize(body.email);
    const safeKat = sanitize(body.kategorie || '');
    const safeMsg = sanitize(body.nachricht);

    await env.DB.prepare(
      "INSERT INTO contact_submissions (name, email, kategorie, nachricht, ip, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).bind(safeName, safeEmail, safeKat, safeMsg, clientIp).run();

    try {
      const subject = `Neue Anfrage von ${safeName}${safeKat ? ` (${safeKat})` : ''}`;
      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#1A1917;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1A1917" style="background-color:#1A1917;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#2A2723" style="background-color:#2A2723;max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td bgcolor="#2A2723" style="background-color:#2A2723;padding:32px 40px 24px;border-bottom:1px solid #3A372F;">
          <span style="font-size:18px;letter-spacing:4px;text-transform:uppercase;color:#A0977D;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;">NG7</span><span style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#A0977D;padding-left:8px;font-family:'Helvetica Neue',Arial,sans-serif;">Customs</span>
        </td></tr>
        <!-- Title -->
        <tr><td bgcolor="#2A2723" style="background-color:#2A2723;padding:28px 40px 8px;">
          <h1 style="margin:0;font-size:20px;font-weight:600;color:#F5F0E8;">Neue Kontaktanfrage</h1>
        </td></tr>
        <!-- Fields -->
        <tr><td bgcolor="#2A2723" style="background-color:#2A2723;padding:20px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #3A372F;">
                <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8A8070;">Name</span><br>
                <span style="font-size:15px;color:#F5F0E8;line-height:24px;">${safeName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #3A372F;">
                <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8A8070;">E-Mail</span><br>
                <a href="mailto:${safeEmail}" style="font-size:15px;color:#A0977D;text-decoration:none;">${safeEmail}</a>
              </td>
            </tr>
            ${safeKat ? `<tr>
              <td style="padding:12px 0;border-bottom:1px solid #3A372F;">
                <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8A8070;">Kategorie</span><br>
                <span style="font-size:15px;color:#F5F0E8;line-height:24px;">${safeKat}</span>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:12px 0;">
                <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8A8070;">Nachricht</span><br>
                <span style="font-size:15px;color:#F5F0E8;line-height:24px;">${safeMsg.replace(/\n/g, '<br>')}</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Reply Button -->
        <tr><td bgcolor="#2A2723" style="background-color:#2A2723;padding:8px 40px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid #A0977D;padding:10px 24px;">
            <a href="mailto:${safeEmail}" style="color:#A0977D;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;">Antworten</a>
          </td></tr></table>
        </td></tr>
        <!-- Footer -->
        <tr><td bgcolor="#2A2723" style="background-color:#2A2723;padding:20px 40px;border-top:1px solid #3A372F;">
          <span style="font-size:11px;color:#8A8070;">ng7-customs.com</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const rawEmail = buildRawEmail(env.FROM_EMAIL, env.NOTIFY_EMAIL, subject, htmlBody);
      const emailMessage = new EmailMessage(env.FROM_EMAIL, env.NOTIFY_EMAIL, rawEmail);
      await env.SEND_EMAIL.send(emailMessage);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Serverfehler. Bitte versuche es später erneut.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
