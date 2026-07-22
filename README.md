# CodeMentor

CodeMentor est une plateforme de review de code entre etudiants. Elle permet de partager des snippets, de recevoir des retours constructifs ligne par ligne, et de progresser grace a un systeme de reputation et de badges.

## Fonctionnalites

- **Authentification** : Inscription, connexion, sessions JWT
- **Snippets** : Creation, edition, suppression, liste avec pagination et filtres
- **Reviews** : Notation (1-5 etoiles), commentaires ligne par ligne, checklist qualite
- **Votes** : Votes positifs/negatifs sur les reviews avec mise a jour du score en temps reel
- **Reputation** : Score calcule a partir des votes recus
- **Badges** : 5 badges automatiques (Premier Review, Reviewer Actif, Expert, Top Reviewer, Helpful Reviewer)
- **Recherche** : Recherche par mot-cle, filtre par langage, tri (recent, ancien, plus reviews)
- **Classement** : Leaderboard des meilleurs reviewers
- **Moderation** : Signalement des reviews, gestion des signalements par les moderateurs
- **Profil** : Profil utilisateur avec statistiques et badges
- **Tableau de bord** : Resume de session, statistiques, moderation

## Stack technique

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth.js (Credentials Provider)
- Monaco Editor
- Zod (validation)
- ESLint + Prettier

## Prerequis

- Node.js 18+
- PostgreSQL 14+
- npm

## Installation

```bash
# 1. Installer les dependances
npm install

# 2. Creer le fichier d'environnement
cp .env.example .env

# 3. Adapter les variables dans .env
#    - DATABASE_URL : URL de connexion PostgreSQL
#    - NEXTAUTH_SECRET : cle secrete pour les sessions JWT

# 4. Initialiser la base de donnees
npx prisma db push

# 5. Demarrer le serveur de developpement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

## Scripts

| Commande               | Role                     |
| ---------------------- | ------------------------ |
| `npm run dev`          | Serveur de developpement |
| `npm run build`        | Compilation production   |
| `npm run start`        | Demarrage production     |
| `npm run lint`         | Verification ESLint      |
| `npm run typecheck`    | Verification TypeScript  |
| `npm run format`       | Formatage Prettier       |
| `npm run format:check` | Verification formatage   |

## Deploiement avec Docker

```bash
docker compose up -d
```

L'application est accessible sur `http://localhost:3000`. La base de donnees PostgreSQL est automatiquement provisionnee.

## Documentation

- [Architecture technique](ARCHITECTURE.md)
- [Guide utilisateur](USER_GUIDE.md)
- [Guide enseignant](TEACHER_GUIDE.md)
- [FAQ](FAQ.md)
- [Scenarios de tests](TEST_SCENARIOS.md)

## Structure du projet

```
app/              Pages et API Routes (App Router)
components/       Composants partages
features/         Modules fonctionnels
  auth/           Authentification
  snippets/       Gestion des snippets
  reviews/        Reviews et votes
  moderation/     Signalements et checklist
  reputation/     Badges
  leaderboard/    Classement
lib/              Prisma, session, badges, reputation
prisma/           Schema Prisma

## Limitations connues

- **Rate limiting en memoire** : Le rate limiting (`lib/rate-limit.ts`) utilise un compteur en memoire (Map process-local). En deploiement mono-instance (Docker seul), la limite s'applique correctement. En deploiement multi-instance (plusieurs replicas, serverless), chaque instance aurait son propre compteur : la limite effective deviendrait `N × limite declaree`. Si un deploiement distribue est envisage, migrer vers un store partage (Redis via Upstash, ou table Postgres avec UPSERT atomique).

- **Rate limiting et IP client** : Le rate limiting sur `/api/auth/register` identifie le client via l'entete `x-forwarded-for` (premier segment avant la virgule). Ce fonctionnement suppose que l'application est derriere un reverse proxy (Vercel, nginx, etc.) qui reecrit cet entete avec l'IP reelle du client avant qu'elle n'atteigne l'application. Ne pas exposer l'application directement sans un tel proxy.
```
