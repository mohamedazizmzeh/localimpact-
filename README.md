# LocalImpact

Plateforme de signalement et de suivi des problèmes du quotidien (campus, résidence, quartier).

## 📋 Description

LocalImpact permet aux utilisateurs de signaler des problèmes (matériel défectueux, accessibilité, éclairage, propreté, équipement informatique…) et de suivre leur résolution. Chaque signalement passe par un cycle de vie : **nouveau → pris en charge → en cours → résolu**.

Trois rôles sont gérés avec des permissions distinctes : **Utilisateur**, **Responsable** et **Administrateur**.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | NextAuth v4 (Credentials provider) |
| Password hashing | bcryptjs |

## ✅ Fonctionnalités (état actuel)

### Module Authentification (terminé)

- Inscription avec nom, email et mot de passe
- Connexion / déconnexion
- Sessions JWT signées, cookie `HttpOnly`
- Trois rôles : `USER`, `RESPONSIBLE`, `ADMIN`
- Contrôle d'accès **côté serveur** à trois niveaux :
  - Middleware d'edge (`src/middleware.ts`)
  - Helpers `requireAuth()` / `requireRole()` dans les pages
  - Vérifications dans les routes API
- Pages protégées : `/dashboard`, `/profile`, `/responsible`, `/admin`
- Page `/unauthorized` pour les accès refusés
- **Gestion du profil** : modification du nom et de l'email (le rôle est en lecture seule)
- **Rafraîchissement du JWT** après modification du profil (les données mises à jour apparaissent immédiatement)
- Script de seed avec 3 comptes de démonstration

### Modules à venir

- Signalements (création, liste, filtres, recherche, soutien)
- Attribution à un responsable
- Changement de statut + historique
- Commentaires
- Tableau de bord statistiques
- Notifications
- Carte interactive

## 🚀 Installation

### Prérequis

- Node.js 18+ (recommandé : 20+)
- PostgreSQL 14+ (local ou distant)
- npm

### Étapes

**1. Cloner le dépôt**

```bash
git clone <repo-url>
cd localimpact
```

**2. Installer les dépendances**

```bash
npm install --legacy-peer-deps
```

> Le flag `--legacy-peer-deps` est requis car NextAuth v4 déclare une plage de compatibilité qui n'inclut pas encore Next.js 16, même s'il fonctionne parfaitement.

**3. Créer le fichier `.env` à partir du template**

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Puis ouvrir `.env` et renseigner `DATABASE_URL` avec vos identifiants PostgreSQL (voir la section **Configuration** ci-dessous).

**4. Créer la base de données**

Dans **pgAdmin** : clic droit sur `Databases` → `Create` → `Database` → nom : `localimpact`

Ou en ligne de commande `psql` :

```sql
CREATE DATABASE localimpact;
```

**5. Appliquer les migrations Prisma**

```bash
npx prisma migrate dev
```

**6. Créer les comptes de démonstration**

```bash
npm run db:seed
```

**7. Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## ⚙️ Configuration

Créer un fichier `.env` à la racine du projet (ou copier `.env.example`) :

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/localimpact?schema=public"
NEXTAUTH_SECRET="a-long-random-string-generated-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### Générer un `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

### Notes importantes

- Le mot de passe PostgreSQL dans `DATABASE_URL` doit être **URL-encodé** s'il contient des caractères spéciaux :
  - `@` → `%40`
  - `#` → `%23`
  - `:` → `%3A`
  - `/` → `%2F`
  - `?` → `%3F`
- Ne **jamais** committer le fichier `.env`. Il est déjà dans `.gitignore`.

## 👥 Comptes de démonstration

Après avoir exécuté `npm run db:seed`, trois comptes sont disponibles :

| Rôle | Email | Mot de passe | Accès |
|---|---|---|---|
| Utilisateur | `user@demo.com` | `password123` | Dashboard + Profile |
| Responsable | `responsible@demo.com` | `password123` | Dashboard + Profile + Responsable |
| Administrateur | `admin@demo.com` | `password123` | Toutes les pages |

## 🔐 Sécurité et contrôle d'accès

### Trois niveaux de protection

LocalImpact applique les permissions à **trois niveaux** (défense en profondeur) :

**1. Middleware d'edge** — `src/middleware.ts`

Exécuté avant le rendu de la page. Bloque immédiatement les requêtes non autorisées, sans consommer de ressources côté serveur.

```typescript
// Extrait de src/middleware.ts
if (path.startsWith("/admin") && token?.role !== "ADMIN") {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
```

**2. Helpers de page** — `src/lib/auth.ts`

Utilisés dans chaque page protégée pour valider la session et le rôle.

```typescript
import { requireAuth, requireRole } from "@/lib/auth";

// Exige une session valide
const session = await requireAuth();

// Exige un rôle spécifique
const session = await requireRole(["ADMIN"]);
```

**3. Vérifications dans les API routes**

Toute route API sensible vérifie la session avant d'agir.

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Matrice de permissions

| Route | Guest | USER | RESPONSIBLE | ADMIN |
|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/login`, `/register` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard` | ❌ → `/login` | ✅ | ✅ | ✅ |
| `/profile` | ❌ → `/login` | ✅ | ✅ | ✅ |
| `/responsible` | ❌ → `/login` | ❌ → `/unauthorized` | ✅ | ✅ |
| `/admin` | ❌ → `/login` | ❌ → `/unauthorized` | ❌ → `/unauthorized` | ✅ |

### Sécurité des sessions

- Mots de passe hachés avec **bcrypt** (10 rounds)
- Sessions JWT signées avec `NEXTAUTH_SECRET`
- Cookie `HttpOnly` (protection XSS)
- Cookie `SameSite=Lax` (protection CSRF)
- Rafraîchissement du JWT après modification du profil via `useSession().update()`

### Gestion du profil

Le endpoint `PATCH /api/profile` permet à un utilisateur connecté de modifier son **nom** et son **email**. Le **rôle est ignoré côté serveur** — même si un client malveillant l'envoie dans le corps de la requête, il est rejeté. Cela empêche toute auto-promotion.

## 📜 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run db:seed` | Remplit la base avec les comptes démo |
| `npx prisma studio` | Ouvre l'interface de gestion de la base |
| `npx prisma migrate dev` | Applique les migrations Prisma |

## 📁 Structure du projet

```
localimpact/
├── prisma/
│   ├── schema.prisma           # Modèles de données
│   ├── seed.ts                 # Comptes de démonstration
│   └── migrations/             # Historique des migrations
├── src/
│   ├── middleware.ts           # Protection des routes (edge)
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # Config NextAuth
│   │   │   ├── register/route.ts             # API inscription
│   │   │   └── profile/route.ts              # API mise à jour du profil
│   │   ├── admin/page.tsx                    # Zone admin (ADMIN)
│   │   ├── dashboard/page.tsx                # Tableau de bord
│   │   ├── login/page.tsx                    # Connexion
│   │   ├── profile/page.tsx                  # Profil utilisateur
│   │   ├── register/page.tsx                 # Inscription
│   │   ├── responsible/page.tsx              # Zone responsable
│   │   ├── unauthorized/page.tsx             # Accès refusé
│   │   ├── layout.tsx
│   │   ├── providers.tsx                     # SessionProvider
│   │   └── page.tsx
│   ├── components/
│   │   ├── LogoutButton.tsx
│   │   └── ProfileForm.tsx                   # Formulaire de profil
│   ├── lib/
│   │   ├── auth.ts             # Helpers requireAuth / requireRole
│   │   └── prisma.ts           # Client Prisma singleton
│   └── types/
│       └── next-auth.d.ts      # Types étendus de session
├── .env                        # (non committé)
├── .env.example                # Template
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## 🧪 Tester les permissions

### Test manuel via le navigateur

1. Se déconnecter via [http://localhost:3000/api/auth/signout](http://localhost:3000/api/auth/signout)
2. Se connecter avec un compte
3. Tester les URLs `/admin`, `/responsible`, `/dashboard`, `/profile`

### Test serveur via curl

```bash
# 1. Récupérer un token CSRF
curl -c cookies.txt -s http://localhost:3000/api/auth/csrf

# 2. Se connecter (remplacer TOKEN par la valeur retournée)
curl -b cookies.txt -c cookies.txt -s -X POST \
  http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=user@demo.com&password=password123&csrfToken=TOKEN&callbackUrl=http://localhost:3000/dashboard"

# 3. Vérifier la session
curl -b cookies.txt -s http://localhost:3000/api/auth/session

# 4. Tester les permissions
curl -b cookies.txt -s -o NUL -w "%{http_code}\n" http://localhost:3000/admin
# → 307 (bloqué par le middleware, redirige vers /unauthorized)
curl -b cookies.txt -s -o NUL -w "%{http_code}\n" http://localhost:3000/dashboard
# → 200 (autorisé)
```

### Résultats attendus par rôle

| Rôle | `/admin` | `/responsible` | `/dashboard` | `/profile` |
|---|---|---|---|---|
| Guest | 307 → /login | 307 → /login | 307 → /login | 307 → /login |
| USER | 307 → /unauthorized | 307 → /unauthorized | 200 ✅ | 200 ✅ |
| RESPONSIBLE | 307 → /unauthorized | 200 ✅ | 200 ✅ | 200 ✅ |
| ADMIN | 200 ✅ | 200 ✅ | 200 ✅ | 200 ✅ |

## ⚠️ Limites connues

- Le register crée uniquement des comptes `USER` (les autres rôles sont créés via le seed).
- Pas de fonctionnalité « mot de passe oublié ».
- Pas d'authentification par OAuth (Google, GitHub).
- Pas de vérification d'email à l'inscription.
- Pas de page d'administration pour gérer les utilisateurs (changement de rôle).
- Les autres modules (signalements, commentaires, dashboard statistiques) sont en cours de développement.

## 🐛 Dépannage

| Problème | Solution |
|---|---|
| `Can't reach database server at localhost:5432` | Vérifier que PostgreSQL est démarré (Services Windows / `brew services start postgresql`) |
| `Authentication failed for user "postgres"` | Vérifier le mot de passe dans `.env` (URL-encoder les caractères spéciaux) |
| `database "localimpact" does not exist` | Créer la base dans pgAdmin ou via `psql` |
| `Module not found: Can't resolve 'next-auth/react'` | `npm install next-auth@4 --legacy-peer-deps` |
| `Route segment config "dynamic" is not compatible` | Retirer `cacheComponents` de `next.config.ts` |
| `@theme` warning dans le CSS | Vérifier que `postcss.config.mjs` utilise `@tailwindcss/postcss` |
| Le nom ne change pas après modification du profil | Le JWT est rafraîchi via `useSession().update()` dans `ProfileForm.tsx` |
| `EACCES` ou erreurs de permission | Éviter OneDrive / dossiers synchronisés, préférer `C:\dev\` |

## 🤝 Contribution

Répartition du travail :

- **Membre 1** : Authentification, rôles, permissions, profil, seed, middleware
- **Membre 2** : Signalements (CRUD, filtres, soutien)
- **Membre 3** : Workflow (statuts, historique, commentaires)
- **Membre 4** : Dashboard statistiques + fonctionnalité originale

### Workflow Git

- `main` : branche stable
- `feature/<nom>` : une branche par fonctionnalité
- Pull Requests avant merge
- Commits clairs et réguliers

## 📄 Déclaration IA et ressources externes

Conformément aux exigences du projet, l'utilisation d'outils d'IA (Claude, ChatGPT) pour l'assistance au développement est déclarée. Toutes les bibliothèques utilisées sont open-source et listées dans `package.json`.

## 📚 Références

- [Documentation Next.js 16](https://nextjs.org/docs)
- [Documentation NextAuth v4](https://next-auth.js.org/)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Tailwind CSS v4](https://tailwindcss.com/docs)

---

**Projet académique** — Mohamed Amine Ben Rhouma