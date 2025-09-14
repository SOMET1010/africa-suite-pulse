# 🧩 AfricaSuite PMS - Bibliothèque de Composants

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Composants UI de base](#composants-ui-de-base)
3. [Composants métier](#composants-métier)
4. [Patterns de composition](#patterns-de-composition)
5. [Design System](#design-system)
6. [Hooks personnalisés](#hooks-personnalisés)
7. [Utilitaires](#utilitaires)
8. [Guidelines](#guidelines)

## 🌟 Vue d'ensemble

La bibliothèque de composants AfricaSuite PMS est construite sur **shadcn/ui** et **Radix UI**, garantissant accessibilité et cohérence. Tous les composants respectent notre design system et sont typés avec TypeScript.

### Architecture des composants
```
components/
├── ui/                 # Composants de base (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── shared/            # Composants partagés métier
│   ├── DataTable/
│   ├── StatusBadge/
│   └── ...
└── layout/           # Composants de mise en page
    ├── Sidebar/
    ├── Header/
    └── ...
```

## 🎨 Composants UI de base

### Button
Composant bouton avec variants multiples et états.

```tsx
import { Button } from '@/components/ui/button';

// Utilisation basique
<Button>Cliquer ici</Button>

// Avec variants
<Button variant="destructive" size="lg">
  Supprimer
</Button>

// Avec icône
<Button variant="outline">
  <Plus className="h-4 w-4 mr-2" />
  Ajouter
</Button>

// État de chargement
<Button loading disabled>
  Traitement...
</Button>
```

**Props disponibles:**
```tsx
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

### Input
Champs de saisie avec validation et états d'erreur.

```tsx
import { Input } from '@/components/ui/input';

// Input basique
<Input 
  placeholder="Entrer votre nom"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Avec erreur
<Input 
  error="Ce champ est requis"
  className="border-destructive"
/>

// Avec icône
<Input 
  icon={<Search className="h-4 w-4" />}
  placeholder="Rechercher..."
/>
```

### Dialog
Fenêtres modales responsives et accessibles.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir modal</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Titre de la modal</DialogTitle>
      <DialogDescription>
        Description ou instructions
      </DialogDescription>
    </DialogHeader>
    
    {/* Contenu de la modal */}
    
    <DialogFooter>
      <Button type="submit">Valider</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Badge
Étiquettes pour statuts et catégories.

```tsx
import { Badge } from '@/components/ui/badge';

// Variants de statut
<Badge variant="success">Confirmé</Badge>
<Badge variant="warning">En attente</Badge>
<Badge variant="destructive">Annulé</Badge>

// Badge personnalisé avec couleur métier
<Badge className="bg-status-confirmed text-white">
  Présent
</Badge>
```

### Card
Conteneurs de contenu avec shadow et bordures.

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Réservation #1234</CardTitle>
    <CardDescription>
      Du 15/03 au 18/03/2024
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Client: John Doe</p>
    <p>Chambre: 101</p>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Actions</Button>
  </CardFooter>
</Card>
```

## 🏨 Composants métier

### StatusBadge
Badge intelligent pour les statuts métier.

```tsx
import { StatusBadge } from '@/components/shared/StatusBadge';

// Statut de réservation
<StatusBadge 
  status="confirmed" 
  type="reservation"
/>

// Statut de chambre
<StatusBadge 
  status="clean" 
  type="room"
  showIcon
/>

// Badge personnalisé
<StatusBadge 
  status="present"
  type="guest"
  variant="outline"
  className="animate-pulse"
/>
```

**Implementation:**
```tsx
// src/components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'reservation' | 'room' | 'guest' | 'payment';
  variant?: 'default' | 'outline';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  reservation: {
    confirmed: { 
      label: 'Confirmé', 
      className: 'bg-status-confirmed text-white',
      icon: CheckCircle 
    },
    option: { 
      label: 'Option', 
      className: 'bg-status-option text-white',
      icon: Clock 
    },
    // ...
  }
} as const;

export function StatusBadge({ status, type, variant = 'default', showIcon, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[type]?.[status];
  if (!config) return null;

  return (
    <Badge 
      variant={variant}
      className={cn(config.className, className)}
    >
      {showIcon && config.icon && (
        <config.icon className="h-3 w-3 mr-1" />
      )}
      {config.label}
    </Badge>
  );
}
```

### DataTable
Table de données avec tri, filtrage et pagination.

```tsx
import { DataTable } from '@/components/shared/DataTable';

// Définition des colonnes
const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: 'reference',
    header: 'Référence',
  },
  {
    accessorKey: 'guest_name',
    header: 'Client',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('guest_name')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <StatusBadge 
        status={row.getValue('status')} 
        type="reservation" 
      />
    ),
  },
];

// Utilisation
<DataTable
  columns={columns}
  data={reservations}
  searchKey="guest_name"
  searchPlaceholder="Rechercher par client..."
  onRowClick={(row) => console.log('Row clicked:', row)}
/>
```

### FormField
Champ de formulaire avec validation intégrée.

```tsx
import { FormField } from '@/components/shared/FormField';
import { useForm } from 'react-hook-form';

const form = useForm<FormData>();

<FormField
  control={form.control}
  name="guest_name"
  label="Nom du client"
  placeholder="Entrer le nom complet"
  description="Nom tel qu'il apparaît sur la pièce d'identité"
  required
  render={({ field }) => (
    <Input {...field} />
  )}
/>
```

### DateRangePicker
Sélecteur de plage de dates optimisé.

```tsx
import { DateRangePicker } from '@/components/shared/DateRangePicker';

<DateRangePicker
  value={{
    from: startDate,
    to: endDate
  }}
  onChange={(range) => {
    setStartDate(range?.from);
    setEndDate(range?.to);
  }}
  placeholder="Sélectionner les dates"
  minDate={new Date()}
  maxDate={addYears(new Date(), 2)}
/>
```

## 🔄 Patterns de composition

### Provider Pattern
Gestion d'état contextualisé pour les composants complexes.

```tsx
// Context pour le rack des chambres
const RackContext = createContext<RackContextValue | null>(null);

export function RackProvider({ children }: { children: React.ReactNode }) {
  const [selectedDates, setSelectedDates] = useState<DateRange>();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  
  const value = {
    selectedDates,
    setSelectedDates,
    selectedRooms,
    setSelectedRooms,
  };
  
  return (
    <RackContext.Provider value={value}>
      {children}
    </RackContext.Provider>
  );
}

// Hook pour utiliser le context
export function useRack() {
  const context = useContext(RackContext);
  if (!context) {
    throw new Error('useRack must be used within RackProvider');
  }
  return context;
}
```

### Compound Components
Composants avec API déclarative.

```tsx
// Exemple : ReservationCard avec sous-composants
export function ReservationCard({ children, reservation, ...props }: ReservationCardProps) {
  return (
    <Card {...props}>
      <ReservationContext.Provider value={{ reservation }}>
        {children}
      </ReservationContext.Provider>
    </Card>
  );
}

ReservationCard.Header = function ReservationCardHeader({ children }: { children: React.ReactNode }) {
  const { reservation } = useReservationContext();
  return (
    <CardHeader>
      <CardTitle className="flex justify-between">
        {reservation.reference}
        <StatusBadge status={reservation.status} type="reservation" />
      </CardTitle>
      {children}
    </CardHeader>
  );
};

ReservationCard.Content = CardContent;
ReservationCard.Footer = CardFooter;

// Utilisation
<ReservationCard reservation={reservation}>
  <ReservationCard.Header>
    <CardDescription>
      Du {formatDate(reservation.date_arrival)} au {formatDate(reservation.date_departure)}
    </CardDescription>
  </ReservationCard.Header>
  
  <ReservationCard.Content>
    <div className="space-y-2">
      <p><strong>Client:</strong> {reservation.guest_name}</p>
      <p><strong>Chambre:</strong> {reservation.room_number}</p>
    </div>
  </ReservationCard.Content>
  
  <ReservationCard.Footer>
    <Button variant="outline" size="sm">
      Modifier
    </Button>
  </ReservationCard.Footer>
</ReservationCard>
```

### Render Props
Composants flexibles avec logique réutilisable.

```tsx
// Composant SearchCombobox réutilisable
interface SearchComboboxProps<T> {
  items: T[];
  onSearch: (query: string) => void;
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  renderTrigger?: (props: { value?: T; placeholder: string }) => React.ReactNode;
  placeholder: string;
  searchPlaceholder?: string;
}

export function SearchCombobox<T>({
  items,
  onSearch,
  onSelect,
  renderItem,
  renderTrigger,
  placeholder,
  searchPlaceholder = "Rechercher..."
}: SearchComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger ? 
          renderTrigger({ placeholder }) : 
          <Button variant="outline" className="justify-start">
            {placeholder}
          </Button>
        }
      </PopoverTrigger>
      
      <PopoverContent className="p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              onSearch(value);
            }}
          />
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup>
            {items.map((item, index) => (
              <CommandItem
                key={index}
                onSelect={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                {renderItem(item)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Utilisation pour recherche de clients
<SearchCombobox
  items={guests}
  onSearch={searchGuests}
  onSelect={setSelectedGuest}
  placeholder="Sélectionner un client"
  renderItem={(guest) => (
    <div className="flex flex-col">
      <span className="font-medium">
        {guest.first_name} {guest.last_name}
      </span>
      <span className="text-sm text-muted-foreground">
        {guest.email}
      </span>
    </div>
  )}
/>
```

## 🎨 Design System

### Couleurs sémantiques
```tsx
// Utilisation des tokens CSS
const statusColors = {
  confirmed: 'bg-status-confirmed text-white',
  option: 'bg-status-option text-white',
  present: 'bg-status-present text-white',
  cancelled: 'bg-status-cancelled text-white',
} as const;

// Dans les composants
<div className={cn(
  "p-4 rounded-lg",
  statusColors[status],
  className
)}>
  {children}
</div>
```

### Typographie
```tsx
// Classes utilitaires prédéfinies
const typography = {
  h1: "text-4xl font-bold tracking-tight lg:text-5xl",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold tracking-tight",
  h4: "text-xl font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
} as const;
```

### Espacements et tailles
```tsx
// Système d'espacement cohérent
const spacing = {
  xs: "0.5rem",   // 8px
  sm: "0.75rem",  // 12px
  md: "1rem",     // 16px
  lg: "1.5rem",   // 24px
  xl: "2rem",     // 32px
  "2xl": "3rem",  // 48px
} as const;
```

## 🪝 Hooks personnalisés

### useLocalStorage
Persistance locale avec synchronisation.

```tsx
import { useLocalStorage } from '@/hooks/useLocalStorage';

function MyComponent() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'light',
    language: 'fr'
  });
  
  return (
    <div>
      <Button onClick={() => setPreferences(prev => ({ 
        ...prev, 
        theme: prev.theme === 'light' ? 'dark' : 'light' 
      }))}>
        Changer le thème
      </Button>
    </div>
  );
}
```

### useDebounce
Optimisation des performances pour les recherches.

```tsx
import { useDebounce } from '@/hooks/useDebounce';

function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  // Effet qui se déclenche seulement après 300ms d'inactivité
  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);
  
  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Rechercher..."
    />
  );
}
```

### usePermissions
Gestion des permissions utilisateur.

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function AdminPanel() {
  const { hasPermission, isLoading } = usePermissions();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      {hasPermission('manage_users') && (
        <Button>Gérer les utilisateurs</Button>
      )}
      
      {hasPermission('view_reports') && (
        <Button>Voir les rapports</Button>
      )}
    </div>
  );
}
```

## 🛠️ Utilitaires

### cn (classNames)
Fusion conditionnelle de classes CSS.

```tsx
import { cn } from '@/lib/utils';

// Basique
cn('bg-primary', 'text-white'); // "bg-primary text-white"

// Conditionnel
cn(
  'px-4 py-2',
  isActive && 'bg-primary text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
);

// Avec className props
<Button className={cn('my-custom-class', className)} />
```

### formatters
Formatage de données cohérent.

```tsx
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime,
  formatDuration 
} from '@/lib/formatters';

// Devises
formatCurrency(125000, 'XOF'); // "125 000 FCFA"
formatCurrency(250.50, 'EUR'); // "250,50 €"

// Dates
formatDate('2024-03-15'); // "15 mars 2024"
formatDateTime(new Date()); // "15 mars 2024 à 14h30"

// Durées
formatDuration(3); // "3 nuits"
formatDuration(1); // "1 nuit"
```

### validators
Validation avec Zod pour les formulaires.

```tsx
import { z } from 'zod';
import { guestSchema, reservationSchema } from '@/lib/validators';

// Schéma de validation pour client
const guestSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  document_number: z.string().optional(),
});

// Dans un formulaire
const form = useForm<z.infer<typeof guestSchema>>({
  resolver: zodResolver(guestSchema),
  defaultValues: {
    first_name: '',
    last_name: '',
  }
});
```

## 📏 Guidelines

### Conventions de nommage
```tsx
// Composants : PascalCase
export function ReservationCard() {}

// Props : camelCase avec suffixe Props
interface ReservationCardProps {
  reservation: Reservation;
  onEdit?: (id: string) => void;
}

// Hooks : camelCase avec préfixe use
export function useReservations() {}

// Constantes : SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {
  RESERVATIONS: '/reservations',
  GUESTS: '/guests',
} as const;
```

### Structure des composants
```tsx
// 1. Imports (externes puis internes)
import React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';

import type { Reservation } from '@/types/unified';

// 2. Types et interfaces
interface ComponentProps {
  // ...
}

// 3. Constantes
const DEFAULT_VALUES = {
  // ...
} as const;

// 4. Composant principal
export function Component({ prop1, prop2 }: ComponentProps) {
  // 4a. Hooks d'état
  const [state, setState] = useState();
  
  // 4b. Hooks personnalisés
  const { data, isLoading } = useCustomHook();
  
  // 4c. Fonctions utilitaires
  const handleAction = useCallback(() => {
    // ...
  }, []);
  
  // 4d. Effets
  useEffect(() => {
    // ...
  }, []);
  
  // 4e. Render conditionnel
  if (isLoading) return <Skeleton />;
  
  // 4f. JSX principal
  return (
    <div>
      {/* Contenu */}
    </div>
  );
}

// 5. Export par défaut
export default Component;
```

### Performance
```tsx
// Memo pour composants coûteux
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* Rendu complexe */}</div>;
});

// Lazy loading pour composants volumineux
const HeavyModal = lazy(() => import('./HeavyModal'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyModal />
    </Suspense>
  );
}

// useMemo pour calculs coûteux
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useCallback pour fonctions passées en props
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Accessibilité
```tsx
// Labels appropriés
<Input 
  aria-label="Nom du client"
  aria-describedby="name-help"
/>
<div id="name-help">
  Entrez le nom complet du client
</div>

// Navigation clavier
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Clickable div
</div>

// États pour screen readers
<Button 
  aria-pressed={isActive}
  aria-expanded={isOpen}
  aria-disabled={isDisabled}
>
  Toggle button
</Button>
```

---

**🧩 Cette bibliothèque évolue avec les besoins du projet. Contribuez en proposant de nouveaux composants !**

Pour ajouter un composant : [Créer une issue](./issues) avec le label "component-request"