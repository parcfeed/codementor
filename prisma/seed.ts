import { prisma } from "../lib/prisma";

const BADGE_DEFINITIONS = [
  {
    name: "Premier Review",
    description: "Premiere review publiee",
    icon: "⭐",
  },
  {
    name: "Reviewer Actif",
    description: "10 reviews publiees",
    icon: "📝",
  },
  {
    name: "Expert",
    description: "Reputation >= 100",
    icon: "🏆",
  },
  {
    name: "Top Reviewer",
    description: "Reputation >= 250",
    icon: "👑",
  },
  {
    name: "Helpful Reviewer",
    description: "50 upvotes recus",
    icon: "💡",
  },
];

async function main() {
  console.log("Seeding badges...");
  for (const def of BADGE_DEFINITIONS) {
    const badge = await prisma.badge.upsert({
      where: { name: def.name },
      update: {
        description: def.description,
        icon: def.icon,
      },
      create: def,
    });
    console.log(`Badge upserted: ${badge.name}`);
  }
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
