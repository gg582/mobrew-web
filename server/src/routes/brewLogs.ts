import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticateOptional } from "../middleware/auth.js";

const router = Router();

const querySchema = z.object({
  teaType: z.coerce.number().int().optional(),
  ratingFrom: z.coerce.number().int().optional(),
  ratingTo: z.coerce.number().int().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const createSchema = z.object({
  timestamp: z.coerce.date().optional(),
  teaName: z.string().min(1),
  teaType: z.number().int(),
  temperature: z.number(),
  steepTimeSec: z.number(),
  leafMass: z.number(),
  waterVolume: z.number(),
  steepCount: z.number().int(),
  tds: z.number(),
  altitude: z.number(),
  leafSize: z.number(),
  vesselType: z.number().int(),
  boilMethod: z.number().int(),
  rating: z.number().int(),
  notes: z.string().default(""),
  catechin: z.number().default(0),
  theanine: z.number().default(0),
  caffeine: z.number().default(0),
  pectin: z.number().default(0),
  polysaccharide: z.number().default(0),
  aroma: z.number().default(0),
  clarityIndex: z.number().default(0),
  balanceScore: z.number().default(0),
  extractionYield: z.number().default(0),
  strength: z.string().default(""),
});

function toBrewLogJson(log: {
  id: string;
  timestamp: Date;
  teaName: string;
  teaType: number;
  temperature: number;
  steepTimeSec: number;
  leafMass: number;
  waterVolume: number;
  steepCount: number;
  tds: number;
  altitude: number;
  leafSize: number;
  vesselType: number;
  boilMethod: number;
  rating: number;
  notes: string;
  catechin: number;
  theanine: number;
  caffeine: number;
  pectin: number;
  polysaccharide: number;
  aroma: number;
  clarityIndex: number;
  balanceScore: number;
  extractionYield: number;
  strength: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...log,
    timestamp: log.timestamp.toISOString(),
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  };
}

router.get("/", authenticateOptional, async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);
    const where: Record<string, unknown> = {};
    if (req.user?.id) {
      where.userId = req.user.id;
    }
    if (q.teaType !== undefined) where.teaType = q.teaType;
    if (q.ratingFrom !== undefined || q.ratingTo !== undefined) {
      where.rating = {};
      if (q.ratingFrom !== undefined) (where.rating as Record<string, number>).gte = q.ratingFrom;
      if (q.ratingTo !== undefined) (where.rating as Record<string, number>).lte = q.ratingTo;
    }
    if (q.from || q.to) {
      where.timestamp = {};
      if (q.from) (where.timestamp as Record<string, Date>).gte = q.from;
      if (q.to) (where.timestamp as Record<string, Date>).lte = q.to;
    }
    if (q.search) {
      where.teaName = { contains: q.search, mode: "insensitive" };
    }

    const [items, count] = await Promise.all([
      prisma.brewLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: q.limit,
        skip: q.offset,
      }),
      prisma.brewLog.count({ where }),
    ]);
    res.json({ items: items.map(toBrewLogJson), count });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticateOptional, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const log = await prisma.brewLog.create({
      data: {
        ...body,
        userId: req.user?.id ?? null,
        timestamp: body.timestamp ?? new Date(),
      },
    });
    res.status(201).json(toBrewLogJson(log));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticateOptional, async (req, res, next) => {
  try {
    const log = await prisma.brewLog.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!log) {
      res.status(404).json({ error: "Brew log not found" });
      return;
    }
    if (log.userId && log.userId !== req.user?.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(toBrewLogJson(log));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticateOptional, async (req, res, next) => {
  try {
    const existing = await prisma.brewLog.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!existing) {
      res.status(404).json({ error: "Brew log not found" });
      return;
    }
    if (existing.userId && existing.userId !== req.user?.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await prisma.brewLog.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
