import { prisma } from "../lib/prisma";

const BADGE_DEFINITIONS = [
  {
    slug: "premier-review",
    name: "Premier Review",
    description: "Premiere review publiee",
    icon: "⭐",
  },
  {
    slug: "reviewer-actif",
    name: "Reviewer Actif",
    description: "10 reviews publiees",
    icon: "📝",
  },
  {
    slug: "expert",
    name: "Expert",
    description: "Reputation >= 100",
    icon: "🏆",
  },
  {
    slug: "top-reviewer",
    name: "Top Reviewer",
    description: "Reputation >= 250",
    icon: "👑",
  },
  {
    slug: "helpful-reviewer",
    name: "Helpful Reviewer",
    description: "50 upvotes recus",
    icon: "💡",
  },
];

async function main() {
  console.log("Seeding badges...");
  for (const def of BADGE_DEFINITIONS) {
    const badge = await prisma.badge.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
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
