import * as PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    try {
      const parser = new PostalMime.default();
      const rawEmail = new Response(message.raw);
      const parsed = await parser.parse(await rawEmail.arrayBuffer());

      const payload = {
        to: message.to,
        from: parsed.from?.address || message.from,
        fromName: parsed.from?.name || '',
        subject: parsed.subject || '(no subject)',
        text: parsed.text || '',
        html: parsed.html || '',
        attachments: (parsed.attachments || []).map((a) => ({
          filename: a.filename || 'attachment',
          contentType: a.mimeType || 'application/octet-stream',
          size: a.content ? a.content.byteLength : 0,
        })),
      };

      const res = await fetch(env.BACKEND_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-webhook-secret': env.WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('[worker] Backend rejected email:', res.status, await res.text());
      }
    } catch (err) {
      // Never throw here — an uncaught error would bounce the email back to the sender.
      console.error('[worker] Failed to process inbound email:', err);
    }
  },
};
