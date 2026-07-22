"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { DIFFICULTIES } from "@/lib/constants";
import { LANGUAGES } from "@/features/snippets/constants";

export function SnippetFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [language, setLanguage] = useState(searchParams.get("language") ?? "");
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") ?? "",
  );
  const [sort, setSort] = useState(searchParams.get("sort") ?? "recent");

  function applyFilters() {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (language) params.set("language", language);
    if (difficulty) params.set("difficulty", difficulty);
    if (sort && sort !== "recent") params.set("sort", sort);
    params.set("page", "1");

    router.push(`/snippets?${params.toString()}`);
    router.refresh();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      applyFilters();
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_160px_160px_160px_auto] md:items-end">
      <Field label="Rechercher" htmlFor="search">
        {({ id, className }) => (
          <input
            className={className}
            id={id}
            type="text"
            placeholder="Rechercher dans le code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}
      </Field>

      <Field label="Langage" htmlFor="language">
        {({ id, className }) => (
          <select
            className={className}
            id={id}
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
            }}
          >
            <option value="">Tous</option>
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Difficulte" htmlFor="difficulty">
        {({ id, className }) => (
          <select
            className={className}
            id={id}
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value);
            }}
          >
            <option value="">Toutes</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d === "BEGINNER"
                  ? "Debutant"
                  : d === "INTERMEDIATE"
                    ? "Intermediaire"
                    : "Avance"}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Trier par" htmlFor="sort">
        {({ id, className }) => (
          <select
            className={className}
            id={id}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
            }}
          >
            <option value="recent">Plus recents</option>
            <option value="popular">Populaires</option>
            <option value="votes">Les plus votes</option>
          </select>
        )}
      </Field>

      <Button
        aria-label="Appliquer les filtres de recherche"
        type="button"
        onClick={applyFilters}
      >
        Filtrer
      </Button>
    </div>
  );
}
