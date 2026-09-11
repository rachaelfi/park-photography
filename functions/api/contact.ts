type Env = {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  RESEND_FROM_EMAIL?: string;
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const form = await request.formData();
  const honeypot = String(form.get('website') ?? '').trim();

  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' }
    });
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const session = String(form.get('session') ?? '').trim();
  const date = String(form.get('date') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();

  if (!name || !email || !session || !message) {
    return new Response(JSON.stringify({ ok: false, error: 'Please complete the required fields.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.RESEND_FROM_EMAIL) {
    return new Response(JSON.stringify({ ok: false, error: 'Email delivery is not configured yet.' }), {
      status: 503,
      headers: { 'content-type': 'application/json' }
    });
  }

  const subject = `New Park Photography inquiry — ${session}`;
  const html = `
    <h2>New Park Photography inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Session:</strong> ${escapeHtml(session)}</p>
    <p><strong>Date / timeframe:</strong> ${escapeHtml(date || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject,
      html
    })
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ ok: false, error: 'The message could not be sent.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' }
  });
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
