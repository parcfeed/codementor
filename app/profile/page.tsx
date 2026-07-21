import { redirect } from "next/navigation";

import { BadgeDisplay } from "@/features/reputation/components/badge-display";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      reputationScore: true,
      createdAt: true,
      _count: {
        select: {
          snippets: true,
          reviews: true,
        },
      },
      badges: {
        include: {
          badge: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">CodeMentor</p>
            <h1 className="page-title">Profil</h1>
            <p className="page-description">
              Consulte ton activite et les badges deja obtenus.
            </p>
          </div>
        </div>

        <div className="app-card mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xl font-semibold text-foreground">
                {user.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <span className="text-xs text-muted-foreground">
                Membre depuis{" "}
                {user.createdAt.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="app-card text-center">
            <p className="text-2xl font-semibold text-foreground">
              {user.reputationScore}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Reputation</p>
          </div>

          <div className="app-card text-center">
            <p className="text-2xl font-semibold text-foreground">
              {user._count.snippets}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Snippets</p>
          </div>

          <div className="app-card text-center">
            <p className="text-2xl font-semibold text-foreground">
              {user._count.reviews}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Reviews</p>
          </div>
        </div>

        {user.badges.length > 0 ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Badges ({user.badges.length})
            </h2>
            <div className="flex flex-col gap-3">
              {user.badges.map((userBadge) => (
                <BadgeDisplay
                  key={userBadge.badge.id}
                  name={userBadge.badge.name}
                  description={userBadge.badge.description}
                  icon={userBadge.badge.icon}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="app-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun badge pour le moment.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
