import type { VercelRequest, VercelResponse } from '@vercel/node';
import app, { initServerState } from '../src/server/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initServerState();
  return app(req, res);
}
