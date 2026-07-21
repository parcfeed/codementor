# Plan d'implementation - Optimisation des performances DB

## Checklist

- [x] Step 1 - Creer ou ameliorer `prisma/seed.ts` pour initialiser les badges une seule fois.
- [x] Step 2 - Configurer la commande Prisma seed.
- [x] Step 3 - Remplacer les upsert badges en runtime par une lecture cachee.
- [x] Step 4 - Optimiser les statistiques du dashboard avec des agregations SQL.
- [x] Step 5 - Remplacer les `include` inutiles par des `select` cibles.
- [x] Step 6 - Ajouter les index SQL utiles.
- [x] Step 7 - Regenerer Prisma et valider lint/typecheck/build.
