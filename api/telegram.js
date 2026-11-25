module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) {
    return res.status(501).json({ ok: false, error: 'Telegram bot env vars not configured on Vercel' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message || message.length > 4000) {
      return res.status(400).json({ ok: false, error: 'Invalid message payload' });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await tgRes.json();
    if (!tgRes.ok || !data.ok) {
      return res.status(502).json({ ok: false, error: data.description || 'Telegram API error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Failed to send Telegram message' });
  }
}
