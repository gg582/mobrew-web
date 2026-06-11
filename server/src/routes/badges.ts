import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const progressSchema = z.object({
  progress: z.number().int().min(0),
});

router.get("/definitions", async (req, res, next) => {
  try {
    const defs = await prisma.badgeDefinition.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json({ items: defs });
  } catch (err) {
    next(err);
  }
});

router.get("/my-badges", authenticate, async (req, res, next) => {
  try {
    const badges = await prisma.userBadge.findMany({
      where: { userId: req.user!.id },
      include: { user: false },
      orderBy: { createdAt: "desc" },
    });
    const defs = await prisma.badgeDefinition.findMany();
    const map = new Map(defs.map((d) => [d.badgeId, d]));
    res.json({
      items: badges.map((b) => ({
        ...b,
        definition: map.get(b.badgeId) ?? null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/my-badges/:badgeId", authenticate, async (req, res, next) => {
  try {
    const body = progressSchema.parse(req.body);
    const def = await prisma.badgeDefinition.findUnique({
      where: { badgeId: String(req.params.badgeId) },
    });
    if (!def) {
      res.status(404).json({ error: "Badge definition not found" });
      return;
    }
    const progress = Math.min(body.progress, def.maxProgress);
    const earnedAt = progress >= def.maxProgress ? new Date() : undefined;
    const badge = await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId: req.user!.id,
          badgeId: def.badgeId,
        },
      },
      create: {
        userId: req.user!.id,
        badgeId: def.badgeId,
        progress,
        earnedAt,
      },
      update: {
        progress,
        ...(earnedAt ? { earnedAt } : {}),
      },
    });
    res.json(badge);
  } catch (err) {
    next(err);
  }
});

export default router;
