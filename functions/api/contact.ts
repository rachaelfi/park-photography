/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * The only server-side code on the site, and the only place that accepts input
 * from strangers, so everything arriving here is treated as hostile until
 * checked. Sends through Resend using three environment variables set in the
 * Pages dashboard: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL.
 */

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

interface Context {
  request: Request;
  env: Env;
}

/** Whole request. A genuine enquiry is a few kilobytes at most. */
const MAX_BODY_BYTES = 20_000;

/** Per-field caps, so nobody can push a novel through your inbox. */
const LIMITS = {
  name: 120,
  email: 254, // the maximum length of a valid email address
  kind: 80,
  date: 10,
  message: 5_000,
} as const;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/**
 * Anything that isn't a string becomes empty. Form posts can carry file
 * uploads, and calling .trim() on one would throw.
 */
const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/** Line breaks have no business in a name or a subject line. */
const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, ' ');

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  // Only accept submissions from this site's own pages. A form hosted on some
  // other domain posting here gets turned away. Comparing against the request's
  // own origin means preview deployments work without a hardcoded list.
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return json({ error: 'Forbidden.' }, 403);
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return json({ error: 'Message is too long.' }, 413);
  }

  let data: Record<string, unknown>;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    data = contentType.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    // Malformed body. Previously this threw and surfaced as a 500.
    return json({ error: 'Could not read the form.' }, 400);
  }

  if (!data || typeof data !== 'object') {
    return json({ error: 'Could not read the form.' }, 400);
  }

  // Honeypot filled means a bot. Report success so it doesn't retry.
  if (text(data.company, 200)) return json({ ok: true });

  const name = oneLine(text(data.name, LIMITS.name));
  const email = text(data.email, LIMITS.email);
  const kind = oneLine(text(data.kind, LIMITS.kind));
  const rawDate = text(data.date, LIMITS.date);
  const message = text(data.message, LIMITS.message);

  if (!name || !email || !message) {
    return json({ error: 'Name, email and message are required.' }, 400);
  }

  if (!/^[^@\s,;<>]+@[^@\s,;<>]+\.[^@\s,;<>]+$/.test(email)) {
    return json({ error: 'That email address looks incomplete.' }, 400);
  }

  // The date field is a native date input, which always sends YYYY-MM-DD.
  // Anything else was typed by hand into a crafted request, so drop it.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : '';

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Enquiry: ${kind || 'Not specified'}`,
    `Date: ${date || 'Not given'}`,
    '',
    message,
  ].join('\n');

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Park Photography <${env.CONTACT_FROM_EMAIL}>`,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `Enquiry from ${name}${kind ? ` — ${kind}` : ''}`,
        text: body,
        html: `<pre style="font:14px/1.6 ui-sans-serif,system-ui;white-space:pre-wrap">${escapeHtml(body)}</pre>`,
      }),
    });
  } catch {
    return json({ error: 'Mail delivery failed.' }, 502);
  }

  // Resend's own error details stay server-side; the visitor just learns it
  // didn't go through.
  if (!response.ok) {
    return json({ error: 'Mail delivery failed.' }, 502);
  }

  return json({ ok: true });
};

/** Anything other than POST gets a clean refusal rather than a 404 page. */
export const onRequest = async (): Promise<Response> =>
  new Response('Method not allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });