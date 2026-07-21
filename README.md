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
```
