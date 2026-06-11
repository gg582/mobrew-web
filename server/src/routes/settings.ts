import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const settingsSchema = z.object({
  language: z.string().min(1).optional(),
  timerChime: z.string().min(1).optional(),
  notifications: z.boolean().optional(),
  lowStockThreshold: z.number().optional(),
});

router.get("/", authenticate, async (req, res, next) => {
  try {
    const settings = await prisma.userSetting.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id },
      update: {},
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

router.patch("/", authenticate, async (req, res, next) => {
  try {
    const body = settingsSchema.parse(req.body);
    const settings = await prisma.userSetting.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id, ...body },
      update: body,
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export default router;
