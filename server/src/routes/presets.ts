import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, authenticateOptional } from "../middleware/auth.js";

const router = Router();

const presetSchema = z.object({
  name: z.string().min(1),
  teaType: z.number().int(),
  temperature: z.number(),
  leafMass: z.number(),
  waterVolume: z.number(),
  steepCount: z.number().int(),
  tds: z.number(),
  altitude: z.number(),
  leafSize: z.number(),
  vesselType: z.number().int(),
  boilMethod: z.number().int(),
});

const patchSchema = presetSchema.partial();

router.get("/", authenticateOptional, async (req, res, next) => {
  try {
    const community = req.query.community === "1";
    const where: Record<string, unknown> = community
      ? { isCommunity: true }
      : {
          OR: [{ isDefault: true }, { userId: req.user?.id ?? null }],
        };
    const items = await prisma.userPreset.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const body = presetSchema.parse(req.body);
    const preset = await prisma.userPreset.create({
      data: { ...body, userId: req.user!.id },
    });
    res.status(201).json(preset);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const body = patchSchema.parse(req.body);
    const existing = await prisma.userPreset.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }
    const preset = await prisma.userPreset.update({
      where: { id: String(req.params.id) },
      data: body,
    });
    res.json(preset);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const existing = await prisma.userPreset.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }
    await prisma.userPreset.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
