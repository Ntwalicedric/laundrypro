import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handlePickupOrder } from "./routes/order";

export function createServer() {
  const app = express();

  // Middleware
  const corsOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:8080,http://127.0.0.1:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          // Allow same-origin or non-browser requests
          return callback(null, true);
        }

        if (corsOrigins.includes(origin)) {
          return callback(null, true);
        }

        callback(null, false);
      },
    }),
  );

  const jsonLimit = process.env.JSON_BODY_LIMIT ?? "1mb";
  const urlEncodedLimit = process.env.URLENCODED_BODY_LIMIT ?? "1mb";

  app.use(express.json({ limit: jsonLimit }));
  app.use(express.urlencoded({ extended: true, limit: urlEncodedLimit }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Order management routes
  app.post("/api/orders/pickup", handlePickupOrder);

  return app;
}
