# Vigilus Digital Business Cards

Application web pour des cartes de visite digitales NFC du Groupe Vigilus.

## Principe

La carte NFC ne stocke pas directement toutes les coordonnées. Elle stocke une URL stable :

```
https://votre-domaine.com/n/vig-demo-001
```

Cette URL peut rediriger soit vers :

- le profil digital : `/p/demo-vigilus`
- la vCard : `/p/demo-vigilus/contact.vcf`

Le mode est contrôlé par `nfcMode` dans le profil. Ainsi, une carte physique déjà distribuée reste valable lorsque le numéro, le poste, l'adresse ou la filiale change.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- CSS natif

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrir :

```
http://localhost:3000/p/demo-vigilus
```

Pour tester le parcours NFC :

```
http://localhost:3000/n/vig-demo-001
```

Pour tester l'import contact :

```
http://localhost:3000/p/demo-vigilus/contact.vcf
```

## Ajouter un collaborateur

Pour le MVP, les profils sont dans `src/lib/profiles.ts`.

Chaque profil contient notamment :

- nom / prénom
- poste
- filiale
- entreprise
- téléphone portable
- téléphone fixe
- e-mail
- site web
- adresse
- présentation
- photo
- réseaux sociaux
- token NFC
- mode NFC : `profile` ou `vcard`

## Mise en production recommandée

1. Déployer l'application sur un sous-domaine court, par exemple `card.groupevigilus.com`.
2. Encoder uniquement l'URL `https://card.groupevigilus.com/n/<token>` dans chaque puce NFC.
3. Verrouiller l'écriture du tag NFC après validation.
4. Ajouter ensuite une base de données et un back-office authentifié pour gérer les collaborateurs, désactiver une carte perdue et consulter les statistiques de scans.

## Important

Les données du profil de démonstration sont fictives, à l'exception des informations générales Vigilus déjà connues du projet. Remplacez-les avant toute mise en production.
