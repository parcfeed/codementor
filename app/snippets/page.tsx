import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/features/snippets/components/pagination";
import { SnippetCard } from "@/features/snippets/components/snippet-card";
import { SnippetFilters } from "@/features/snippets/components/snippet-filters";
import { SNIPPETS_PER_PAGE } from "@/features/snippets/constants";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import { buildSnippetQuery } from "@/lib/snippets-query";

type SnippetsPageProps = {
  searchParams: {
    page?: string;
    search?: string;
    language?: string;
    difficulty?: string;
    sort?: string;
  };
};

export default async function SnippetsPage({
  searchParams,
}: SnippetsPageProps) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const page = Math.max(1, Number(searchParams.page) || 1);
  const skip = (page - 1) * SNIPPETS_PER_PAGE;

  const { where, orderBy } = buildSnippetQuery({
    search: searchParams.search,
    language: searchParams.language,
    difficulty: searchParams.difficulty,
    sort: searchParams.sort,
  });

  const [snippets, totalCount] = await Promise.all([
    prisma.snippet.findMany({
      where,
      select: {
        id: true,
        language: true,
        isAnonymous: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy,
      skip,
      take: SNIPPETS_PER_PAGE,
    }),
    prisma.snippet.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / SNIPPETS_PER_PAGE);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">CodeMentor</p>
            <h1 className="page-title">Snippets</h1>
            <p className="page-description">
              Consulte les snippets soumis par la communaute.
            </p>
          </div>

          <Link className="btn-primary" href="/snippets/new">
            Nouveau snippet
          </Link>
        </div>

        <div className="app-card mb-6">
          <SnippetFilters />
        </div>

        {snippets.length === 0 ? (
          <EmptyState
            title="Aucun snippet pour le moment"
            description="Soumets le premier extrait de code pour lancer les reviews."
            action={
              <Link className="btn-primary" href="/snippets/new">
                Creer le premier snippet
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                id={snippet.id}
                language={snippet.language}
                authorName={snippet.user.name}
                isAnonymous={snippet.isAnonymous}
                createdAt={snippet.createdAt}
                reviewCount={snippet._count.reviews}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/snippets"
            search={searchParams.search || undefined}
            language={searchParams.language || undefined}
            difficulty={searchParams.difficulty || undefined}
            sort={
              searchParams.sort !== "recent" ? searchParams.sort : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
