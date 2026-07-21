import Link from "next/link";
import { redirect } from "next/navigation";
import { Code, MessageSquare, Star, ThumbsUp, Award } from "lucide-react";

import { SessionSummary } from "@/features/auth/components/session-summary";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

const STAT_ICONS = {
  snippets: Code,
  reviews: MessageSquare,
  reputation: Star,
  votes: ThumbsUp,
  badges: Award,
} as const;

type StatCardProps = {
  label: string;
  value: number;
  icon: keyof typeof STAT_ICONS;
};

function StatCard({ label, value, icon }: StatCardProps) {
  const Icon = STAT_ICONS[icon];

  return (
    <div className="app-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const [
    userStats,
    votesGiven,
    votesReceivedAggregate,
    badgesCount,
    pendingReportsCount,
    totalReportsCount,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        reputationScore: true,
        _count: {
          select: {
            snippets: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.vote.count({
      where: { userId: session.user.id },
    }),
    prisma.vote.aggregate({
      _sum: { value: true },
      where: {
        review: {
          reviewerId: session.user.id,
        },
      },
    }),
    prisma.userBadge.count({
      where: { userId: session.user.id },
    }),
    session.user.isModerator
      ? prisma.report.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
    session.user.isModerator ? prisma.report.count() : Promise.resolve(0),
  ]);

  const votesReceived = votesReceivedAggregate._sum.value ?? 0;

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="page-title">Vue d&apos;ensemble</h1>
          <p className="page-description">
            Suis ton activite, tes contributions et les signaux importants de
            ton espace CodeMentor.
          </p>
        </div>

        <div className="flex gap-2">
          <Link className="btn-secondary" href="/leaderboard">
            Classement
          </Link>
          <Link className="btn-primary" href="/snippets/new">
            Nouveau snippet
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon="snippets"
            label="Snippets"
            value={userStats?._count.snippets ?? 0}
          />
          <StatCard
            icon="reviews"
            label="Reviews"
            value={userStats?._count.reviews ?? 0}
          />
          <StatCard
            icon="reputation"
            label="Reputation"
            value={userStats?.reputationScore ?? 0}
          />
          <StatCard icon="votes" label="Votes donnes" value={votesGiven} />
          <StatCard icon="votes" label="Votes recus" value={votesReceived} />
          <StatCard icon="badges" label="Badges" value={badgesCount} />
        </section>

        <aside className="app-card h-fit">
          <div className="mb-5">
            <p className="eyebrow">Session</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              Compte actif
            </h2>
          </div>
          <SessionSummary />
        </aside>
      </div>

      {session.user.isModerator ? (
        <section className="app-card mt-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Moderation</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                Signalements
              </h2>
            </div>
            <Link className="btn-secondary" href="/moderation">
              Gerer les signalements
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              icon="reviews"
              label="Reviews signalees"
              value={totalReportsCount}
            />
            <StatCard
              icon="badges"
              label="En attente"
              value={pendingReportsCount}
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
