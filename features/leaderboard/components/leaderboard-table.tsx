import { cn } from "@/utils/cn";
import { Trophy } from "lucide-react";

type LeaderboardUser = {
  id: string;
  name: string;
  reputationScore: number;
  reviewCount: number;
  snippetCount: number;
  badges: { name: string; icon: string }[];
  position: number;
};

type LeaderboardTableProps = {
  users: LeaderboardUser[];
  currentUserId: string;
};

const PODIUM_STYLES: Record<number, string> = {
  1: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
  2: "border-slate-300 bg-muted",
  3: "border-orange-200 bg-orange-50 dark:bg-orange-950/20",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LeaderboardTable({
  users,
  currentUserId,
}: LeaderboardTableProps) {
  const podiumUsers = users.filter((user) => user.position <= 3);
  const otherUsers = users.filter((user) => user.position > 3);

  return (
    <div className="flex flex-col gap-5">
      {podiumUsers.length > 0 ? (
        <section
          aria-label="Podium des meilleurs reviewers"
          className="grid gap-3 md:grid-cols-3"
        >
          {podiumUsers.map((user) => {
            const isCurrentUser = user.id === currentUserId;

            return (
              <article
                key={user.id}
                className={cn(
                  "app-card text-center",
                  PODIUM_STYLES[user.position],
                  isCurrentUser && "ring-2 ring-ring",
                )}
              >
                <p className="text-sm font-semibold text-muted-foreground">
                  #{user.position}
                </p>
                <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                  {initials(user.name)}
                </div>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {user.name}
                </h3>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  {user.position === 1 && (
                    <Trophy className="h-4 w-4 text-amber-500" />
                  )}
                  {user.reputationScore} pts
                </p>
                {user.badges.length > 0 ? (
                  <div className="mt-3 flex justify-center gap-1">
                    {user.badges.map((badge) => (
                      <span
                        key={badge.name}
                        className="text-lg"
                        title={badge.name}
                      >
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      <section className="flex flex-col gap-2" aria-label="Classement complet">
        {otherUsers.map((user) => {
          const isCurrentUser = user.id === currentUserId;

          return (
            <article
              key={user.id}
              className={cn(
                "app-card app-card-hover",
                isCurrentUser && "border-primary bg-muted",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold text-muted-foreground">
                  {user.position}
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials(user.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {user.name}
                    </span>

                    {isCurrentUser ? (
                      <span className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Moi
                      </span>
                    ) : null}

                    {user.badges.length > 0 ? (
                      <span className="flex items-center gap-0.5 text-xs">
                        {user.badges.map((badge) => (
                          <span key={badge.name} title={badge.name}>
                            {badge.icon}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{user.reviewCount} reviews</span>
                    <span>{user.snippetCount} snippets</span>
                  </div>
                </div>

                <div className="shrink-0 rounded-md bg-muted px-3 py-2 text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {user.reputationScore}
                  </p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
