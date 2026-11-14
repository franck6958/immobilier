# Ébène Immobilier — site d'agence immobilière Next.js

Site d'agence immobilière réalisé d'après le cahier des charges « Création d'un site internet professionnel ».
Il sert de **modèle prêt à adapter** : tout le contenu de l'entreprise est centralisé dans deux fichiers.

**Stack** : Next.js 16 (App Router, Cache Components, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Motion (animations) · Lenis (défilement fluide) · Lucide (icônes).

---

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production (toutes les pages sont pré-générées)
npm start
```

## Adapter le site à un nouveau client

| Quoi | Où |
|---|---|
| Nom, slogan, téléphone, WhatsApp, e-mail, adresse, horaires, réseaux sociaux, agrément, mentions légales | `src/lib/site.ts` |
| **Biens** (prix, surface, chambres, photos, prestations, conseiller), services, avis, chiffres clés, équipe, quartiers, articles, FAQ | `src/lib/content.ts` |
| Couleurs, typographies, rayons, animations | `src/app/globals.css` (bloc `@theme`) et `src/app/layout.tsx` (polices) |
| Photos | `public/images/` (format WebP conseillé, 1600 px de large max) |
| Logo / favicon | `src/components/icons.tsx` (`LogoMark`) et `src/app/icon.svg` |

## Variables d'environnement (`.env.local`)

```bash
NEXT_PUBLIC_SITE_URL=https://www.domaine-du-client.com   # URL canonique (SEO, sitemap, Open Graph)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX                           # Google Analytics 4 (chargé uniquement après consentement)
RESEND_API_KEY=re_xxx                                    # envoi des formulaires par e-mail (https://resend.com)
MAIL_TO=contact@domaine-du-client.com                    # destinataire (par défaut : site.contact.email)
MAIL_FROM="Site web <noreply@domaine-du-client.com>"     # expéditeur (domaine vérifié chez Resend)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxx                    # reCAPTCHA v2 case à cocher — clé du site (publique)
RECAPTCHA_SECRET_KEY=6Lxxxx                              # reCAPTCHA v2 case à cocher — clé secrète (serveur)
```

Sans `RESEND_API_KEY`, les demandes sont simplement écrites dans les journaux du serveur (mode démo).

Sans les clés reCAPTCHA, la vérification anti-robot est désactivée (le champ piège et le délai minimal restent actifs). Créez les clés sur https://www.google.com/recaptcha/admin (type **reCAPTCHA v2 › case à cocher « Je ne suis pas un robot »**, ajoutez le domaine du site et `localhost`). Le fichier `.env.local` contient pour l'instant les **clés de test de Google** (la case s'affiche avec un avertissement rouge et accepte tout) : remplacez-les avant la mise en ligne.

---

## Correspondance avec le cahier des charges

### Arborescence (§3.1)
Accueil · Nos biens (catalogue filtrable) + une fiche par bien · Services (achat, vente, location, gestion locative, estimation, diaspora) + une page par service · L'agence · Avis · Blog (+ articles) · Contact · Votre projet (formulaire en 3 étapes) · Mentions légales · Confidentialité & cookies · Page 404 personnalisée.

Les anciennes adresses `/realisations` et `/devis` redirigent (301) vers `/biens` et `/demande`.

### Fonctionnalités front-office (§4.1)
- **Responsive, mobile d'abord** ; menu fixe qui se masque au défilement, menu plein écran sur mobile, **fil d'Ariane** sur les pages internes.
- **Recherche de biens** depuis l'accueil (acheter/louer, type, ville) et **catalogue filtrable** (transaction, type, ville, tri) dont les filtres sont dans l'URL : un lien filtré peut être partagé sur WhatsApp.
- **Fiche bien** : galerie avec plein écran, caractéristiques, prestations, conseiller dédié, bouton « Je suis intéressé(e) » (WhatsApp prérempli avec la référence), demande de visite, biens similaires.
- **Formulaire de contact** et **formulaire projet en 3 étapes** (acheter, louer, vendre, mettre en location, gestion, investir ; prérempli depuis une fiche bien) : validation, erreurs sous chaque champ, confirmation, **anti-spam** (case Google reCAPTCHA « Je ne suis pas un robot » + champ piège + délai minimal), envoi par e-mail.
- **Appel en un clic**, **bouton WhatsApp flottant**, lien **itinéraire Google Maps**.
- **Carte Google Maps** chargée à la demande (aucun cookie tiers avant le clic).
- **Avis clients** (carrousel, page dédiée, note Google), **partage** des articles (WhatsApp, Facebook, LinkedIn).
- **Bandeau cookies** : Google Analytics n'est chargé qu'après consentement explicite.

### Animations
Titres révélés mot à mot, rideau de transition entre les pages, parallaxe, images dévoilées au défilement, compteurs animés, section « Biens à la une » à **défilement horizontal épinglé**, aperçu d'image qui suit le curseur sur la liste des services, boutons « magnétiques », bandeaux défilants, ligne de progression de la méthode et de la lecture.
Toutes les animations respectent le réglage système **« réduire les animations »**.

### Accessibilité (§5.3 — WCAG 2.1 AA visé)
Contrastes ≥ 4,5:1, lien d'évitement, focus visible, navigation clavier (menu, FAQ, carrousel, galerie, comparateur), libellés visibles sur tous les champs, erreurs reliées par `aria-describedby`, zones tactiles ≥ 44 px, textes alternatifs.

### SEO (§7)
Titre et méta-description uniques par page, URL lisibles, balises canoniques, `sitemap.xml`, `robots.txt`, Open Graph + image de partage générée, données structurées **schema.org** (RealEstateAgent, RealEstateListing avec prix, ItemList, Service, FAQPage, BlogPosting, Review, BreadcrumbList), hiérarchie H1/H2/H3, maillage interne.

### Performance (§6.3)
Pages pré-générées (statiques), images WebP redimensionnées automatiquement par `next/image` avec chargement différé, polices auto-hébergées, aucun script tiers avant consentement.

---

## Comptes propriétaires & tableau de bord admin (Supabase)

Le site utilise **Supabase** (projet `ebene-immobilier`, région Paris) pour la base de données, les comptes et le stockage des photos. Les clés publiques sont dans `.env.local` (non versionné) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nivwnfuwjwmljbbszocr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### Parcours
- **Propriétaire** : `/inscription` → `/espace` (mes biens, statut de chaque annonce, motif de refus) → `/espace/biens/nouveau` (formulaire + envoi de photos, redimensionnées en WebP dans le navigateur) → l'annonce est **en attente de validation**.
- **Admin** : `/admin` (chiffres clés, annonces à valider, dernières demandes) · `/admin/biens` (publier, refuser avec motif, archiver, modifier, supprimer, ajouter un bien de l'agence, badges, conseiller) · `/admin/demandes` (tous les formulaires du site, statut nouveau / en cours / traité, contact en un clic) · `/admin/utilisateurs` (propriétaires inscrits, donner ou retirer les droits admin).
- Une publication / modification invalide le cache : le bien apparaît (ou disparaît) immédiatement sur `/biens`.

### Sécurité (appliquée par la base, impossible à contourner depuis le navigateur)
- Règles RLS : un visiteur ne lit que les biens publiés ; un propriétaire ne voit et ne modifie que ses biens ; seuls les admins lisent les demandes et les profils.
- Déclencheurs : un propriétaire ne peut ni publier lui-même, ni s'attribuer un badge, ni changer son rôle ; toute modification d'une annonce la renvoie en validation.
- Photos : chaque propriétaire n'écrit que dans son propre dossier ; supprimer une annonce supprime ses photos.

### À configurer dans le tableau de bord Supabase avant la mise en ligne
1. **Authentication → URL Configuration** : *Site URL* = l'adresse du site en production ; ajouter dans *Redirect URLs* `https://votre-domaine/auth/confirm` (et `http://localhost:3456/auth/confirm` pour les tests).
2. **Authentication → SMTP** : brancher un fournisseur d'e-mails (ex. Resend). **Sans cela, Supabase n'envoie les e-mails (confirmation d'inscription, mot de passe oublié) qu'aux membres de votre équipe Supabase** : les propriétaires ne recevraient rien. Solution provisoire : désactiver *Confirm email* (Authentication → Providers → Email) ; le site connecte alors directement le propriétaire après l'inscription.
3. **Authentication → Password security** : activer la protection contre les mots de passe divulgués.
4. Donner les droits admin à votre propre compte : inscrivez-vous sur le site, puis depuis le compte admin fourni → *Utilisateurs* → « Rendre admin ».

### Base de données
Le schéma est versionné dans les migrations Supabase du projet (`init_schema`, `guards_trust_internal_roles`, `profiles_email`, `storage_select_own_folder`…). Après une modification du schéma, régénérer `src/lib/supabase/database.types.ts`.

---

## Non couvert par ce modèle (à prévoir selon la formule vendue)

- **Contenus éditoriaux** (services, articles de blog, avis, équipe) : toujours dans `src/lib/content.ts`. Les **biens** sont, eux, gérés depuis le tableau de bord admin.
- **Modules optionnels (§4.3)** : alertes e-mail sur nouveaux biens, prise de rendez-vous de visite en ligne, espace propriétaire (relevés de gestion), paiement des loyers Mobile Money, multilingue, carte des biens.
- **Contenus réels** : l'agence, les biens, prix, chiffres, avis et coordonnées sont fictifs ; les photos proviennent d'Unsplash (licence libre) et doivent idéalement être remplacées par des photos réelles du client (§5.1).
- Recherche interne : non nécessaire sous 15 pages (§4.1).

---

## Vérification des propriétaires (pièces justificatives)

Un bien déposé par un propriétaire **ne peut être publié** que si :

1. **son compte est vérifié** : CNI recto + verso (obligatoires), photo tenant la CNI et justificatif de domicile (facultatifs), validés par l'agence ;
2. **au moins un justificatif de propriété est validé** pour ce bien : titre foncier, acte de vente notarié ou certificat de propriété (plan cadastral, procuration et autres documents en complément).

Cette règle est appliquée **par la base de données** (déclencheur `guard_property`) : elle ne peut pas être contournée, même par un appel direct à l'API. Les biens de l'agence (ajoutés par un admin) ne sont pas concernés.

- Propriétaire : **Espace → Vérification** pour les pièces d'identité ; section **Justificatifs de propriété** sur la fiche de chaque bien.
- Admin : **Vérifications** (file d'attente des comptes et des justificatifs), fiche utilisateur (valider / refuser chaque pièce avec motif, puis valider le compte), fiche bien (justificatifs + raisons qui bloquent la publication).
- Les pièces sont dans le stockage **privé** `owner-documents` (jamais public) ; l'admin les consulte via des liens signés valables 10 minutes. Les photos sont réduites à 2400 px côté navigateur, les PDF envoyés tels quels (10 Mo max).
- La règle ne s'applique qu'au **passage** à « Publié » : les annonces déjà en ligne avant cette fonctionnalité restent publiées.
