import Link from "next/link";
import { redirect } from "next/navigation";
import { Code, MessageSquare, Star, ThumbsUp, Award } from "lucide-react";

import { SessionSummary } from "@/features/auth/components/session-summary";
import { prisma } from "@/lib/prisma";
import { getAuthSession, isCurrentUserModerator } from "@/lib/session";

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
  variant?: "activity" | "progress";
};

function StatCard({ label, value, icon, variant = "activity" }: StatCardProps) {
  const Icon = STAT_ICONS[icon];
  const isProgress = variant === "progress";

  return (
    <div
      className={`app-card ${isProgress ? "border-l-4" : ""}`}
      style={
        isProgress
          ? {
              borderLeftColor:
                icon === "reputation"
                  ? "var(--success)"
                  : "var(--warning)",
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={
              isProgress
                ? "mt-1 text-4xl font-bold tracking-tight text-foreground"
                : "mt-2 text-3xl font-semibold tracking-tight text-foreground"
            }
          >
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-md ${
            isProgress
              ? icon === "reputation"
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning"
              : "bg-muted text-muted-foreground"
          }`}
        >
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

  const isModerator = await isCurrentUserModerator();

  const [
    userStats,
    votesGiven,
    votesReceivedAggregate,
    badgesCount,
    pendingReportsCount,
    totalReportsCount,
    pendingSnippets,
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
    isModerator
      ? prisma.report.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
    isModerator ? prisma.report.count() : Promise.resolve(0),
    prisma.snippet.findMany({
      where: {
        userId: { not: session.user.id },
        NOT: {
          reviews: {
            some: { reviewerId: session.user.id },
          },
        },
      },
      select: {
        id: true,
        code: true,
        language: true,
        isAnonymous: true,
        createdAt: true,
        user: { select: { name: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
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
          <Link className="btn-ghost" href="/leaderboard">
            Classement
          </Link>
          <Link className="btn-primary font-semibold" href="/snippets/new">
            + Nouveau snippet
          </Link>
        </div>
      </div>

      {pendingSnippets.length > 0 ? (
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="eyebrow">Reviews en attente</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                Snippets recents a reviewer
              </h2>
            </div>
            <Link className="btn-ghost text-sm" href="/snippets">
              Voir tous les snippets
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {pendingSnippets.map((snippet) => (
              <Link
                key={snippet.id}
                className="app-card app-card-hover group block"
                href={`/snippets/${snippet.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex w-fit rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                      {snippet.language}
                    </span>
                    <p className="line-clamp-1 max-w-md text-sm text-muted-foreground">
                      {snippet.code.split("\n")[0].slice(0, 100)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {snippet.isAnonymous
                          ? "Anonyme"
                          : (snippet.user.name ?? "Inconnu")}
                      </span>
                      <span aria-hidden="true">&middot;</span>
                      <time dateTime={snippet.createdAt.toISOString()}>
                        {snippet.createdAt.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>

                  <span className="btn-secondary shrink-0 text-xs">
                    Reviewer
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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
            variant="progress"
          />
          <StatCard icon="votes" label="Votes donnes" value={votesGiven} />
          <StatCard icon="votes" label="Votes recus" value={votesReceived} />
          <StatCard
            icon="badges"
            label="Badges"
            value={badgesCount}
            variant="progress"
          />
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

      {isModerator ? (
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
