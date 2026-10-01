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

Le projet utilise **Neon PostgreSQL** via `@neondatabase/serverless`.

La variable obligatoire est :

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
```

Le schéma comprend :

- `cards` : profils et état de programmation NFC ;
- `scans` : scans NFC / QR ;
- `brand_configs` : identité visuelle par filiale ;
- `media_assets` : photos et logos uploadés.

Le fichier `database/schema.sql` documente le schéma. L'application initialise également les tables manquantes au premier accès pour faciliter un nouveau déploiement.

## Configuration

Copier \`.env.example\` vers \`.env.local\` :

\`\`\`env
NEXT_PUBLIC_SITE_URL=https://cartes-de-visite-nfc.vercel.app

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

En développement uniquement (`npm run dev`), si `DATABASE_URL` est absente, `/p/demo-vigilus` et sa vCard restent consultables avec les données de démonstration et l’identité visuelle par défaut. Les autres profils restent introuvables. Cette solution d’aperçu ne s’applique ni à la production, ni à l’administration, ni aux écritures en base.

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
- 4 Mo maximum pour l’ensemble des images sélectionnées dans un même enregistrement (portrait, couverture et services réunis).

Pour ajouter davantage d’images, enregistrez la fiche puis importez les suivantes. La limite est vérifiée dans le navigateur et sur le serveur avant tout enregistrement de fichier. Les Server Actions acceptent une requête de 4,5 Mo afin de laisser de la place aux autres champs du formulaire.

Les fichiers sont stockés dans la table PostgreSQL `media_assets`, puis servis par la route `/uploads/<fichier>`.

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


## Déploiement Vercel + Neon

Production actuelle :

```
https://cartes-de-visite-nfc.vercel.app
```

Le projet Vercel doit définir `DATABASE_URL` avec la chaîne de connexion Neon. Les liens NFC, QR et vCard continuent d'utiliser l'URL publique stable définie par `NEXT_PUBLIC_SITE_URL`.

La couche SQLite historique a été retirée afin d'éviter toute écriture dans `/var/task`, qui est en lecture seule sur Vercel.


> État production : Neon est connecté au projet Vercel ; les déploiements utilisent PostgreSQL via `DATABASE_URL`.


## Profil public commercial

Chaque carte peut maintenant servir de support commercial léger avec des champs optionnels :

- services / expertises ;
- CTA commercial principal ;
- offre ou actualité mise en avant avec dates de début et de fin ;
- brochure ou catalogue ;
- message WhatsApp prérempli.

Le profil public distingue le collaborateur et son entreprise. L’administration permet aussi de configurer une photo de couverture (`coverUrl`), la présentation de l’entreprise (`companyPresentation`), une image par service (`serviceImages`, associées au nom du service) et un lien d’agenda externe (`appointmentUrl`). Sans agenda, le visiteur prépare une demande de rendez-vous à transmettre au collaborateur. La carte et l’itinéraire utilisent l’adresse des bureaux.

Ces champs sont optionnels et ajoutés automatiquement aux bases existantes. Les imports Excel conservent les images des services et acceptent les colonnes facultatives « Couverture URL », « Présentation entreprise » et « Rendez-vous URL ».

Les blocs vides ne sont jamais affichés. Une offre n'apparaît que pendant sa période de validité lorsqu'une date est renseignée. Le profil conserve donc un rendu sobre même si certains collaborateurs n'utilisent pas les fonctions commerciales.

La section « Suivez-nous » utilise les pages de l’entreprise configurées dans `/admin/filiales` (`brand_configs.social_links`), séparément des réseaux personnels du collaborateur. Les filiales Vigilus héritent des liens [Facebook](https://www.facebook.com/vigilusgroupe), [LinkedIn](https://www.linkedin.com/company/vigilus-facilities) et [Instagram](https://www.instagram.com/vigilusfacilities) publiés sur le [site officiel Vigilus Facilities](https://vigilus-facilities.com/), vérifiés le 1er octobre 2026. Une valeur SQL `NULL` conserve ces liens par défaut ; enregistrer des champs vides stocke `[]` et les masque. Les entreprises hors de la liste des filiales Vigilus n’héritent d’aucun réseau social. Le LinkedIn personnel reste configurable sur la fiche du collaborateur.
