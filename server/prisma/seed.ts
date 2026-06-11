import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPresets = [
  { name: "Green (Normal) Default", teaType: 0, temperature: 80, leafMass: 5, waterVolume: 200, steepCount: 3, tds: 150, altitude: 0, leafSize: 15, vesselType: 5, boilMethod: 0 },
  { name: "White Tea Default", teaType: 1, temperature: 80, leafMass: 5, waterVolume: 200, steepCount: 3, tds: 120, altitude: 0, leafSize: 15, vesselType: 5, boilMethod: 0 },
  { name: "Black Tea Default", teaType: 2, temperature: 95, leafMass: 5, waterVolume: 200, steepCount: 3, tds: 200, altitude: 0, leafSize: 15, vesselType: 0, boilMethod: 0 },
  { name: "Oolong Tea Default", teaType: 3, temperature: 90, leafMass: 7, waterVolume: 150, steepCount: 5, tds: 180, altitude: 0, leafSize: 18, vesselType: 6, boilMethod: 0 },
  { name: "Yellow Tea Default", teaType: 4, temperature: 82, leafMass: 5, waterVolume: 200, steepCount: 3, tds: 140, altitude: 0, leafSize: 15, vesselType: 5, boilMethod: 0 },
  { name: "Pu-erh Tea Default", teaType: 5, temperature: 98, leafMass: 8, waterVolume: 150, steepCount: 6, tds: 220, altitude: 0, leafSize: 20, vesselType: 1, boilMethod: 0 },
  { name: "Gyokuro Default", teaType: 6, temperature: 60, leafMass: 6, waterVolume: 100, steepCount: 3, tds: 100, altitude: 0, leafSize: 12, vesselType: 4, boilMethod: 0 },
  { name: "Sencha Default", teaType: 7, temperature: 75, leafMass: 5, waterVolume: 150, steepCount: 3, tds: 130, altitude: 0, leafSize: 14, vesselType: 4, boilMethod: 0 },
  { name: "Fukamushi Default", teaType: 8, temperature: 70, leafMass: 5, waterVolume: 150, steepCount: 3, tds: 130, altitude: 0, leafSize: 13, vesselType: 4, boilMethod: 0 },
  { name: "Tibetan Fermented Default", teaType: 9, temperature: 100, leafMass: 10, waterVolume: 300, steepCount: 5, tds: 250, altitude: 3000, leafSize: 20, vesselType: 0, boilMethod: 2 },
];

const badgeDefinitions = [
  { badgeId: "first_brew", icon: "🌱", nameKey: "badge.firstBrew.name", descKey: "badge.firstBrew.desc", category: "activity", condition: "brew_count >= 1", maxProgress: 1 },
  { badgeId: "ten_brews", icon: "🍵", nameKey: "badge.tenBrews.name", descKey: "badge.tenBrews.desc", category: "activity", condition: "brew_count >= 10", maxProgress: 10 },
  { badgeId: "hundred_brews", icon: "🫖", nameKey: "badge.hundredBrews.name", descKey: "badge.hundredBrews.desc", category: "activity", condition: "brew_count >= 100", maxProgress: 100 },
  { badgeId: "five_hundred_brews", icon: "⚡", nameKey: "badge.fiveHundredBrews.name", descKey: "badge.fiveHundredBrews.desc", category: "activity", condition: "brew_count >= 500", maxProgress: 500 },
  { badgeId: "world_traveler", icon: "🌍", nameKey: "badge.worldTraveler.name", descKey: "badge.worldTraveler.desc", category: "explorer", condition: "unique_tea_types >= 6", maxProgress: 6 },
  { badgeId: "temperature_curious", icon: "🌡️", nameKey: "badge.temperatureCurious.name", descKey: "badge.temperatureCurious.desc", category: "explorer", condition: "distinct_temps >= 5", maxProgress: 5 },
  { badgeId: "teaware_collector", icon: "🏺", nameKey: "badge.teawareCollector.name", descKey: "badge.teawareCollector.desc", category: "explorer", condition: "distinct_vessels >= 8", maxProgress: 8 },
  { badgeId: "japanese_specialist", icon: "🎌", nameKey: "badge.japaneseSpecialist.name", descKey: "badge.japaneseSpecialist.desc", category: "explorer", condition: "japanese_teas >= 3", maxProgress: 3 },
  { badgeId: "bullseye", icon: "🎯", nameKey: "badge.bullseye.name", descKey: "badge.bullseye.desc", category: "precision", condition: "exact_target_once", maxProgress: 1 },
  { badgeId: "consistent", icon: "⭐", nameKey: "badge.consistent.name", descKey: "badge.consistent.desc", category: "precision", condition: "five_star_count >= 10", maxProgress: 10 },
  { badgeId: "balanced", icon: "⚖️", nameKey: "badge.balanced.name", descKey: "badge.balanced.desc", category: "precision", condition: "optimal_balance_once", maxProgress: 1 },
  { badgeId: "week_warrior", icon: "🔥", nameKey: "badge.weekWarrior.name", descKey: "badge.weekWarrior.desc", category: "streak", condition: "streak_7_days", maxProgress: 7 },
  { badgeId: "month_master", icon: "🏆", nameKey: "badge.monthMaster.name", descKey: "badge.monthMaster.desc", category: "streak", condition: "streak_30_days", maxProgress: 30 },
  { badgeId: "zephyr", icon: "🍃", nameKey: "badge.zephyr.name", descKey: "badge.zephyr.desc", category: "archetype", condition: "dominant_zephyr", maxProgress: 1 },
  { badgeId: "golden_drift", icon: "🍯", nameKey: "badge.goldenDrift.name", descKey: "badge.goldenDrift.desc", category: "archetype", condition: "dominant_golden_drift", maxProgress: 1 },
  { badgeId: "obsidian", icon: "🍫", nameKey: "badge.obsidian.name", descKey: "badge.obsidian.desc", category: "archetype", condition: "dominant_obsidian", maxProgress: 1 },
  { badgeId: "blossom", icon: "🌸", nameKey: "badge.blossom.name", descKey: "badge.blossom.desc", category: "archetype", condition: "dominant_blossom", maxProgress: 1 },
  { badgeId: "nova", icon: "✨", nameKey: "badge.nova.name", descKey: "badge.nova.desc", category: "archetype", condition: "dominant_nova", maxProgress: 1 },
];

async function main() {
  for (const preset of defaultPresets) {
    await prisma.userPreset.upsert({
      where: { id: `default-${preset.teaType}` },
      create: { id: `default-${preset.teaType}`, ...preset, isDefault: true, userId: null },
      update: preset,
    });
  }

  for (const badge of badgeDefinitions) {
    await prisma.badgeDefinition.upsert({
      where: { badgeId: badge.badgeId },
      create: badge,
      update: badge,
    });
  }

  console.log("Seeded default presets and badge definitions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
