// Vercel serverless function — proxy multi-proveedor para LLM.
// Detecta automáticamente qué API key está disponible y enruta a ese proveedor.
// Prioridad: Groq → Anthropic.
//
// Configuración en Vercel: Project → Settings → Environment Variables
//   GROQ_API_KEY=gsk_...        (preferida, gratis en console.groq.com)
//   ANTHROPIC_API_KEY=sk-ant-...

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!groqKey && !anthropicKey) {
    return res.status(500).json({
      error: {
        message: 'Ninguna API key configurada. Añade GROQ_API_KEY o ANTHROPIC_API_KEY en Vercel → Settings → Environment Variables.',
      },
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const max_tokens = body.max_tokens || 1500;
    const system = body.system || '';
    const messages = body.messages || [];

    // --- Groq (preferido si está disponible) ---
    if (groqKey) {
      const groqMessages = [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages,
      ];

      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          max_tokens,
          temperature: 0.7,
        }),
      });

      const data = await upstream.json();

      if (!upstream.ok) {
        return res.status(upstream.status).json({
          error: { message: data.error?.message || 'Error del proveedor Groq' },
        });
      }

      // Normalizar respuesta al formato Anthropic que espera el frontend
      const text = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({
        content: [{ type: 'text', text }],
      });
    }

    // --- Anthropic (fallback) ---
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens,
        system,
        messages,
      }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
