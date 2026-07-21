import { redirect } from "next/navigation";

import { CreateSnippetForm } from "@/features/snippets/components/create-snippet-form";
import { getAuthSession } from "@/lib/session";

export default async function NewSnippetPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">CodeMentor</p>
            <h1 className="page-title">Nouveau snippet</h1>
            <p className="page-description">
              Soumets ton code pour obtenir des reviews.
            </p>
          </div>
        </div>

        <div className="app-card p-6 sm:p-8">
          <CreateSnippetForm />
        </div>
      </div>
    </main>
  );
}
