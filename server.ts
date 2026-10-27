import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { initServerState } from './src/server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

async function startServer() {
  await initServerState();

  if (!isProd) {
    // In development mode, mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production container mode, serve built dist folder
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(
      `AFNAAN CARES Nurses & Caregiver server running on port ${PORT} [${isProd ? 'production' : 'development'}]`
    );
    if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project-id')) {
      console.log(`[Supabase] Custom Supabase configuration detected: ${process.env.SUPABASE_URL}`);
    } else {
      console.log(`[Supabase] Ready for Supabase connection. Paste your API keys into the .env file.`);
    }
  });
}

// Only start the HTTP listener if not running in Vercel serverless environment
if (!isVercel) {
  startServer();
}

export default app;
