import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'llm-proxy',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method !== 'POST') return next();

            const groqKey = env.GROQ_API_KEY;
            const anthropicKey = env.ANTHROPIC_API_KEY;

            if (!groqKey && !anthropicKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: {
                  message: 'Ninguna API key configurada. Añade GROQ_API_KEY o ANTHROPIC_API_KEY a .env.local y reinicia el dev server.',
                },
              }));
              return;
            }

            try {
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              const max_tokens = body.max_tokens || 1500;
              const system = body.system || '';
              const messages = body.messages || [];

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
                  res.statusCode = upstream.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: { message: data.error?.message || 'Error del proveedor Groq' },
                  }));
                  return;
                }
                const text = data.choices?.[0]?.message?.content || '';
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ content: [{ type: 'text', text }] }));
                return;
              }

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

              const text = await upstream.text();
              res.statusCode = upstream.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(text);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: { message: err.message } }));
            }
          });
        },
      },
    ],
  };
});
