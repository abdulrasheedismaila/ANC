import type { VercelRequest, VercelResponse } from '@vercel/node';
import app, { initServerState } from '../src/server/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure Supabase connection or local cache state is primed
  await initServerState();
  // Delegate request handling to Express app
  return app(req, res);
}
