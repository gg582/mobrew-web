import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import brewLogRoutes from "./routes/brewLogs.js";
import inventoryRoutes from "./routes/inventory.js";
import presetRoutes from "./routes/presets.js";
import curveRoutes from "./routes/curves.js";
import badgeRoutes from "./routes/badges.js";
import settingRoutes from "./routes/settings.js";
import communityRoutes from "./routes/community.js";
import syncRoutes from "./routes/sync.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/brew-logs", brewLogRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/presets", presetRoutes);
app.use("/api/curves", curveRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/sync", syncRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err && typeof err === "object" && "issues" in err) {
      res.status(400).json({
        error: "Validation failed",
        issues: (err as { issues: unknown[] }).issues,
      });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

export default app;
