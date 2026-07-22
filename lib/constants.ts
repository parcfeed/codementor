export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
] as const;

export type Language = (typeof LANGUAGES)[number]["value"];

export const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const SORT_OPTIONS = ["recent", "popular", "votes"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const;

// Systeme de reputation intentionnellement simple : +1/-1 par vote, sans seuil de participation.
// Les constantes declarees dans une version anterieure (VOTE_UP_REWARD=10, etc.) n'ont jamais
// ete utilisees et ont ete supprimees pour eviter la confusion. Si un bareme asymetrique est
// souhaite, re-introduire les constantes ici et les appliquer dans votes/route.ts.
