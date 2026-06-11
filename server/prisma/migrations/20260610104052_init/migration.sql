-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BrewLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teaName" TEXT NOT NULL,
    "teaType" INTEGER NOT NULL,
    "temperature" REAL NOT NULL,
    "steepTimeSec" REAL NOT NULL,
    "leafMass" REAL NOT NULL,
    "waterVolume" REAL NOT NULL,
    "steepCount" INTEGER NOT NULL,
    "tds" REAL NOT NULL,
    "altitude" REAL NOT NULL,
    "leafSize" REAL NOT NULL,
    "vesselType" INTEGER NOT NULL,
    "boilMethod" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "catechin" REAL NOT NULL,
    "theanine" REAL NOT NULL,
    "caffeine" REAL NOT NULL,
    "pectin" REAL NOT NULL,
    "polysaccharide" REAL NOT NULL,
    "aroma" REAL NOT NULL,
    "clarityIndex" REAL NOT NULL,
    "balanceScore" REAL NOT NULL,
    "extractionYield" REAL NOT NULL,
    "strength" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BrewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeaInventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "teaType" INTEGER NOT NULL,
    "purchaseDate" TEXT NOT NULL,
    "quantityGrams" REAL NOT NULL,
    "storageCondition" TEXT NOT NULL,
    "vendor" TEXT,
    "cost" REAL,
    "lowStockThreshold" REAL NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeaInventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "teaType" INTEGER NOT NULL,
    "temperature" REAL NOT NULL,
    "leafMass" REAL NOT NULL,
    "waterVolume" REAL NOT NULL,
    "steepCount" INTEGER NOT NULL,
    "tds" REAL NOT NULL,
    "altitude" REAL NOT NULL,
    "leafSize" REAL NOT NULL,
    "vesselType" INTEGER NOT NULL,
    "boilMethod" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isCommunity" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomCurve" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "teaType" INTEGER NOT NULL,
    "phases" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomCurve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BadgeDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "badgeId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "descKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "maxProgress" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" DATETIME,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timerChime" TEXT NOT NULL DEFAULT 'chime1',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "lowStockThreshold" REAL NOT NULL DEFAULT 10,
    CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "presetId" TEXT NOT NULL,
    "archetypeBadgeId" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityRecipe_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "UserPreset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "CommunityRecipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "BrewLog_userId_timestamp_idx" ON "BrewLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "TeaInventoryItem_userId_idx" ON "TeaInventoryItem"("userId");

-- CreateIndex
CREATE INDEX "UserPreset_userId_idx" ON "UserPreset"("userId");

-- CreateIndex
CREATE INDEX "CustomCurve_userId_idx" ON "CustomCurve"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BadgeDefinition_badgeId_key" ON "BadgeDefinition"("badgeId");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityRecipe_presetId_key" ON "CommunityRecipe"("presetId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_recipeId_key" ON "Vote"("userId", "recipeId");
