# Audit Backend — CodeMentor

## 1. Architecture Générale

### Stack technique

| Technologie | Rôle                              | Version                    |
| ----------- | --------------------------------- | -------------------------- |
| Next.js 14  | Framework full-stack (App Router) | 14.2.35                    |
| TypeScript  | Typage statique (strict mode)     | ^5                         |
| Prisma ORM  | Accès base de données             | ^7.8.0                     |
| PostgreSQL  | Base de données relationnelle     | 16 (Alpine)                |
| NextAuth.js | Authentification (Credentials)    | ^4.24.14                   |
| Zod         | Validation de données             | ^4.4.3                     |
| bcryptjs    | Hash de mots de passe             | ^3.0.3                     |
| Vitest      | Tests unitaires                   | ^4.1.10                    |
| Docker      | Conteneurisation                  | Multi-stage Node 20 Alpine |

### Structure du projet

```
lib/                  ← couche utilitaire transverse
  errors.ts            classe d'erreur + mapping Prisma
  api-handler.ts       wrappers de route (3 niveaux)
  auth.ts              config NextAuth
  session.ts           helpers de session serveur
  prisma.ts            client Prisma singleton (adapter-pg)
  logger.ts            logger structuré avec masquage PII
  validation.ts        champs Zod réutilisables
  constants.ts         constantes centralisées
  env.ts               validation d'environnement
  permissions.ts       définitions de permissions (INUTILISÉ)
  badges.ts            logique d'attribution de badges
  reputation.ts        mise à jour du score de réputation
  helpers.ts           utilitaire isServer()

features/             ← modules métier avec leurs schémas
  auth/schemas.ts
  snippets/schemas.ts
  reviews/schemas.ts
  moderation/schemas.ts

app/api/              ← routes API REST (App Router)
  auth/[...nextauth]/, auth/register/
  snippets/, snippets/[id]/, snippets/[id]/reviews/
  reviews/, reviews/[id]/vote/, reviews/[id]/report/
  reports/, reports/[id]/
  leaderboard/

prisma/
  schema.prisma
  seed.ts             ← seed des badges uniquement
  migrations/         ← 4 migrations

types/
  next-auth.d.ts      ← augmentation des types Session/User/JWT
```

### Patterns utilisés

- **Wrapper/Decorator** : `apiHandler`, `authenticatedHandler`, `moderatorHandler` enrobent les handlers de route
- **Singleton** : PrismaClient (`lib/prisma.ts:5-13`), Logger (`lib/logger.ts:37`)
- **Factory** : `ApiError.validation()`, `.unauthorized()`, etc. (`lib/errors.ts:21-46`)
- **Feature-based validation** : schémas Zod par domaine dans `features/*/schemas.ts`
- **Adaptateur** : `@prisma/adapter-pg` pour PostgreSQL

---

## 2. Modèle de Données (Prisma)

### Liste des modèles

**User** (`prisma/schema.prisma:15-36`)

| Champ           | Type                                                                                                     | Contrainte            |
| --------------- | -------------------------------------------------------------------------------------------------------- | --------------------- |
| id              | String (UUID)                                                                                            | @id                   |
| email           | String                                                                                                   | @unique               |
| name            | String                                                                                                   |                       |
| passwordHash    | String?                                                                                                  | @map("password_hash") |
| emailVerified   | DateTime?                                                                                                |                       |
| image           | String?                                                                                                  |                       |
| reputationScore | Int (default 0)                                                                                          | index                 |
| isModerator     | Boolean (default false)                                                                                  |                       |
| createdAt       | DateTime                                                                                                 | @default(now())       |
| updatedAt       | DateTime                                                                                                 | @updatedAt            |
| Relations →     | Account[], Session[], Snippet[], Review[] (ReviewerReviews), Vote[], UserBadge[], Report[] (UserReports) |

**Account** (`prisma/schema.prisma:38-56`) — Modèle NextAuth standard.

- `@@unique([provider, providerAccountId])`

**Session** (`prisma/schema.prisma:58-67`) — Modèle NextAuth standard.

- `sessionToken` @unique

**VerificationToken** (`prisma/schema.prisma:69-76`)

- `@@unique([identifier, token])`

**Snippet** (`prisma/schema.prisma:78-94`)

| Champ       | Type                       | Contrainte       |
| ----------- | -------------------------- | ---------------- |
| id          | String (UUID)              | @id              |
| code        | String                     |                  |
| language    | String                     | index            |
| isAnonymous | Boolean (default false)    |                  |
| userId      | String                     | FK → User, index |
| createdAt   | DateTime                   | index            |
| updatedAt   | DateTime                   |                  |
| Relations → | User (1:1), Review[] (1:N) |

Index : `[userId]`, `[language]`, `[createdAt]`, `[language, createdAt]`

**Review** (`prisma/schema.prisma:102-120`)

| Champ       | Type                                                  | Contrainte                         |
| ----------- | ----------------------------------------------------- | ---------------------------------- |
| id          | String (UUID)                                         | @id                                |
| snippetId   | String                                                | FK → Snippet, index                |
| reviewerId  | String                                                | FK → User (ReviewerReviews), index |
| rating      | Int                                                   |                                    |
| createdAt   | DateTime                                              |                                    |
| updatedAt   | DateTime                                              |                                    |
| Relations → | Snippet, User (reviewer), Comment[], Vote[], Report[] |

Index : `[snippetId]`, `[snippetId, createdAt]`, `[snippetId, reviewerId]`, `[reviewerId]`

**Comment** (`prisma/schema.prisma:176-188`)

| Champ       | Type          | Contrainte  |
| ----------- | ------------- | ----------- |
| id          | String (UUID) | @id         |
| reviewId    | String        | FK → Review |
| lineNumber  | Int           |             |
| content     | String        |             |
| createdAt   | DateTime      |             |
| updatedAt   | DateTime      |             |
| Relations → | Review (N:1)  |

Index : `[reviewId]`, `[reviewId, lineNumber]`

**Vote** (`prisma/schema.prisma:139-152`)

| Champ       | Type          | Contrainte         |
| ----------- | ------------- | ------------------ |
| id          | String (UUID) | @id                |
| reviewId    | String        | FK → Review, index |
| userId      | String        | FK → User, index   |
| value       | Int           |                    |
| createdAt   | DateTime      |                    |
| Relations → | Review, User  |

`@@unique([reviewId, userId])`

**Report** (`prisma/schema.prisma:122-137`)

| Champ       | Type                           | Contrainte                     |
| ----------- | ------------------------------ | ------------------------------ |
| id          | String (UUID)                  | @id                            |
| reviewId    | String                         | FK → Review, index             |
| reporterId  | String                         | FK → User (UserReports), index |
| reason      | String                         |                                |
| status      | ReportStatus (default PENDING) | index                          |
| createdAt   | DateTime                       |                                |
| Relations → | Review, User (reporter)        |

`@@unique([reviewId, reporterId])`

**Badge** (`prisma/schema.prisma:154-163`)

| Champ       | Type          | Contrainte |
| ----------- | ------------- | ---------- |
| id          | String (UUID) | @id        |
| name        | String        | @unique    |
| description | String        |            |
| icon        | String        |            |
| createdAt   | DateTime      |            |
| Relations → | UserBadge[]   |

**UserBadge** (`prisma/schema.prisma:165-174`)

| Champ     | Type     | Contrainte   |
| --------- | -------- | ------------ |
| userId    | String   | PK composite |
| badgeId   | String   | PK composite |
| createdAt | DateTime |              |

### Enums

```prisma
enum ReportStatus {
  PENDING
  REVIEWED
  DISMISSED
}
```

### Relations

| Modèle A | Modèle B  | Type | Champ FK                            |
| -------- | --------- | ---- | ----------------------------------- |
| User     | Account   | 1:N  | Account.userId                      |
| User     | Session   | 1:N  | Session.userId                      |
| User     | Snippet   | 1:N  | Snippet.userId                      |
| User     | Review    | 1:N  | Review.reviewerId (ReviewerReviews) |
| User     | Vote      | 1:N  | Vote.userId                         |
| User     | UserBadge | 1:N  | UserBadge.userId                    |
| User     | Report    | 1:N  | Report.reporterId (UserReports)     |
| Snippet  | Review    | 1:N  | Review.snippetId                    |
| Review   | Comment   | 1:N  | Comment.reviewId                    |
| Review   | Vote      | 1:N  | Vote.reviewId                       |
| Review   | Report    | 1:N  | Report.reviewId                     |
| Badge    | UserBadge | 1:N  | UserBadge.badgeId                   |

Toutes les relations ont `onDelete: Cascade`.

### Analyse critique

1. **`DIFFICULTIES` inutilisé** : `constants.ts:23` définit `["debutant", "intermediaire", "avance"]` mais le modèle Snippet n'a pas de champ `difficulty`. Ce champ devrait exister avec ses propres index.

2. **Comment sans auteur** : Le modèle Comment (ligne 176) n'a pas de `userId` ou `authorId`. Impossible de tracer qui a écrit un commentaire — violation de responsabilité. C'est une faille de design majeure.

3. **Pas de contrainte CHECK sur `Vote.value`** : Le champ `value: Int` (ligne 143) n'a pas de contrainte CHECK en base. La validation est uniquement applicative via Zod (`voteSchema`). Une contrainte `CHECK (value IN (1, -1))` est absente.

4. **Pas de contrainte CHECK sur `Review.rating`** : `rating: Int` (ligne 106) n'est pas contraint en base (1-5). Validation uniquement applicative.

5. **Absence de `title`/`description` sur Snippet** : Aucun champ de titre ou description, rendant la liste des snippets peu exploitable.

6. **Doublon `@@unique` inutile** : `UserBadge` définit `@@id([userId, badgeId])` (ligne 172) ce qui est suffisant pour l'unicité.

7. **Index `[snippetId, reviewerId]` sur Review** : Excellent pour la vérification de doublon de review (un reviewer ne peut review un snippet qu'une fois).

8. **Aucun index sur `Report.createdAt`** : Les reports sont ordonnés par `createdAt` (ordre décroissant) dans `reports/route.ts:35` — un index manquant ralentira cette requête.

9. **UserBadge pas d'index sur `badgeId` seul** : La recherche "tous les utilisateurs qui ont ce badge" n'est pas indexée.

---

## 3. Routes API

### POST /api/auth/register

- **Fichier** : `app/api/auth/register/route.ts`
- **Handler** : `apiHandler` (public)
- **Validation** : `registerSchema` via `safeParse`
- **Logique** : Vérifie unicité email → hash bcrypt (12 rounds) → crée user
- **Erreurs** : `ApiError.conflict` si email existe, `ApiError.validation` si schéma invalide
- **Retour** : 201, `{ success, message, user }` (sans passwordHash)
- **Requêtes Prisma** : 1x findUnique, 1x create

### POST /api/auth/[...nextauth]

- **Fichier** : `app/api/auth/[...nextauth]/route.ts`
- Handler NextAuth standard. Délègue à `authOptions`.

### POST /api/snippets

- **Fichier** : `app/api/snippets/route.ts:9-44`
- **Handler** : `authenticatedHandler`
- **Validation** : `createSnippetSchema` (code, language, isAnonymous)
- **Logique** : Crée snippet avec `userId` de la session
- **Retour** : 201, snippet avec infos user
- **Requêtes Prisma** : 1x create (include user)

### GET /api/snippets

- **Fichier** : `app/api/snippets/route.ts:46-104`
- **Handler** : `apiHandler` (public)
- **Validation** : Paramètres query : page, limit, language
- **Logique** : Pagination avec `skip/take`, filtre optionnel par language
- **Retour** : `{ snippets, pagination: { page, limit, totalCount, totalPages, hasNextPage, hasPreviousPage } }`
- **Requêtes Prisma** : 1x findMany (select limité + _count reviews), 1x count — parallélisés avec `Promise.all`
- **Analyse** : `select` bien optimisé (pas de `include` lourd). Seul le nom de l'utilisateur est chargé.

### GET /api/snippets/[id]

- **Fichier** : `app/api/snippets/[id]/route.ts:8-31`
- **Handler** : `apiHandler` (public)
- **Logique** : findUnique avec include user + _count reviews
- **Erreur** : 404 si introuvable

### PATCH /api/snippets/[id]

- **Fichier** : `app/api/snippets/[id]/route.ts:33-82`
- **Handler** : `authenticatedHandler`
- **Validation** : `updateSnippetSchema`
- **Logique** : Vérifie existence → vérifie propriétaire → update
- **Requêtes Prisma** : 1x findUnique (vérif), 1x update (include user)
- **DÉFAUT** : Double requête. On pourrait faire un `updateMany` avec `where: { id, userId }` et vérifier le count.

### DELETE /api/snippets/[id]

- **Fichier** : `app/api/snippets/[id]/route.ts:84-108`
- **Handler** : `authenticatedHandler`
- **Logique** : Vérifie existence + propriétaire → delete
- **Même défaut** : Double requête.

### GET /api/snippets/[id]/reviews

- **Fichier** : `app/api/snippets/[id]/reviews/route.ts`
- **Handler** : `apiHandler` (public)
- **Logique** : Vérifie snippet → findMany reviews avec reviewer + comments
- **Pagination** : **ABSENTE** — toutes les reviews sont retournées.
- **Requêtes Prisma** : 1x findUnique (snippet), 1x findMany (reviews avec includes)

### POST /api/reviews

- **Fichier** : `app/api/reviews/route.ts`
- **Handler** : `authenticatedHandler`
- **Validation** : `createReviewSchema` (snippetId, rating 1-5, comments[])
- **Logique** : Vérifie snippet → interdit auto-review → interdit doublon → crée review + comments imbriqués → check badges
- **Retour** : 201
- **Requêtes** : 1x findUnique snippet, 1x findFirst (doublon), 1x create (include + nested create)
- **PAS DE TRANSACTION** : Si `checkAndAwardBadges` échoue, la review est déjà créée.

### POST /api/reviews/[id]/vote

- **Fichier** : `app/api/reviews/[id]/vote/route.ts`
- **Handler** : `authenticatedHandler`
- **Validation** : `voteSchema` (value: 1 ou -1)
- **Logique** : Vérifie review → interdit auto-vote → toggle (create/delete/update) → met à jour réputation → check badges
- **États possibles** :
  - Pas de vote existant → crée vote (create)
  - Même valeur → supprime vote (annulation, delete)
  - Valeur différente → met à jour vote (update)
- **Requêtes** : 1x findUnique review, 1x findUnique vote, 1x create|delete|update, 1x update reputation, 2x check badges, 1x aggregate vote score
- **PROBLÈME CRITIQUE** : Aucune transaction. 6-7 requêtes non atomiques. Race condition possible si deux requêtes arrivent en même temps. Si `updateReviewerReputation` échoue après la création du vote, l'état est corrompu.

### POST /api/reviews/[id]/report

- **Fichier** : `app/api/reviews/[id]/report/route.ts`
- **Handler** : `authenticatedHandler`
- **Validation** : `reportSchema` (reason, 1-500 chars)
- **Logique** : Vérifie review → interdit auto-report → vérifie unicité (unique constraint) → crée report
- **Requêtes** : 1x findUnique review, 1x findUnique report, 1x create

### GET /api/reports

- **Fichier** : `app/api/reports/route.ts`
- **Handler** : `moderatorHandler`
- **Logique** : Liste tous les reports avec include en cascade (reporter → review → reviewer → snippet)
- **Pagination** : **ABSENTE**. Tous les reports sont chargés — dangereux en production.
- **Aucun filtre** : Impossible de filtrer par status (PENDING uniquement, par exemple).
- **Requête lourde** : include profond sur 4 niveaux de jointure.

### PATCH /api/reports/[id]

- **Fichier** : `app/api/reports/[id]/route.ts`
- **Handler** : `moderatorHandler`
- **Validation** : **MANUELLE** (pas de Zod). Simple condition `status !== "REVIEWED" && status !== "DISMISSED"`.
- **Logique** : Vérifie existence → update status
- **DÉFAUT** : Validation manuelle fragile. Devrait utiliser un schéma Zod `updateReportSchema`.

### GET /api/leaderboard

- **Fichier** : `app/api/leaderboard/route.ts`
- **Handler** : `authenticatedHandler`
- **Logique** : Pagination, tri par `reputationScore` descendant, inclut badges et compteurs
- **Requêtes** : 1x findMany (select + include badges), 1x count
- **Transformation** : Chaque user est transformé avec `position = skip + index + 1`

### Analyse critique des routes

1. **Aucune transaction Prisma** utilisée dans l'ensemble du codebase. C'est le problème le plus grave.
2. **Pagination absente** sur `GET /api/reports` et `GET /api/snippets/[id]/reviews`
3. **Validation manuelle** dans `PATCH /api/reports/[id]` au lieu d'un schéma Zod
4. **Aucune route de suppression** pour les votes, reviews, reports (les modérateurs ne peuvent pas supprimer)
5. **Pas de endpoint pour les propres snippets/reviews d'un utilisateur**
6. **Format de réponse incohérent** (voir section 4)

---

## 4. Système de Gestion des Erreurs

### ApiError (`lib/errors.ts`)

Classe d'erreur avec 4 propriétés : `code` (union type), `message`, `status`, `details?`.

**Codes d'erreur** (ligne 1-8) :

```typescript
"VALIDATION_ERROR" |
  "UNAUTHORIZED" |
  "FORBIDDEN" |
  "NOT_FOUND" |
  "CONFLICT" |
  "RATE_LIMITED" |
  "INTERNAL_ERROR";
```

**`RATE_LIMITED` n'est jamais utilisé** dans aucun handler ni route.

### Méthodes statiques (lignes 21-46)

| Méthode           | Code             | Status HTTP | Message par défaut          |
| ----------------- | ---------------- | ----------- | --------------------------- |
| `.validation()`   | VALIDATION_ERROR | 400         | (obligatoire)               |
| `.unauthorized()` | UNAUTHORIZED     | 401         | "Vous devez etre connecte." |
| `.forbidden()`    | FORBIDDEN        | 403         | "Acces refuse."             |
| `.notFound()`     | NOT_FOUND        | 404         | "Ressource introuvable."    |
| `.conflict()`     | CONFLICT         | 409         | "Conflit."                  |
| `.internal()`     | INTERNAL_ERROR   | 500         | "Une erreur est survenue."  |

### `toResponse()` (lignes 48-70)

```typescript
{ success: false, error: { code, message, details? } }
```

### `handlePrismaError()` (lignes 73-92)

| Code Prisma                | Erreur ApiError                                        |
| -------------------------- | ------------------------------------------------------ |
| P2002 (unique constraint)  | CONFLICT — "Cette ressource existe deja."              |
| P2025 (not found)          | NOT_FOUND — "Enregistrement introuvable."              |
| P2003 (foreign key)        | VALIDATION_ERROR — "Contrainte de foreign key violee." |
| P2014 (relation violation) | VALIDATION_ERROR — "Violation de relation requise."    |
| Autre                      | INTERNAL_ERROR                                         |

### `handleError()` dans `api-handler.ts` (lignes 124-159)

Séquence de traitement :

1. `ApiError` → log si status >= 500, retour formaté
2. `ZodError` → log warn, retour 400 avec field errors
3. `handlePrismaError` → si pas 500, retour formaté
4. Tout autre → log error, retour 500

### Problème CRITIQUE : Format de réponse incohérent

Il y a **TROIS formats différents** selon le chemin d'erreur :

**Format A** — `ApiError.toResponse()` (`lib/errors.ts:48`):

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

Pas de champ `message` au niveau racine.

**Format B** — `formatError()` dans `api-handler.ts:108-122`:

```json
{
  "success": false,
  "message": "...",
  "error": { "code": "...", "message": "..." }
}
```

A un champ `message` racine **ET** `error.message`.

**Format C** — Réponse inline dans `authenticatedHandler` (`api-handler.ts:39-50`):

```json
{
  "success": false,
  "message": "...",
  "error": { "code": "UNAUTHORIZED", "message": "..." }
}
```

Similaire à B mais avec `message` racine.

**Conséquence** : Un client qui parse les réponses d'erreur ne peut pas compter sur une structure uniforme.

### Analyse critique

1. **Triple format de réponse d'erreur** — `toResponse()`, `formatError()`, et les réponses inline dans `authenticatedHandler`/`moderatorHandler` ne sont pas alignés.
2. **`RATE_LIMITED` défini mais inutilisé** — Aucune implémentation de rate limiting.
3. **Duplication de code** — `authenticatedHandler` et `moderatorHandler` dupliquent intégralement la vérification de session (lignes 36-50 et 68-84). Un `withAuth(handler, { requireModerator: true })` serait plus DRY.
4. **Messages en français codés en dur** — Pas d'internationalisation.

---

## 5. Système de Validation

### Champs réutilisables (`lib/validation.ts`)

| Champ           | Validations                          | Ligne |
| --------------- | ------------------------------------ | ----- |
| `emailField`    | `.trim().email().toLowerCase()`      | 7-11  |
| `passwordField` | `.min(8).max(128)`                   | 13-16 |
| `nameField`     | `.trim().min(2).max(80)`             | 18-22 |
| `languageField` | `.enum(...)` à partir de `LANGUAGES` | 24-26 |

### Schémas par feature

**auth/schemas.ts** :

- `loginSchema` : `{ email, password: z.string().min(1) }` — note : min(1) seulement, pas la validation complète
- `registerSchema` : `{ name, email, password }` — utilise les champs réutilisables

**snippets/schemas.ts** :

- `createSnippetSchema` : `{ code, language, isAnonymous?: boolean (default false) }`
- `updateSnippetSchema` : `{ code, language, isAnonymous?: boolean }`

**reviews/schemas.ts** :

- `lineCommentSchema` : `{ lineNumber: int positive, content: string min(1) }`
- `createReviewSchema` : `{ snippetId, rating: int 1-5, comments: lineCommentSchema[] (default []) }`
- `voteSchema` : `{ value: int, refine(val === 1 || val === -1) }`

**moderation/schemas.ts** :

- `reportSchema` : `{ reason: string min(1) max(500) }`
- `checklistSchema` : `{ checkedItems: string[] }` — **refine** : tous les items doivent être cochés
- `CHECKLIST_ITEMS` : 4 items (readable, variables, practices, constructive)

### Analyse critique

1. **`checklistSchema` inapproprié dans une API** : Ce schéma exige que TOUS les items d'une checklist frontend soient présents. C'est une contrainte d'UX qui n'a rien à faire dans une validation backend. Il force le client à envoyer les 4 items fixes à chaque fois — redondant et fragile.

2. **`difficulty` manquant** : `constants.ts:23` définit `DIFFICULTIES` mais aucun schéma snippet ne l'utilise.

3. **Pas de limite de taille sur `code`** : Un snippet peut faire plusieurs mégaoctets sans validation. Risque de déni de service.

4. **`loginSchema` incohérent** : N'utilise pas `passwordField` (min 8) mais `z.string().min(1)`. C'est intentionnel (ne pas révéler la politique de mot de passe), mais incohérent avec le message d'erreur.

5. **Aucune validation UUID** : `snippetId` est simplement `z.string().min(1)`. Une validation `z.string().uuid()` serait plus stricte.

---

## 6. Logging

### Architecture (`lib/logger.ts`)

```typescript
type LogLevel = "info" | "warn" | "error";
type LogEntry = { level; message; timestamp; context? };
type Transport = (entry: LogEntry) => void;
```

**Transport par défaut** : `console.error`/`console.warn`/`console.log` selon le niveau.

### Masquage PII (lignes 12-35)

Clés sensibles masquées : `password`, `passwordHash`, `token`, `secret`, `authorization`, `cookie`, `NEXTAUTH_SECRET`, `DATABASE_URL`.

Masquage appliqué **deux fois** : une fois dans `log()` (ligne 73) avant d'appeler les transports, et une fois dans le transport console (ligne 44).

### Utilisation dans le code

- `logger.error()` pour les erreurs 500+ (`api-handler.ts:127`)
- `logger.warn()` pour les erreurs de validation Zod (`api-handler.ts:134`)
- `logger.error()` pour les erreurs non gérées (`api-handler.ts:153`)

### Analyse critique

1. **Masquage PII doublon** : `sanitize()` est appelé à `logger.ts:73` puis à nouveau dans le transport à `logger.ts:44`. Inoffensif mais inutile.

2. **Aucun stockage persistant** : Pas de transport fichier, pas d'intégration externe configurée par défaut. Logs en mémoire seulement.

3. **Aucun niveau minimum configurable** : Impossible de désactiver les logs `info` en production.

4. **Aucun ID de corrélation (requestId)** : Impossible de tracer les logs d'une même requête.

5. **Transport silencieux** : Si `addTransport()` plante, le logger ne propage pas l'erreur (ligne 78-80 `catch {}`). Bon pour la robustesse, mais les transports défaillants sont silencieux.

---

## 7. Configuration et Sécurité

### Validation d'environnement (`lib/env.ts`)

Validation minimale : vérifie que `NEXTAUTH_SECRET` et `DATABASE_URL` ne sont pas vides.

- `NEXTAUTH_URL` a une valeur par défaut (`http://localhost:3000`)
- Appelée où ? Aucun appel à `validateEnv()` n'est visible dans les fichiers lus. Elle est exportée mais pourrait ne jamais être invoquée au démarrage.

### Constantes (`lib/constants.ts`)

- 17 langages supportés
- 3 difficultés définies mais inutilisées
- Pagination : DEFAULT_PAGE=1, DEFAULT_LIMIT=12, MAX_LIMIT=50
- Réputation : MIN_REPUTATION_TO_VOTE (50), rewards et penalties

### Permissions (`lib/permissions.ts`)

```typescript
CREATE_SNIPPET |
  EDIT_OWN_SNIPPET |
  DELETE_OWN_SNIPPET |
  VOTE |
  REVIEW |
  MODERATE |
  MANAGE_USERS;
```

**Jamais importé ni utilisé nulle part** dans le codebase. C'est du code mort. Les vérifications d'accès sont faites par comparaison directe d'`userId`.

### Middleware (`middleware.ts`)

- Utilise `withAuth` de NextAuth
- Routes protégées : `/dashboard`, `/snippets`, `/reviews`, `/profile`, `/moderation`, `/leaderboard`
- Vérification modérateur pour `/moderation`
- Redirection vers `/login` si non connecté
- Redirection vers `/forbidden` si non modérateur

### Configuration Next.js (`next.config.mjs`)

- `output: "standalone"` (Docker-ready)
- `poweredByHeader: false`
- `productionBrowserSourceMaps: false`

### Docker

- **Dockerfile** : Multi-stage (Node 20 Alpine). Build → production. Copie uniquement les fichiers .next/standalone.
- **docker-compose.yml** : App + PostgreSQL 16-Alpine avec healthcheck pg_isready.
- **Problème** : Le `.env.example` a `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codementor` mais le `docker-compose.yml` utilise `postgresql://codementor:codementor@db:5432/codementor`. Les credentials ne correspondent PAS.

### Analyse critique

1. **`permissions.ts` est du code mort** à 100%. Aucune importation, aucune utilisation. Soit le supprimer, soit l'intégrer dans `api-handler.ts`.

2. **`validateEnv()` jamais appelée** au démarrage de l'application. Si les variables sont absentes, l'erreur ne surviendra qu'au moment de l'utilisation, pas au lancement.

3. **CORS absent** : Aucune configuration CORS. Si l'API est appelée depuis un autre domaine, les requêtes seront bloquées. C'est correct pour un usage first-party Next.js, mais à documenter.

4. **Aucun header de sécurité** : Pas de `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`. Seul `poweredByHeader` est désactivé.

5. **Credentials incohérents** : `.env.example` utilise `postgres:postgres` mais `docker-compose.yml` utilise `codementor:codementor`.

6. **Aucun rate limiting** : `RATE_LIMITED` est défini mais pas implémenté. Une API de production devrait avoir au minimum un rate limiting sur `/api/auth/register`.

7. **PrismaAdapter cast** : `lib/auth.ts:9-11` fait un `prisma as unknown as Parameters<typeof PrismaAdapter>[0]` — ce cast forcé est un signe que le type de PrismaClient v7 n'est pas parfaitement compatible avec l'adaptateur NextAuth v4.

---

## 8. Gestion des Transactions et Performances

### Transactions Prisma

**AUCUNE transaction n'est utilisée dans l'ensemble du codebase.**

Zones critiques sans transaction :

| Endpoint                                     | Opérations non atomiques              | Risque                                                   |
| -------------------------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `POST /api/reviews` (ligne 49)               | Création review + badges              | Review créée mais badge non attribué si échec            |
| `POST /api/reviews/[id]/vote` (lignes 51-84) | Vote + réputation + badges x2 + score | État partiel : vote créé mais réputation non mise à jour |
| `PATCH /api/reports/[id]` (ligne 25)         | Mise à jour report (mineur)           | Pas de conséquence grave                                 |

### Analyse du `$transaction` manquant dans `POST /api/reviews/[id]/vote`

Ce endpoint est le plus critique : il fait successivement (sans atomicité) :

1. `prisma.vote.create/delete/update`
2. `prisma.user.update({ increment })` — réputation
3. `checkAndAwardBadges(reviewerId)`
4. `checkAndAwardBadges(userId)`
5. `prisma.vote.aggregate` — score

Si l'étape 2 échoue, l'étape 1 (le vote) est déjà persistée.

### Requêtes N+1

Prisma ORM gère correctement les `include` nested via des JOINs SQL, donc il n'y a pas de N+1 classique dans ce codebase. Les `select` sont utilisés de façon appropriée pour limiter les champs chargés.

### Requêtes potentiellement lourdes

1. **`GET /api/reports`** (ligne 7) : `findMany` avec 4 niveaux de `include` (reporter → review → reviewer → snippet). Sans pagination ni filtre, cette requête peut devenir très lente.

2. **`GET /api/leaderboard`** (ligne 20) : `findMany` avec `include` des badges (UserBadge → Badge). Avec des centaines d'utilisateurs, ça reste correct.

3. **`GET /api/snippets`** (ligne 62) : `_count` de reviews par snippet — c'est une sous-requête SQL, efficace.

### Index manquants

| Table     | Colonne      | Justification                                           |
| --------- | ------------ | ------------------------------------------------------- |
| Report    | `createdAt`  | Ordonné par `createdAt DESC` dans `reports/route.ts:35` |
| UserBadge | `badgeId`    | Pour chercher "combien d'utilisateurs ont ce badge"     |
| Comment   | `lineNumber` | Index seul manquant (seulement composite avec reviewId) |

### Pagination

| Endpoint                         | Paginé ?                                  |
| -------------------------------- | ----------------------------------------- |
| `GET /api/snippets`              | OUI (avec page, limit, totalCount)        |
| `GET /api/leaderboard`           | OUI                                       |
| `GET /api/reports`               | **NON** — Tous les reports d'un coup      |
| `GET /api/snippets/[id]/reviews` | **NON** — Toutes les reviews d'un snippet |

---

## 9. Tests

### Vue d'ensemble

| Fichier                                      | Tests           | Type     | Dépendances    |
| -------------------------------------------- | --------------- | -------- | -------------- |
| `lib/__tests__/errors.test.ts`               | 12 (2 describe) | Unitaire | Aucune         |
| `lib/__tests__/logger.test.ts`               | 5 (1 describe)  | Unitaire | Console mockée |
| `lib/__tests__/validation.test.ts`           | 12 (4 describe) | Unitaire | Aucune         |
| `features/auth/__tests__/schemas.test.ts`    | 6 (2 describe)  | Unitaire | Zod            |
| `features/reviews/__tests__/schemas.test.ts` | 7 (3 describe)  | Unitaire | Zod            |
| **Total**                                    | **42 tests**    |          |                |

### Ce qui est testé

- **ApiError** : Toutes les méthodes statiques, `toResponse()`, `handlePrismaError()` (P2002, P2025, P2003, P2014, inconnu, non-objet)
- **Logger** : Messages info/warn/error, timestamp ISO, masquage PII (password)
- **Validation** : emailField (valid, invalid, trim), passwordField (min, max), nameField (min, max, trim), languageField (valide, invalide)
- **Auth schemas** : loginSchema (valide, sans password), registerSchema (valide, password court, email invalide, nom court)
- **Review schemas** : lineCommentSchema (valide, lineNumber ≤0, contenu vide), createReviewSchema (valide, rating hors limite), voteSchema (1, -1, 0)

### Ce qui N'EST PAS testé

| Fichier                          | Non testé                                    |
| -------------------------------- | -------------------------------------------- |
| `lib/api-handler.ts`             | Aucun test des 3 wrappers                    |
| `lib/auth.ts`                    | Aucun test de la config NextAuth             |
| `lib/session.ts`                 | Aucun test                                   |
| `lib/prisma.ts`                  | Aucun test                                   |
| `lib/badges.ts`                  | Aucun test de la logique de badges           |
| `lib/reputation.ts`              | Aucun test                                   |
| `lib/permissions.ts`             | Défini mais inutilisé                        |
| `features/moderation/schemas.ts` | `reportSchema`, `checklistSchema` non testés |
| `features/snippets/schemas.ts`   | Non testé                                    |
| Toutes les routes API            | Aucun test d'intégration                     |

### Configuration (`vitest.config.ts`)

- Environnement : `jsdom` (même pour les tests backend purs)
- Globals : `true`
- Setup : `vitest.setup.ts` (import `@testing-library/jest-dom/vitest`)
- Alias : `@` → racine du projet

### Analyse critique

1. **`jsdom` utilisé pour tous les tests** : Même pour `errors.test.ts` et `validation.test.ts` qui sont du pur TypeScript sans DOM. Environnement plus lourd que nécessaire.

2. **Aucun test d'intégration** : Aucun test ne touche à la base de données. Les requêtes Prisma, les transactions, et la logique métier complexe (vote, badges, réputation) ne sont pas testées.

3. **Aucun test des routes API** : Les handlers dans `app/api/` ne sont pas testés. Ni les wrappers de sécurité, ni les réponses d'erreur, ni la logique de pagination.

4. **Aucun mock Prisma** : Pas de configuration pour mock le client Prisma dans les tests.

5. **Couverture faible** : 42 tests pour ~700 lignes de code backend. Pas de métrique de couverture configurée.

---

## 10. Synthèse et Recommandations

### Forces

1. **Séparation des responsabilités claire** : `lib/` pour la logique transverse, `features/` pour les schémas, `app/api/` pour les routes.
2. **Gestion centralisée des erreurs** : ApiError + handleError + handlePrismaError forment une chaîne de traitement complète.
3. **Validation robuste** : Schémas Zod réutilisables, validation à chaque endpoint.
4. **Indexation correcte** : La plupart des requêtes courantes sont couvertes par des index (surtout sur Review).
5. **TypeScript strict** : Pas de `any` sauvage, types augmentés NextAuth propres.
6. **Docker prêt** : Multi-stage build, healthcheck PostgreSQL.
7. **PII masking** intégré au logger.
8. **Vérifications de propriété** : Chaque mutation vérifie que l'utilisateur est le propriétaire.

### Faiblesses et Risques

| #   | Risque                                                                                      | Gravité      | Fichier:ligne                                                         |
| --- | ------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------- |
| 1   | **Aucune transaction Prisma** — Opérations critiques (vote+réputation+badges) non atomiques | **CRITIQUE** | `reviews/[id]/vote/route.ts:51-84`                                    |
| 2   | **Format d'erreur incohérent** — 3 formats différents selon le chemin                       | **HAUTE**    | `lib/errors.ts:48`, `lib/api-handler.ts:108`, `lib/api-handler.ts:39` |
| 3   | **Comment sans auteur** — Impossible de tracer l'auteur d'un commentaire                    | **HAUTE**    | `prisma/schema.prisma:176-188`                                        |
| 4   | **Reports non paginés** — Requête lourde sans limite                                        | **HAUTE**    | `app/api/reports/route.ts:7`                                          |
| 5   | **Aucun test des routes API** — 0% de couverture des handlers                               | **HAUTE**    | `app/api/*`                                                           |
| 6   | **Permissions définies mais inutilisées** — Code mort                                       | **MOYENNE**  | `lib/permissions.ts`                                                  |
| 7   | **`difficulty` absent du modèle Snippet** — Constante définie, champ absent                 | **MOYENNE**  | `prisma/schema.prisma:78` vs `constants.ts:23`                        |
| 8   | **Pas de limite de taille sur `code`** — Risque DoS                                         | **MOYENNE**  | `features/snippets/schemas.ts:6`                                      |
| 9   | **Validation manuelle dans PATCH /api/reports** — Pas de Zod                                | **MOYENNE**  | `app/api/reports/[id]/route.ts:12-13`                                 |
| 10  | **`validateEnv()` jamais appelée** — Pas de vérification au démarrage                       | **MOYENNE**  | `lib/env.ts`                                                          |
| 11  | **Credentials incohérents Docker/.env** — Échec au déploiement                              | **MOYENNE**  | `.env.example` vs `docker-compose.yml`                                |
| 12  | **Duplication session check** — authenticatedHandler et moderatorHandler                    | **FAIBLE**   | `lib/api-handler.ts:36-50,68-84`                                      |
| 13  | **jsdom dans tous les tests** — Overhead inutile                                            | **FAIBLE**   | `vitest.config.ts:8`                                                  |

### Priorités d'amélioration (par ordre d'impact)

**P1 — Immédiat (sécurité et intégrité des données)**

1. Ajouter `$transaction([...])` Prisma sur `POST /api/reviews/[id]/vote` (vote + réputation) et sur `POST /api/reviews` (review + badges)
2. Uniformiser le format de réponse d'erreur : supprimer le `message` racine redondant dans `api-handler.ts`, utiliser systématiquement `ApiError.toResponse()`
3. Ajouter `userId` au modèle Comment avec migration et mise à jour des routes

**P2 — Court terme (qualité et maintenabilité)** 4. Ajouter la pagination sur `GET /api/reports` (avec filtre par status et limit) 5. Ajouter des tests d'intégration pour les routes critiques (authentification, snippets, votes) 6. Ajouter une limite de taille (`z.string().max(50000)`) sur le champ `code` des snippets 7. Implémenter le rate limiting sur les routes sensibles (auth/register, vote, report)

**P3 — Moyen terme (architecture et complétude)** 8. Supprimer `lib/permissions.ts` ou l'intégrer réellement dans la couche d'autorisation 9. Extraire la logique de session commune entre `authenticatedHandler` et `moderatorHandler` en un `withAuth()` unique 10. Ajouter le champ `difficulty` au modèle Snippet et aux schémas 11. Ajouter `validateEnv()` dans la configuration Next.js (`next.config.mjs` ou instrumentation hook) 12. Remplacer la validation manuelle de `PATCH /api/reports/[id]` par un schéma Zod 13. Ajouter un index sur `Report.createdAt` 14. Uniformiser les credentials PostgreSQL entre `.env.example` et `docker-compose.yml`
