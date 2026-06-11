import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const curveSchema = z.object({
  name: z.string().min(1),
  teaType: z.number().int(),
  phases: z.string().refine((v) => {
    try {
      JSON.parse(v);
      return true;
    } catch {
      return false;
    }
  }, "phases must be a valid JSON string"),
});

const patchSchema = curveSchema.partial();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const items = await prisma.customCurve.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const body = curveSchema.parse(req.body);
    const item = await prisma.customCurve.create({
      data: { ...body, userId: req.user!.id },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const item = await prisma.customCurve.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!item) {
      res.status(404).json({ error: "Curve not found" });
      return;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const body = patchSchema.parse(req.body);
    const existing = await prisma.customCurve.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Curve not found" });
      return;
    }
    const item = await prisma.customCurve.update({
      where: { id: String(req.params.id) },
      data: body,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const existing = await prisma.customCurve.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Curve not found" });
      return;
    }
    await prisma.customCurve.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
