import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const operationSchema = z.object({
  table: z.enum(["brewLog", "inventory", "preset", "curve", "setting"]),
  op: z.enum(["create", "update", "delete"]),
  id: z.string().optional(),
  data: z.record(z.unknown()).default({}),
});

const batchSchema = z.object({
  operations: z.array(operationSchema).max(500),
});

router.post("/batch", authenticate, async (req, res, next) => {
  try {
    const { operations } = batchSchema.parse(req.body);
    const userId = req.user!.id;
    const results: Array<{
      ok: boolean;
      id?: string;
      error?: string;
      data?: unknown;
    }> = [];

    for (const op of operations) {
      try {
        switch (op.table) {
          case "brewLog": {
            if (op.op === "create") {
              const created = await prisma.brewLog.create({
                data: {
                  userId,
                  teaName: String(op.data.teaName ?? ""),
                  teaType: Number(op.data.teaType ?? 0),
                  temperature: Number(op.data.temperature ?? 0),
                  steepTimeSec: Number(op.data.steepTimeSec ?? 0),
                  leafMass: Number(op.data.leafMass ?? 0),
                  waterVolume: Number(op.data.waterVolume ?? 0),
                  steepCount: Number(op.data.steepCount ?? 0),
                  tds: Number(op.data.tds ?? 0),
                  altitude: Number(op.data.altitude ?? 0),
                  leafSize: Number(op.data.leafSize ?? 0),
                  vesselType: Number(op.data.vesselType ?? 0),
                  boilMethod: Number(op.data.boilMethod ?? 0),
                  rating: Number(op.data.rating ?? 0),
                  notes: String(op.data.notes ?? ""),
                  catechin: Number(op.data.catechin ?? 0),
                  theanine: Number(op.data.theanine ?? 0),
                  caffeine: Number(op.data.caffeine ?? 0),
                  pectin: Number(op.data.pectin ?? 0),
                  polysaccharide: Number(op.data.polysaccharide ?? 0),
                  aroma: Number(op.data.aroma ?? 0),
                  clarityIndex: Number(op.data.clarityIndex ?? 0),
                  balanceScore: Number(op.data.balanceScore ?? 0),
                  extractionYield: Number(op.data.extractionYield ?? 0),
                  strength: String(op.data.strength ?? ""),
                  timestamp: op.data.timestamp
                    ? new Date(String(op.data.timestamp))
                    : new Date(),
                },
              });
              results.push({ ok: true, id: created.id, data: created });
            } else if (op.op === "update" && op.id) {
              const updated = await prisma.brewLog.updateMany({
                where: { id: op.id, userId },
                data: op.data,
              });
              results.push({ ok: updated.count > 0, id: op.id });
            } else if (op.op === "delete" && op.id) {
              const deleted = await prisma.brewLog.deleteMany({
                where: { id: op.id, userId },
              });
              results.push({ ok: deleted.count > 0, id: op.id });
            } else {
              results.push({ ok: false, error: "Invalid operation" });
            }
            break;
          }
          case "inventory": {
            if (op.op === "create") {
              const created = await prisma.teaInventoryItem.create({
                data: {
                  userId,
                  name: String(op.data.name ?? ""),
                  teaType: Number(op.data.teaType ?? 0),
                  purchaseDate: String(op.data.purchaseDate ?? ""),
                  quantityGrams: Number(op.data.quantityGrams ?? 0),
                  storageCondition: String(op.data.storageCondition ?? ""),
                  vendor: op.data.vendor ? String(op.data.vendor) : null,
                  cost: op.data.cost ? Number(op.data.cost) : null,
                  lowStockThreshold: Number(op.data.lowStockThreshold ?? 10),
                },
              });
              results.push({ ok: true, id: created.id, data: created });
            } else if (op.op === "update" && op.id) {
              const updated = await prisma.teaInventoryItem.updateMany({
                where: { id: op.id, userId },
                data: op.data,
              });
              results.push({ ok: updated.count > 0, id: op.id });
            } else if (op.op === "delete" && op.id) {
              const deleted = await prisma.teaInventoryItem.deleteMany({
                where: { id: op.id, userId },
              });
              results.push({ ok: deleted.count > 0, id: op.id });
            } else {
              results.push({ ok: false, error: "Invalid operation" });
            }
            break;
          }
          case "preset": {
            if (op.op === "create") {
              const created = await prisma.userPreset.create({
                data: {
                  userId,
                  name: String(op.data.name ?? ""),
                  teaType: Number(op.data.teaType ?? 0),
                  temperature: Number(op.data.temperature ?? 0),
                  leafMass: Number(op.data.leafMass ?? 0),
                  waterVolume: Number(op.data.waterVolume ?? 0),
                  steepCount: Number(op.data.steepCount ?? 0),
                  tds: Number(op.data.tds ?? 0),
                  altitude: Number(op.data.altitude ?? 0),
                  leafSize: Number(op.data.leafSize ?? 0),
                  vesselType: Number(op.data.vesselType ?? 0),
                  boilMethod: Number(op.data.boilMethod ?? 0),
                },
              });
              results.push({ ok: true, id: created.id, data: created });
            } else if (op.op === "update" && op.id) {
              const updated = await prisma.userPreset.updateMany({
                where: { id: op.id, userId },
                data: op.data,
              });
              results.push({ ok: updated.count > 0, id: op.id });
            } else if (op.op === "delete" && op.id) {
              const deleted = await prisma.userPreset.deleteMany({
                where: { id: op.id, userId },
              });
              results.push({ ok: deleted.count > 0, id: op.id });
            } else {
              results.push({ ok: false, error: "Invalid operation" });
            }
            break;
          }
          case "curve": {
            if (op.op === "create") {
              const created = await prisma.customCurve.create({
                data: {
                  userId,
                  name: String(op.data.name ?? ""),
                  teaType: Number(op.data.teaType ?? 0),
                  phases: String(op.data.phases ?? "[]"),
                },
              });
              results.push({ ok: true, id: created.id, data: created });
            } else if (op.op === "update" && op.id) {
              const updated = await prisma.customCurve.updateMany({
                where: { id: op.id, userId },
                data: op.data,
              });
              results.push({ ok: updated.count > 0, id: op.id });
            } else if (op.op === "delete" && op.id) {
              const deleted = await prisma.customCurve.deleteMany({
                where: { id: op.id, userId },
              });
              results.push({ ok: deleted.count > 0, id: op.id });
            } else {
              results.push({ ok: false, error: "Invalid operation" });
            }
            break;
          }
          case "setting": {
            if (op.op === "update" || op.op === "create") {
              const upserted = await prisma.userSetting.upsert({
                where: { userId },
                create: { userId, ...(op.data as Record<string, unknown>) },
                update: op.data as Record<string, unknown>,
              });
              results.push({ ok: true, id: upserted.id, data: upserted });
            } else {
              results.push({ ok: false, error: "Invalid operation" });
            }
            break;
          }
          default:
            results.push({ ok: false, error: "Unknown table" });
        }
      } catch (inner: unknown) {
        const msg = inner instanceof Error ? inner.message : String(inner);
        results.push({ ok: false, error: msg });
      }
    }

    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;
