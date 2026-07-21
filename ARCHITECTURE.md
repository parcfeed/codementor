# Architecture technique

## Stack technologique

| Technologie   | Role                               |
| ------------- | ---------------------------------- |
| Next.js 14    | Framework full-stack (App Router)  |
| TypeScript    | Typage statique                    |
| Tailwind CSS  | Design system et styles            |
| Prisma ORM v7 | Acces base de donnees              |
| PostgreSQL    | Base de donnees relationnelle      |
| NextAuth.js   | Authentification (Credentials)     |
| Monaco Editor | Editeur de code (lecture/ecriture) |
| Zod           | Validation de formulaires          |

## Structure du projet

```
app/
  api/             - Routes API (REST)
    auth/register
    snippets/
    snippets/[id]/
    reviews/
    reviews/[id]/vote
    reviews/[id]/report
    reports/
    reports/[id]/
    leaderboard
  auth/
    login/page.tsx
    register/page.tsx
  snippets/
    page.tsx                  - Liste avec pagination, filtres
    [id]/page.tsx             - Detail avec reviews, votes, signalement
    new/page.tsx              - Creation
    [id]/edit/page.tsx        - Edition
  dashboard/page.tsx          - Tableau de bord utilisateur
  profile/page.tsx            - Profil avec badges
  leaderboard/page.tsx        - Classement
  moderation/page.tsx         - Gestion des signalements

features/
  auth/           - Composants auth (forms, session)
  snippets/       - Composants snippets (forms, cards, editor, filters)
  reviews/        - Composants reviews (form, card, votes, rating)
  moderation/     - Composants moderation (report, checklist, card)
  reputation/     - Composants reputation (badges)
  leaderboard/    - Classement

lib/
  prisma.ts       - Client Prisma singleton
  session.ts      - Helper de session serveur
  auth.ts         - Configuration NextAuth
  badges.ts       - Logique d'attribution des badges
  reputation.ts   - Mise a jour de la reputation
  errors.ts       - Classe ApiError, codes d'erreur, helpers Prisma/Zod
  logger.ts       - Logger structure avec niveaux, filtre PII, transportable
  api-handler.ts  - Wrappers apiHandler / authenticatedHandler / moderatorHandler
  env.ts          - Validation des variables d'environnement
  constants.ts    - Constantes partagees (langages, pagination, reputation)
  validation.ts   - Schemas Zod reutilisables (email, password, name, language)
  permissions.ts  - Helpers de permissions et roles

features/*/schemas.ts  - Schemas Zod (utilisent lib/validation.ts)

prisma/schema.prisma    - Schema de donnees
```

## Data model

```
User
  id, name, email, password, reputationScore, isModerator, createdAt

Snippet
  id, code, language, isAnonymous, userId, createdAt
  relations: User, reviews[]

Review
  id, rating, snippetId, reviewerId, createdAt
  relations: Snippet, reviewer (User), comments[], votes[], reports[]

Comment (ligne par ligne)
  id, lineNumber, content, reviewId

Vote
  id, value (+1/-1), reviewId, userId

Badge
  id, slug, label, description, iconUrl

UserBadge
  id, userId, badgeId, awardedAt

Report
  id, reason, status (PENDING/REVIEWED/DISMISSED), reviewId, reporterId

Account, Session, VerificationToken (NextAuth)
```

## Flux d'authentification

1. Inscription → `POST /api/auth/register` → hash bcrypt → creation User
2. Connexion → `signIn("credentials")` → `authorize()` verifie email+password → retourne user
3. Session JWT → `callbacks.jwt()` incorpore `id`, `reputationScore`, `isModerator`
4. Middleware → lit `next-auth/jwt` → protege les routes `/snippets`, `/reviews`, `/dashboard`, `/profile`, `/moderation`, `/leaderboard`
5. Composants serveur → `getAuthSession()` → lit le token JWT

## Structure des API

| Methode | Route                    | Role                           |
| ------- | ------------------------ | ------------------------------ |
| POST    | /api/auth/register       | Inscription                    |
| POST    | /api/snippets            | Creer un snippet               |
| GET     | /api/snippets            | Lister les snippets            |
| GET     | /api/snippets/[id]       | Detail d'un snippet            |
| PATCH   | /api/snippets/[id]       | Modifier un snippet            |
| DELETE  | /api/snippets/[id]       | Supprimer un snippet           |
| POST    | /api/reviews             | Creer une review               |
| POST    | /api/reviews/[id]/vote   | Voter (+1/-1/annuler)          |
| POST    | /api/reviews/[id]/report | Signaler une review            |
| GET     | /api/reports             | Lister les signalements (modo) |
| PATCH   | /api/reports/[id]        | Mettre a jour statut (modo)    |
| GET     | /api/leaderboard         | Classement des reviewers       |

## Format de reponse API standardise

Toutes les routes API renvoient un format uniforme :

```jsonc
// Succès
{ "success": true, "message": "...", ...data }

// Erreur
{ "success": false, "message": "...", "error": { "code": "...", "message": "...", "details?": {} } }
```

## Gestion centralisee des erreurs

- `lib/errors.ts` : classe `ApiError` avec methodes statiques (`.validation()`, `.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()`, `.internal()`)
- `lib/api-handler.ts` : trois wrappers pour les routes API
  - `apiHandler()` : route publique, try/catch automatique
  - `authenticatedHandler()` : route authentifiee (injecte `userId`, `isModerator`)
  - `moderatorHandler()` : route moderateur (verifie `isModerator`)
- Les erreurs Prisma (`P2002`, `P2025`, etc.) sont automatiquement traduites en `ApiError`
- Les erreurs Zod sont automatiquement capturees et formatees
- Toute erreur non-handlee est loggee et renvoie une 500

## Logging structure

- `lib/logger.ts` : logger singleton avec niveaux `info`, `warn`, `error`
- Format : `[TIMESTAMP] [LEVEL] message { context }`
- Les champs sensibles (password, token, secret) sont automatiquement masques
- Extensible par `addTransport()` pour Sentry/Logtail/Datadog

## Principes de securite

- Mots de passe haches avec bcrypt (12 rounds)
- Validation des entrees avec Zod avant chaque traitement
- Schemas reutilisables centralises dans `lib/validation.ts`
- Sessions JWT signees (next-auth par defaut)
- Middleware de protection de routes
- Verification du proprietaire pour les modifications/suppressions
- Un utilisateur ne peut pas review son propre snippet
- Un utilisateur ne peut pas voter pour sa propre review
- Signalement avec raison obligatoire (min 500 caracteres max)
- Logger masque les donnees sensibles automatiquement
