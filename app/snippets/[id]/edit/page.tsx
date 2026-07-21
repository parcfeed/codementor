import { notFound, redirect } from "next/navigation";

import { EditSnippetForm } from "@/features/snippets/components/edit-snippet-form";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";

type EditSnippetPageProps = {
  params: { id: string };
};

export default async function EditSnippetPage({
  params,
}: EditSnippetPageProps) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      code: true,
      language: true,
      isAnonymous: true,
      userId: true,
    },
  });

  if (!snippet) {
    notFound();
  }

  if (snippet.userId !== session.user.id) {
    redirect(`/snippets/${params.id}`);
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">CodeMentor</p>
            <h1 className="page-title">Modifier le snippet</h1>
            <p className="page-description">Modifie le code soumis.</p>
          </div>
        </div>

        <div className="app-card p-6 sm:p-8">
          <EditSnippetForm
            snippetId={snippet.id}
            initialCode={snippet.code}
            initialLanguage={snippet.language}
            initialIsAnonymous={snippet.isAnonymous}
          />
        </div>
      </div>
    </main>
  );
}
