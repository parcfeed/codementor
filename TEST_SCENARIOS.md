# Scenarios de tests manuels

## Contexte

Les tests suivants doivent etre realises sur une instance locale avec une base de donnees fraiche (`npx prisma db push`). Creer au moins 2 comptes utilisateur pour tester les interactions.

## Test 1 : Inscription et connexion

| Etape | Action                                                | Attendu                          |
| ----- | ----------------------------------------------------- | -------------------------------- |
| 1.1   | Acceder à `/register`                                 | Formulaire d'inscription affiche |
| 1.2   | Remplir nom, email, mot de passe valides et soumettre | Redirection vers `/dashboard`    |
| 1.3   | Cliquer sur "Se deconnecter"                          | Redirection vers `/login`        |
| 1.4   | Saisir email et mot de passe et soumettre             | Redirection vers `/dashboard`    |
| 1.5   | Acceder à `/snippets` sans etre connecte              | Redirection vers `/login`        |

## Test 2 : Creation de snippet

| Etape | Action                                    | Attendu                                              |
| ----- | ----------------------------------------- | ---------------------------------------------------- |
| 2.1   | Connecte-toi, va sur `/snippets/new`      | Formulaire de creation affiche                       |
| 2.2   | Selectionner un langage et ecrire du code | L'editeur affiche le code avec coloration syntaxique |
| 2.3   | Soumettre sans selectionner de langage    | Message d'erreur "Langage requis"                    |
| 2.4   | Soumettre avec langage et code valides    | Redirection vers la page de detail du snippet        |
| 2.5   | Verifier le detail                        | Le langage, le code et la date s'affichent           |

## Test 3 : Liste et filtres

| Etape | Action                                                   | Attendu                               |
| ----- | -------------------------------------------------------- | ------------------------------------- |
| 3.1   | Acceder à `/snippets`                                    | Liste des snippets affichee           |
| 3.2   | Saisir un mot-cle dans la recherche et cliquer "Filtrer" | Les snippets sont filtres             |
| 3.3   | Changer le filtre de langage                             | Les snippets sont filtres par langage |
| 3.4   | Changer le tri                                           | L'ordre des snippets change           |
| 3.5   | Si plusieurs pages, cliquer sur "Suivante"               | Page suivante affichee                |

## Test 4 : Review

| Etape | Action                                                                                  | Attendu                                             |
| ----- | --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 4.1   | Connecte-toi avec un autre compte                                                       | -                                                   |
| 4.2   | Ouvrir un snippet cree par un autre utilisateur                                         | Le formulaire de review est visible                 |
| 4.3   | Cliquer sur "Soumettre la review" sans note ni checklist                                | Message d'erreur ou bouton desactive                |
| 4.4   | Cocher seulement 3 criteres sur 4 et soumettre                                          | Message d'erreur "Tu dois cocher tous les criteres" |
| 4.5   | Ajouter une note, cocher tous les criteres, ajouter un commentaire ligne 1 et soumettre | Review creee, formulaire reinitialise               |
| 4.6   | Verifier que la review apparait dans la section des reviews                             | Review affichee avec note et commentaires           |

## Test 5 : Votes

| Etape | Action                                               | Attendu                                         |
| ----- | ---------------------------------------------------- | ----------------------------------------------- |
| 5.1   | Avec un 3e compte, ouvrir un snippet avec une review | Les boutons de vote sont visibles               |
| 5.2   | Cliquer sur le vote positif                          | Le score augmente de 1, le bouton devient vert  |
| 5.3   | Cliquer a nouveau sur le vote positif                | Vote annule, score revient a la valeur initiale |
| 5.4   | Cliquer sur le vote negatif                          | Le score diminue de 1, le bouton devient rouge  |
| 5.5   | Verifier que l'auteur de la review ne peut pas voter | Boutons desactives (opacite reduite)            |

## Test 6 : Signalement

| Etape | Action                                          | Attendu                                |
| ----- | ----------------------------------------------- | -------------------------------------- |
| 6.1   | Cliquer sur "Signaler" sous une review          | Fenetre modale affichee                |
| 6.2   | Soumettre sans raison                           | Message d'erreur                       |
| 6.3   | Saisir une raison (10+ caracteres) et soumettre | Message de succes "Signalement envoye" |

## Test 7 : Moderation

| Etape | Action                                                         | Attendu                                    |
| ----- | -------------------------------------------------------------- | ------------------------------------------ |
| 7.1   | Definir un utilisateur comme moderateur (`isModerator = true`) | -                                          |
| 7.2   | Connecte-toi avec ce compte moderateur                         | -                                          |
| 7.3   | Acceder à `/moderation`                                        | Liste des signalements en attente affichee |
| 7.4   | Cliquer sur "Marquer comme traite"                             | Le statut du signalement passe à "Traite"  |
| 7.5   | Cliquer sur l'onglet "Archive"                                 | Le signalement apparait dans les archives  |

## Test 8 : Profil et badges

| Etape | Action                                                        | Attendu                                 |
| ----- | ------------------------------------------------------------- | --------------------------------------- |
| 8.1   | Acceder à `/profile`                                          | Nom, email, reputation, badges affiches |
| 8.2   | Creer des reviews avec un compte jusqu'a atteindre les seuils | Les badges correspondants apparaissent  |
| 8.3   | Verifier le compteur de snippets et de reviews                | Les nombres sont corrects               |

## Test 9 : Classement

| Etape | Action                              | Attendu                                     |
| ----- | ----------------------------------- | ------------------------------------------- |
| 9.1   | Acceder à `/leaderboard`            | Liste des utilisateurs tries par reputation |
| 9.2   | Verifier les informations affichees | Nom, reputation, nombre de reviews, badges  |

## Test 10 : Tableau de bord

| Etape | Action                                      | Attendu                                      |
| ----- | ------------------------------------------- | -------------------------------------------- |
| 10.1  | Acceder à `/dashboard`                      | Resume de session + statistiques             |
| 10.2  | Verifier les statistiques                   | Snippets, reviews, reputation, votes, badges |
| 10.3  | Moderateur : verifier la section moderation | Nombre de signalements en attente            |

## Test 11 : Gestion des erreurs

| Etape | Action                                               | Attendu                                         |
| ----- | ---------------------------------------------------- | ----------------------------------------------- |
| 11.1  | Acceder à `/snippets/0000-0000-0000` (ID inexistant) | Page 404 "Page introuvable"                     |
| 11.2  | Acceder à `/forbidden` directement                   | Page "Acces refuse"                             |
| 11.3  | Observer les ecrans de chargement                    | Les skeletons s'affichent pendant le chargement |
