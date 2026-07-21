# Guide enseignant

## Installation

### Prerequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Etapes

```bash
# 1. Cloner le depot
git clone <url-du-projet> codementor
cd codementor

# 2. Installer les dependances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec les infos de connexion PostgreSQL et la secret key

# 4. Initialiser la base de donnees
npx prisma db push

# 5. Lancer le serveur de developpement
npm run dev
```

## Configuration de la moderation

Par defaut, les moderateurs doivent etre definis manuellement dans la base de donnees.

```sql
UPDATE "User" SET "isModerator" = true WHERE email = 'email.enseignant@exemple.fr';
```

Ou via le dashboard Prisma :

```bash
npx prisma studio
```

## Deploiement

Voir le guide de deploiement et le `Dockerfile` pour une mise en production.

Pour une version Docker :

```bash
docker compose up -d
```

## Utilisation en classe

### Deroulement suggere

1. Les etudiants creent un compte et se connectent.
2. Chaque etudiant soumet un snippet de code (exercice, projet, etc.).
3. Les etudiants reviewent les snippets de leurs camarades.
4. Les reviews sont notees et commentees ligne par ligne.
5. Les etudiants recoivent des badges et gagnent en reputation.

### Bonnes pratiques

- Encourager les reviews constructives (checklist qualite obligatoire).
- Utiliser le systeme de signalement pour les reviews inappropriees.
- Consulter le classement pour valoriser les etudiants les plus actifs.
- Le tableau de bord permet de suivre l'activite de chaque etudiant.

## Personnalisation

### Constants

- Modifier le nombre de snippets par page dans `features/snippets/constants.ts`.
- Ajouter/modifier les langages dans `features/snippets/constants.ts`.
- Modifier les seuils des badges dans `lib/badges.ts`.

### Badges

Les badges sont definis dans `lib/badges.ts`. Pour en ajouter un nouveau :

```typescript
{ slug: "mon-badge", label: "Mon Badge", description: "Description", check: (stats) => stats.condition }
```

### Checklist qualite

Les criteres de la checklist sont dans `features/moderation/schemas.ts`.
