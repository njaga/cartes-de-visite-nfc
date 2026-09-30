# Vigilus Digital Business Cards

Application interne de gestion des cartes de visite digitales NFC du Groupe Vigilus.

## URL publique temporaire

Pour le moment, l’application utilise `https://cartes-de-visite-nfc.vercel.app` comme domaine public pour les liens NFC, QR et vCard. Cette valeur est centralisée dans `src/lib/site-url.ts` et pourra être remplacée plus tard par un domaine personnalisé sans changer les tokens NFC.

## Principe

La carte physique ne stocke qu'une URL stable :

\`\`\`
https://cartes-de-visite-nfc.vercel.app/n/<token>
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
NEXT_PUBLIC_SITE_URL=https://cartes-de-visite-nfc.vercel.app
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
https://cartes-de-visite-nfc.vercel.app/n/<token>
\`\`\`

Après test sur iPhone et Android, verrouiller l'écriture du tag NFC. Ne jamais encoder le numéro, l'e-mail ou la vCard complète directement dans la puce : ces données doivent rester modifiables depuis l'application.

## Profil de démonstration

Au premier démarrage d'une base vide, un profil de démonstration est créé automatiquement. Ses données personnelles sont fictives et doivent être remplacées avant mise en production.


## Workflow mobile de programmation NFC

L'administration comporte désormais un écran dédié :

\`\`\`
/admin/cartes/<id>/programmer
\`\`\`

Depuis le téléphone :

1. ouvrir la fiche du collaborateur dans l'administration ;
2. toucher **Programmer le NFC** ;
3. copier ou partager l'URL NFC affichée ;
4. ouvrir NFC Tools ;
5. **Écrire → Ajouter un enregistrement → URL / URI** ;
6. coller l'URL ;
7. lancer l'écriture puis approcher la carte NFC du téléphone ;
8. revenir dans l'administration et marquer la carte comme **Programmée** ;
9. tester physiquement la carte ;
10. si le bon profil s'ouvre, marquer la carte **Programmée et testée**.

Les statuts disponibles sont :

- **À programmer** ;
- **Programmée, à tester** ;
- **Programmée et testée**.

Le tableau de bord permet de voir immédiatement quelles cartes sont encore à préparer.

## Utilisation mobile

L'application expose un manifeste PWA et peut être ajoutée à l'écran d'accueil du téléphone. L'espace d'administration est responsive afin que la programmation puisse être réalisée directement à côté des cartes physiques.

Le profil public propose également un accès WhatsApp. Le numéro WhatsApp peut être différent du téléphone portable ; s'il n'est pas renseigné, le portable peut être utilisé comme point de départ dans l'administration.


## Import Excel massif

L'écran \`/admin/import\` permet d'importer un fichier \`.xlsx\`.

Un modèle est téléchargeable depuis \`/api/import-template\`.

L'e-mail sert d'identifiant de rapprochement :
- nouvel e-mail : création d'une carte avec nouveau token NFC ;
- e-mail existant : mise à jour de la fiche en conservant le token NFC et le statut de programmation.

Les colonnes minimales sont : Prénom, Nom, Poste et Email.

## Upload des photos

Les photos peuvent être importées directement depuis la fiche collaborateur.

Formats acceptés :
- JPG ;
- PNG ;
- WEBP ;
- 4 Mo maximum.

Les fichiers sont stockés dans le dossier persistant associé à \`DB_PATH\`, sous \`uploads/\`, puis servis par la route \`/uploads/<fichier>\`.

## Identité visuelle par filiale

L'écran \`/admin/filiales\` permet de configurer pour chaque filiale :
- couleur principale ;
- couleur accent ;
- logo par URL ou upload.

La configuration est utilisée automatiquement sur le profil digital et les fichiers de carte physique.

## Carte physique recto-verso

Chaque fiche collaborateur propose l'écran :

\`/admin/cartes/<id>/impression\`

Le système génère :
- un recto avec identité, poste, filiale, photo et coordonnées ;
- un verso NFC + QR ;
- deux fichiers SVG téléchargeables au format fini 85,6 × 54 mm.

Les SVG restent vectoriels pour le BAT et l'impression. Le fond perdu doit être ajouté selon les contraintes de l'imprimeur.


## Identité Vigilus et BAT imprimeur

Les logos sont stockés localement dans \`public/branding/\` et ne dépendent pas d'URLs distantes.

Matrice par défaut :

- \`VIGILUS Group\`, Vigilus Sénégal, Vigilus Guinée et Vigilus Côte d’Ivoire → \`vigilus-groupe-sa.png\` ;
- Vigilus Sierra Leone et Vigilus Facilities → \`vigilus-facilities.png\` ;
- Vigilus Mobility → \`vigilus-mobility.png\` ;
- Vigilus Properties → \`vigilus-properties.png\` ;
- Vigilus International et Vigilus Dubaï → \`vigilus-international.png\`.

Le fichier historique \`vigilus-logo.png\` correspond au logo Facilities fourni initialement et est conservé uniquement pour compatibilité. La base migre automatiquement ces anciennes références vers le logo correspondant à la filiale.

L'écran \`/admin/cartes/<id>/impression\` propose :
- un aperçu réaliste recto/verso ;
- les SVG autonomes avec logo et photo incorporés ;
- un PDF imprimeur 2 pages ;
- 3 mm de fond perdu ;
- repères de coupe ;
- TrimBox au format fini 85,6 × 54 mm ;
- BleedBox au format 91,6 × 60 mm ;
- QR code vectoriel.
