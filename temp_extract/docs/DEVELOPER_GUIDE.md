# 🏨 AfricaSuite PMS - Guide du Développeur

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Structure du projet](#structure-du-projet)
4. [Technologies utilisées](#technologies-utilisées)
5. [Installation et développement](#installation-et-développement)
6. [Patterns et conventions](#patterns-et-conventions)
7. [Design System](#design-system)
8. [Base de données](#base-de-données)
9. [API et intégrations](#api-et-intégrations)
10. [Tests](#tests)
11. [Déploiement](#déploiement)
12. [Contribution](#contribution)

## 🌟 Vue d'ensemble

AfricaSuite PMS est un système de gestion hôtelière (Property Management System) moderne, conçu spécifiquement pour le marché africain. Il combine une interface utilisateur intuitive avec des fonctionnalités robustes de gestion hôtelière.

### Fonctionnalités principales
- 🏨 Gestion des réservations et du rack
- 👥 Gestion des clients et des groupes
- 🏠 Housekeeping et maintenance
- 💰 Point de vente (POS) et facturation
- 📊 Reporting et analyses
- ⚙️ Configuration multi-organisations
- 🔒 Sécurité et audit avancés

## 🏗️ Architecture

### Stack technologique
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **État**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Patterns architecturaux
- **Feature-based architecture**: Organisation par domaine métier
- **Component composition**: Réutilisabilité et maintien des responsabilités
- **Type-safe**: TypeScript strict avec validation runtime
- **Responsive-first**: Mobile-first design system

## 📁 Structure du projet

```
src/
├── components/           # Composants UI génériques (shadcn/ui)
├── features/            # Modules métier organisés par domaine
│   ├── arrivals/       # Gestion des arrivées
│   ├── billing/        # Facturation
│   ├── monitoring/     # Monitoring et alertes
│   ├── pos/           # Point de vente
│   ├── rack/          # Planning des chambres
│   ├── reports/       # Rapports et analyses
│   └── settings/      # Configuration
├── hooks/              # Hooks React réutilisables
├── integrations/       # Intégrations externes (Supabase)
├── lib/               # Utilitaires et configuration
├── pages/             # Pages principales de l'application
├── types/             # Types TypeScript centralisés
└── utils/             # Fonctions utilitaires
```

### Organisation des features

Chaque feature suit cette structure :
```
features/[domain]/
├── components/        # Composants spécifiques au domaine
├── hooks/            # Hooks métier
├── pages/            # Pages du domaine
├── types/            # Types spécifiques
├── utils/            # Utilitaires du domaine
└── index.ts          # Point d'entrée des exports
```

## 🛠️ Technologies utilisées

### Frontend Core
- **React 18**: Framework principal avec Concurrent Features
- **TypeScript**: Type safety et développement robuste
- **Vite**: Build tool rapide et moderne
- **Tailwind CSS**: Utility-first CSS framework

### UI Components
- **Radix UI**: Composants accessibles headless
- **shadcn/ui**: Composants pré-stylés basés sur Radix
- **Lucide React**: Iconographie cohérente
- **Recharts**: Visualisations de données

### État et données
- **TanStack Query**: Cache et synchronisation server-state
- **React Hook Form**: Gestion des formulaires performante
- **Zod**: Validation de schémas TypeScript-first

### Backend (Supabase)
- **PostgreSQL**: Base de données relationnelle
- **Row Level Security**: Sécurité au niveau des lignes
- **Edge Functions**: Logic métier serverless
- **Real-time**: Mises à jour en temps réel

## 🚀 Installation et développement

### Prérequis
- Node.js 18+
- npm ou pnpm
- Accès au projet Supabase

### Installation
```bash
# Cloner le projet
git clone [repository-url]
cd africasuite-pms

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Démarrer le serveur de développement
npm run dev
```

### Scripts disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run build:dev    # Build de développement
npm run preview      # Prévisualisation du build
npm run lint         # Linting ESLint
```

## 📐 Patterns et conventions

### Nomenclature des fichiers
- **PascalCase**: Composants React (`UserCard.tsx`)
- **camelCase**: Hooks et utilitaires (`useAuth.ts`)
- **kebab-case**: Pages et dossiers (`user-settings/`)

### Structure des composants
```tsx
// Imports organisés par catégorie
import React from 'react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

import type { User } from '@/types/users';

// Interface des props
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

// Composant avec TypeScript strict
export function UserCard({ user, onEdit, className }: UserCardProps) {
  // Logique du composant
  
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      {/* JSX */}
    </div>
  );
}

// Export par défaut
export default UserCard;
```

### Gestion des erreurs
```tsx
// Hooks avec gestion d'erreur
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    throwOnError: true, // Laisse React Error Boundary gérer
  });
}

// Composants avec Error Boundaries
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  
  return <UserCard user={user} />;
}
```

## 🎨 Design System

### Système de couleurs
Le design system utilise des tokens CSS custom properties :

```css
/* Couleurs principales */
--brand-primary: 210 100% 50%     /* Bleu principal */
--brand-accent: 45 100% 60%       /* Doré accent */
--brand-copper: 25 85% 65%        /* Cuivre */

/* Couleurs sémantiques */
--success: 142 71% 45%            /* Vert succès */
--warning: 38 92% 50%             /* Orange warning */
--danger: 0 84% 60%               /* Rouge danger */
--info: 217 91% 60%               /* Bleu info */

/* Statuts métier */
--status-confirmed: 142 71% 45%    /* Réservation confirmée */
--status-present: 210 100% 50%     /* Client présent */
--status-option: 38 92% 50%        /* Réservation en option */
--status-cancelled: 0 84% 60%      /* Annulé */
```

### Utilisation dans les composants
```tsx
// ✅ Correct - Utilisation des tokens
<div className="bg-primary text-primary-foreground">
<Button variant="success">Confirmer</Button>
<Badge className="bg-status-confirmed">Confirmé</Badge>

// ❌ Incorrect - Couleurs hardcodées
<div className="bg-blue-500 text-white">
<div style={{ backgroundColor: '#3b82f6' }}>
```

### Variants des composants
```tsx
// Utilisation de class-variance-authority (cva)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-12 px-8",
      }
    }
  }
);
```

## 🗄️ Base de données

### Structure Supabase
- **Organisation multi-tenant**: Isolation par `org_id`
- **Row Level Security**: Politiques RLS pour sécurité
- **Types générés**: Synchronisation automatique des types
- **Audit logging**: Traçabilité des modifications

### Patterns d'accès aux données
```tsx
// Hook réutilisable avec cache
export function useReservations(filters?: ReservationFilters) {
  const orgId = useCurrentOrg();
  
  return useQuery({
    queryKey: ['reservations', orgId, filters],
    queryFn: () => supabase
      .from('reservations')
      .select('*, guests(*), rooms(*)')
      .eq('org_id', orgId)
      .match(filters ?? {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations avec optimistic updates
export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ReservationInsert) => 
      supabase.from('reservations').insert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
```

### Types centralisés
```typescript
// src/types/unified.ts - Point d'entrée unique
export type { Database } from '@/integrations/supabase/types';
export type { Reservation, Guest, Room } from '@/types/database';

// Types dérivés pour l'UI
export type UIReservation = Pick<Reservation, 'id' | 'status'> & {
  guestName: string;
  roomNumber: string;
};
```

## 🔌 API et intégrations

### Supabase Client
```tsx
// Configuration centralisée
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const supabase = createClient<Database>(
  'https://alfflpvdnywwbrzygmoc.supabase.co',
  'anon_key'
);

// Wrapper typed pour les requêtes
export async function getReservations(orgId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      guests (first_name, last_name),
      rooms (number, type)
    `)
    .eq('org_id', orgId);
    
  if (error) throw error;
  return data;
}
```

### Edge Functions
```typescript
// supabase/functions/process-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { amount, method, reservationId } = await req.json();
  
  // Logic de traitement de paiement
  const result = await processPayment({ amount, method, reservationId });
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## 🧪 Tests

### Structure des tests
```
src/
├── __tests__/          # Tests globaux
├── components/
│   └── __tests__/      # Tests des composants UI
└── features/
    └── [domain]/
        └── __tests__/  # Tests spécifiques au domaine
```

### Types de tests
- **Unit tests**: Composants et utilitaires isolés
- **Integration tests**: Flux utilisateur complets
- **E2E tests**: Scénarios métier critiques

### Exemple de test
```tsx
// src/features/reservations/__tests__/ReservationCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ReservationCard } from '../components/ReservationCard';

describe('ReservationCard', () => {
  it('should display guest name and room number', () => {
    const reservation = {
      id: '1',
      guestName: 'John Doe',
      roomNumber: '101',
      status: 'confirmed'
    };
    
    render(<ReservationCard reservation={reservation} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Chambre 101')).toBeInTheDocument();
  });
});
```

## 🚀 Déploiement

### Build de production
```bash
# Build optimisé
npm run build

# Vérification du build
npm run preview
```

### Variables d'environnement
```env
# .env.production
VITE_SUPABASE_URL=https://alfflpvdnywwbrzygmoc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Déploiement via Lovable
1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement via l'interface Lovable

## 🤝 Contribution

### Workflow de développement
1. **Fork** du repository principal
2. **Feature branch** depuis `main`
3. **Development** avec tests
4. **Pull Request** avec description détaillée
5. **Code Review** et validation
6. **Merge** après approbation

### Standards de code
- **ESLint**: Configuration stricte
- **Prettier**: Formatage automatique
- **TypeScript**: Mode strict activé
- **Conventional Commits**: Messages structurés

### Checklist PR
- [ ] Tests unitaires passent
- [ ] Types TypeScript corrects
- [ ] Documentation mise à jour
- [ ] Performance vérifiée
- [ ] Accessibilité respectée

### Architecture Decision Records (ADR)
```markdown
# ADR-001: Utilisation de TanStack Query

## Statut
Accepté

## Contexte
Besoin de gérer efficacement l'état serveur et le cache.

## Décision
Utilisation de TanStack Query pour sa robustesse et ses features.

## Conséquences
+ Cache intelligent et synchronisation
+ Optimistic updates
- Courbe d'apprentissage
```

## 📚 Ressources additionnelles

### Documentation externe
- [React Query Guide](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)

### Outils de développement
- **React DevTools**: Debug des composants
- **TanStack Query DevTools**: Inspection du cache
- **Supabase Dashboard**: Gestion de la base
- **Lovable IDE**: Développement intégré

---

**🔄 Ce guide est maintenu à jour avec l'évolution du projet**

Pour questions ou suggestions : [Créer une issue](./issues)