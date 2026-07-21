"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { registerSchema } from "@/features/auth/schemas";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const parsedValues = registerSchema.safeParse({ name, email, password });

    if (!parsedValues.success) {
      const fieldErrors = parsedValues.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedValues.data),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setIsSubmitting(false);
      setFormError(payload?.message ?? "Impossible de creer le compte.");
      return;
    }

    const result = await signIn("credentials", {
      email: parsedValues.data.email,
      password: parsedValues.data.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push(result?.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <Field label="Nom" htmlFor="name" error={errors.name}>
        {({ id, describedBy, className }) => (
          <input
            aria-describedby={describedBy}
            className={className}
            id={id}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        )}
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email}>
        {({ id, describedBy, className }) => (
          <input
            aria-describedby={describedBy}
            className={className}
            id={id}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Field label="Mot de passe" htmlFor="password" error={errors.password}>
        {({ id, describedBy, className }) => (
          <input
            aria-describedby={describedBy}
            className={className}
            id={id}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>

      {formError ? <p className="alert-error">{formError}</p> : null}

      <Button
        aria-label="Creer le compte"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creation..." : "Creer le compte"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Deja inscrit ?{" "}
        <Link className="font-medium text-foreground underline" href="/login">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
