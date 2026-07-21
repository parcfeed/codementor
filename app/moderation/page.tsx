import { redirect } from "next/navigation";

import { ModerationContent } from "@/features/moderation/components/moderation-content";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireModerator } from "@/lib/session";

export default async function ModerationPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const isMod = await requireModerator();
  if (!isMod) {
    redirect("/forbidden");
  }

  const reports = await prisma.report.findMany({
    include: {
      reporter: {
        select: { id: true, name: true },
      },
      review: {
        select: {
          id: true,
          rating: true,
          reviewer: {
            select: { id: true, name: true },
          },
          snippet: {
            select: { id: true, language: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">CodeMentor</p>
            <h1 className="page-title">Moderation</h1>
            <p className="page-description">
              Gerer les signalements de reviews non constructives.
            </p>
          </div>
        </div>

        <ModerationContent reports={reports} />
      </div>
    </main>
  );
}
