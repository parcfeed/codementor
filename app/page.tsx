import Link from "next/link";
import { Code, MessageSquare, TrendingUp } from "lucide-react";

import { getAuthSession } from "@/lib/session";

export default async function Home() {
  const session = await getAuthSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          CodeMentor
        </p>

        <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
          Plateforme de review de code
        </h1>

        <p className="max-w-lg text-base leading-7 text-muted-foreground">
          CodeMentor permet aux etudiants de partager leur code, de recevoir des
          retours constructifs et d&apos;ameliorer leurs competences en
          programmation grace a des reviews par les pairs.
        </p>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link className="btn-primary h-11" href="/snippets">
              Voir les snippets
            </Link>
            <Link className="btn-secondary h-11" href="/dashboard">
              Mon tableau de bord
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link className="btn-primary h-11" href="/register">
              Creer un compte
            </Link>
            <Link className="btn-secondary h-11" href="/login">
              Se connecter
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
          <div className="app-card">
            <Code className="mb-2 h-5 w-5 text-muted-foreground" />
            <h3 className="mb-1 font-medium text-foreground">Partage</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Soumets tes snippets de code dans differents langages de
              programmation.
            </p>
          </div>

          <div className="app-card">
            <MessageSquare className="mb-2 h-5 w-5 text-muted-foreground" />
            <h3 className="mb-1 font-medium text-foreground">Review</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Recois des retours ligne par ligne et ameliore la qualite de ton
              code.
            </p>
          </div>

          <div className="app-card">
            <TrendingUp className="mb-2 h-5 w-5 text-muted-foreground" />
            <h3 className="mb-1 font-medium text-foreground">Progression</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Gagne en reputation, debloque des badges et suis ta progression.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
