import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, authenticateOptional } from "../middleware/auth.js";

const router = Router();

const publishSchema = z.object({
  presetId: z.string().uuid(),
  archetypeBadgeId: z.string().min(1),
});

router.get("/recipes", authenticateOptional, async (req, res, next) => {
  try {
    const sort = req.query.sort as string | undefined;
    const search = (req.query.search as string | undefined) ?? "";
    const teaTypeRaw = req.query.teaType;
    const teaType = teaTypeRaw !== undefined ? Number(teaTypeRaw) : undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.preset = { name: { contains: search, mode: "insensitive" } };
    }
    if (teaType !== undefined && !Number.isNaN(teaType)) {
      if (!where.preset) where.preset = {};
      (where.preset as Record<string, unknown>).teaType = teaType;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "upvoted") orderBy = { upvotes: "desc" };
    else if (sort === "recent") orderBy = { createdAt: "desc" };
    else if (sort === "type") {
      orderBy = { preset: { teaType: "asc" } } as unknown as Record<string, string>;
    }

    const recipes = await prisma.communityRecipe.findMany({
      where,
      include: { preset: true },
      orderBy,
    });
    res.json({ items: recipes });
  } catch (err) {
    next(err);
  }
});

router.post("/recipes/:id/upvote", authenticate, async (req, res, next) => {
  try {
    const recipe = await prisma.communityRecipe.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_recipeId: { userId: req.user!.id, recipeId: String(req.params.id) },
      },
    });

    if (existingVote) {
      await prisma.$transaction([
        prisma.vote.delete({ where: { id: existingVote.id } }),
        prisma.communityRecipe.update({
          where: { id: String(req.params.id) },
          data: { upvotes: { decrement: 1 } },
        }),
        prisma.userPreset.update({
          where: { id: recipe.presetId },
          data: { upvotes: { decrement: 1 } },
        }),
      ]);
      res.json({ upvoted: false });
      return;
    }

    await prisma.$transaction([
      prisma.vote.create({
        data: { userId: req.user!.id, recipeId: String(req.params.id) },
      }),
      prisma.communityRecipe.update({
        where: { id: String(req.params.id) },
        data: { upvotes: { increment: 1 } },
      }),
      prisma.userPreset.update({
        where: { id: recipe.presetId },
        data: { upvotes: { increment: 1 } },
      }),
    ]);
    res.json({ upvoted: true });
  } catch (err) {
    next(err);
  }
});

router.post("/recipes", authenticate, async (req, res, next) => {
  try {
    const body = publishSchema.parse(req.body);
    const preset = await prisma.userPreset.findFirst({
      where: { id: body.presetId, userId: req.user!.id },
    });
    if (!preset) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }
    if (preset.isCommunity) {
      res.status(409).json({ error: "Preset is already published" });
      return;
    }
    const recipe = await prisma.$transaction(async (tx) => {
      await tx.userPreset.update({
        where: { id: preset.id },
        data: { isCommunity: true },
      });
      return tx.communityRecipe.create({
        data: {
          presetId: preset.id,
          archetypeBadgeId: body.archetypeBadgeId,
        },
        include: { preset: true },
      });
    });
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
});

export default router;
