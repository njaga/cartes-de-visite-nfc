# Vigilus Digital Business Cards

Application interne de gestion des cartes de visite digitales NFC du Groupe Vigilus.

## Principe

La carte physique ne stocke qu'une URL stable :

\`\`\`
https://card.groupevigilus.com/n/<token>
\`\`\`

Le token reste le même pendant toute la durée de vie de la carte. Les coordonnées, le poste, la filiale, les réseaux sociaux et le comportement après scan sont modifiés depuis l'administration sans reprogrammer la puce NFC.

## Parcours publics

- \`/n/<token>\` : URL à écrire dans la puce NFC.
- \`/p/<slug>\` : carte de visite digitale.
- \`/p/<slug>/contact.vcf\` : vCard importable dans l'application Contacts.
- \`/api/qr/<token>\` : QR code SVG correspondant à la carte.
- \`/api/qr/<token>?download=1\` : téléchargement du QR code.

Le QR encode \`?src=qr\`. Un accès à l'URL NFC sans ce paramètre est comptabilisé comme NFC.

## Administration

- \`/admin/login\` : connexion.
- \`/admin\` : tableau de bord, parc de cartes et statistiques.
- \`/admin/cartes/nouvelle\` : création d'une carte.
- \`/admin/cartes/<id>\` : modification, QR code et URL NFC.

L'administration permet de :

- créer une carte pour un collaborateur ;
- gérer nom, prénom, poste et filiale ;
- gérer téléphone portable et fixe ;
- gérer e-mail, site et adresse ;
- ajouter une présentation et une photo via URL ;
- ajouter LinkedIn, Facebook, Instagram et X ;
- choisir entre ouverture du profil digital et ouverture directe de la vCard ;
- activer ou désactiver une carte perdue ou retirée ;
- générer et télécharger le QR code ;
- suivre les scans NFC et QR ;
- consulter les cartes les plus scannées.

Aucune adresse IP brute n'est enregistrée par le module de statistiques.

## Base de données

Le projet utilise SQLite avec \`better-sqlite3\`.

Par défaut :

\`\`\`
./data/vigilus-cards.db
\`\`\`

Le chemin peut être changé avec \`DB_PATH\`.

SQLite convient à un serveur Node/VPS avec disque persistant. Pour un déploiement serverless à stockage éphémère, utiliser ensuite PostgreSQL ou MySQL. Les routes publiques ont été séparées de la couche de stockage pour faciliter cette migration.

## Configuration

Copier \`.env.example\` vers \`.env.local\` :

\`\`\`env
NEXT_PUBLIC_SITE_URL=https://card.groupevigilus.com
DB_PATH=./data/vigilus-cards.db

ADMIN_EMAIL=admin@groupevigilus.com
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
\`\`\`

Utiliser un mot de passe fort et une valeur \`ADMIN_SESSION_SECRET\` longue et aléatoire en production.

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Puis ouvrir :

\`\`\`
http://localhost:3000/admin/login
\`\`\`

## NFC

Pour chaque carte physique, écrire uniquement :

\`\`\`
https://card.groupevigilus.com/n/<token>
\`\`\`

Après test sur iPhone et Android, verrouiller l'écriture du tag NFC. Ne jamais encoder le numéro, l'e-mail ou la vCard complète directement dans la puce : ces données doivent rester modifiables depuis l'application.

## Profil de démonstration

Au premier démarrage d'une base vide, un profil de démonstration est créé automatiquement. Ses données personnelles sont fictives et doivent être remplacées avant mise en production.
