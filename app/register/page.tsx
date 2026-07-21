import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/register-form";
import { getAuthSession } from "@/lib/session";

export default async function RegisterPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
      <section className="app-card w-full max-w-md p-8">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p className="eyebrow">CodeMentor</p>
          <h1 className="text-3xl font-semibold text-foreground">
            Inscription
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Cree un compte pour rejoindre la plateforme.
          </p>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
}
