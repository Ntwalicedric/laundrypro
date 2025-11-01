import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePickupOrder } from "../server/routes/order";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // VercelRequest/Response are similar to Express, but req.body may need to be parsed
  // If req.body is undefined, parse it as JSON
  if (!req.body && req.method === 'POST') {
    try {
      req.body = JSON.parse(req.body || '{}');
    } catch {
      res.status(400).json({ success: false, error: 'Invalid JSON' });
      return;
    }
  }
  // Call the existing Express handler
  // @ts-ignore
  await handlePickupOrder(req, res);
}
