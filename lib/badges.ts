import { prisma } from "@/lib/prisma";

type BadgeType = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

let cachedBadges: BadgeType[] | null = null;

async function getBadgeDefinitions() {
  if (cachedBadges) {
    return cachedBadges;
  }

  cachedBadges = await prisma.badge.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
    },
  });
  return cachedBadges;
}

export async function checkAndAwardBadges(userId: string) {
  const badgeDefs = await getBadgeDefinitions();

  const [user, existingBadges, upvotesReceived] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputationScore: true,
        _count: {
          select: { reviews: true },
        },
      },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    }),
    prisma.vote.count({
      where: {
        value: 1,
        review: {
          reviewerId: userId,
        },
      },
    }),
  ]);

  if (!user) {
    return [];
  }

  const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));

  const badgesToAward: string[] = [];

  for (const badge of badgeDefs) {
    if (existingBadgeIds.has(badge.id)) {
      continue;
    }

    let qualifies = false;

    switch (badge.name) {
      case "Premier Review":
        qualifies = user._count.reviews >= 1;
        break;
      case "Reviewer Actif":
        qualifies = user._count.reviews >= 10;
        break;
      case "Expert":
        qualifies = user.reputationScore >= 100;
        break;
      case "Top Reviewer":
        qualifies = user.reputationScore >= 250;
        break;
      case "Helpful Reviewer":
        qualifies = upvotesReceived >= 50;
        break;
    }

    if (qualifies) {
      badgesToAward.push(badge.id);
    }
  }

  if (badgesToAward.length > 0) {
    await prisma.userBadge.createMany({
      data: badgesToAward.map((badgeId) => ({
        userId,
        badgeId,
      })),
      skipDuplicates: true,
    });
  }

  const awardedBadges = badgeDefs.filter((b) => badgesToAward.includes(b.id));

  return awardedBadges.map((b) => ({
    name: b.name,
    description: b.description,
    icon: b.icon,
  }));
}
