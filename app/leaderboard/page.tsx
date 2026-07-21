import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LeaderboardTable } from "@/features/leaderboard/components/leaderboard-table";
import { Pagination } from "@/features/snippets/components/pagination";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

const USERS_PER_PAGE = 10;

type LeaderboardPageProps = {
  searchParams: { page?: string };
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const page = Math.max(1, Number(searchParams.page) || 1);
  const skip = (page - 1) * USERS_PER_PAGE;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        reputationScore: true,
        _count: {
          select: {
            reviews: true,
            snippets: true,
          },
        },
        badges: {
          select: {
            badge: {
              select: {
                name: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: {
        reputationScore: "desc",
      },
      skip,
      take: USERS_PER_PAGE,
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  const usersWithPosition = users.map((user, index) => ({
    id: user.id,
    name: user.name,
    reputationScore: user.reputationScore,
    reviewCount: user._count.reviews,
    snippetCount: user._count.snippets,
    badges: user.badges.map((ub) => ({
      name: ub.badge.name,
      icon: ub.badge.icon,
    })),
    position: skip + index + 1,
  }));

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">CodeMentor</p>
            <h1 className="page-title">Classement</h1>
            <p className="page-description">Top reviewers par reputation.</p>
          </div>
        </div>

        {totalCount > 0 ? (
          <>
            <LeaderboardTable
              users={usersWithPosition}
              currentUserId={session.user.id}
            />

            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/leaderboard"
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="Aucun utilisateur"
            description="Le classement est vide pour le moment."
          />
        )}
      </div>
    </main>
  );
}
