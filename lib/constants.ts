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

export const REPUTATION = {
  MIN_REPUTATION_TO_VOTE: 50,
  VOTE_UP_REWARD: 10,
  VOTE_DOWN_PENALTY: 5,
  ACCEPTED_ANSWER_REWARD: 15,
  ANSWER_REWARD: 10,
  SNIPPET_REWARD: 5,
} as const;
