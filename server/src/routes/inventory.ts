import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, authenticateOptional } from "../middleware/auth.js";

const router = Router();

const itemSchema = z.object({
  name: z.string().min(1),
  teaType: z.number().int(),
  purchaseDate: z.string(),
  quantityGrams: z.number(),
  storageCondition: z.string().min(1),
  vendor: z.string().optional(),
  cost: z.number().optional(),
  lowStockThreshold: z.number().default(10),
});

const patchSchema = itemSchema.partial();

router.get("/", authenticateOptional, async (req, res, next) => {
  try {
    const where = req.user?.id ? { userId: req.user.id } : { userId: null };
    const items = await prisma.teaInventoryItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const body = itemSchema.parse(req.body);
    const item = await prisma.teaInventoryItem.create({
      data: { ...body, userId: req.user!.id },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const body = patchSchema.parse(req.body);
    const existing = await prisma.teaInventoryItem.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    const item = await prisma.teaInventoryItem.update({
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
    const existing = await prisma.teaInventoryItem.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    await prisma.teaInventoryItem.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
