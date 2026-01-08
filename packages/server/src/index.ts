import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { memoryStore } from '@repo/store';

const app = new Hono();

// Enable CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite + Next.js
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get content by format
app.get('/content/:format', async (c) => {
  const format = c.req.param('format') as 'json' | 'html';
  
  if (format !== 'json' && format !== 'html') {
    return c.json({ error: 'Format must be "json" or "html"' }, 400);
  }

  try {
    const content = await memoryStore.get(format);
    return c.json({ format, content });
  } catch (error) {
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Get all content
app.get('/content', async (c) => {
  try {
    const content = await memoryStore.getAll();
    return c.json(content);
  } catch (error) {
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Save content
app.post('/content/:format', async (c) => {
  const format = c.req.param('format') as 'json' | 'html';
  
  if (format !== 'json' && format !== 'html') {
    return c.json({ error: 'Format must be "json" or "html"' }, 400);
  }

  try {
    const body = await c.req.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return c.json({ error: 'Content must be a string' }, 400);
    }

    await memoryStore.set(content, format);
    return c.json({ success: true, format });
  } catch (error) {
    return c.json({ error: 'Failed to save content' }, 500);
  }
});

// Reset to defaults
app.post('/content/reset', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { format } = body;

    await memoryStore.reset(format);
    return c.json({ success: true, reset: format || 'all' });
  } catch (error) {
    return c.json({ error: 'Failed to reset content' }, 500);
  }
});

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3001;

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;