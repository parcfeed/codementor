import { DIFFICULTIES, SORT_OPTIONS } from "@/lib/constants";

type BuildSnippetQueryParams = {
  search?: string;
  language?: string;
  difficulty?: string;
  sort?: string;
};

export type SnippetQueryConfig = {
  where: Record<string, unknown>;
  orderBy: { createdAt: "asc" | "desc" } | { reviews: { _count: "desc" } };
};

function isValidDifficulty(
  v: string | null | undefined,
): v is (typeof DIFFICULTIES)[number] {
  return v != null && (DIFFICULTIES as readonly string[]).includes(v);
}

function isValidSort(
  v: string | null | undefined,
): v is (typeof SORT_OPTIONS)[number] {
  return v != null && (SORT_OPTIONS as readonly string[]).includes(v);
}

export function buildSnippetQuery(
  params: BuildSnippetQueryParams,
): SnippetQueryConfig {
  const { search, language, difficulty, sort } = params;

  const where: Record<string, unknown> = {};

  if (language) {
    where.language = language;
  }

  if (isValidDifficulty(difficulty)) {
    where.difficulty = difficulty;
  }

  if (search) {
    where.code = {
      contains: search,
      mode: "insensitive",
    };
  }

  let orderBy: SnippetQueryConfig["orderBy"] = { createdAt: "desc" };

  if (isValidSort(sort)) {
    if (sort === "popular" || sort === "votes") {
      orderBy = { reviews: { _count: "desc" } };
    }
  }

  return { where, orderBy };
}
