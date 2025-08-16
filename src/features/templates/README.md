# Templates Feature

Ce module gère tous les templates de documents dans l'application (factures, reçus, contrats, emails, etc.).

## Architecture

### 📁 Structure des fichiers

```
src/features/templates/
├── components/
│   ├── TemplatesPage.tsx          # Page principale des templates (route: /settings/templates)
│   ├── TemplateCard.tsx           # Composant réutilisable pour afficher un template
│   ├── TemplatesList.tsx          # Liste de templates avec gestion des états
│   ├── TemplateEditor.tsx         # Éditeur de templates
│   ├── TemplatePreview.tsx        # Aperçu et impression des templates
│   ├── TemplateRenderer.tsx       # Rendu dynamique des templates avec données
│   └── TemplateExportDemo.tsx     # Démonstration des exports
├── hooks/
│   ├── useDocumentTemplates.ts    # Hook principal pour la gestion des templates
│   └── useTemplateExport.ts       # Hook pour l'export PDF/Image
└── README.md                      # Cette documentation
```

### 🔄 Pages et Contextes

1. **Page Principale** (`/settings/templates`)
   - Fichier: `src/features/templates/components/TemplatesPage.tsx`
   - Utilisation: Gestion complète des templates (CRUD, aperçu, export)
   - Fonctionnalités: Tous types de templates, éditeur intégré, système d'onglets

2. **Onglet Factures** (dans la section facturation)
   - Fichier: `src/features/billing/components/InvoiceTemplatesTab.tsx`
   - Utilisation: Spécialisé pour les templates de factures uniquement
   - Contexte: Intégré dans le workflow de facturation

### ⚙️ Services et API

- **Service Principal**: `src/services/templates.api.ts`
- **Types**: `src/types/templates.ts`
- **Hooks**: `src/features/templates/hooks/`

### 🧩 Composants Partagés

- `TemplateCard`: Affichage uniforme des templates
- `TemplatesList`: Gestion des listes avec états de chargement
- `TemplateRenderer`: Rendu dynamique avec substitution de variables

## Utilisation

### Créer un nouveau template
```tsx
import { useCreateTemplate } from '@/services/templates.api';

const createMutation = useCreateTemplate();
createMutation.mutate({
  code: 'template-code',
  name: 'Mon Template',
  type: 'invoice',
  content: 'Contenu HTML...',
  // ...
});
```

### Afficher une liste de templates
```tsx
import { TemplatesList } from '@/features/templates/components/TemplatesList';
import { useDocumentTemplates } from '@/features/templates/hooks/useDocumentTemplates';

function MyComponent() {
  const { templates, isLoading } = useDocumentTemplates();
  
  return (
    <TemplatesList
      templates={templates}
      isLoading={isLoading}
      onPreview={handlePreview}
      onEdit={handleEdit}
      // ...
    />
  );
}
```

### Rendre un template avec des données
```tsx
import { TemplateRenderer } from '@/features/templates/components/TemplateRenderer';

<TemplateRenderer 
  template={template}
  data={{
    invoice: { number: 'FAC-001' },
    customer: { name: 'Client' }
  }}
/>
```

## Bonnes Pratiques

1. **Réutilisation**: Utilisez les composants partagés (`TemplateCard`, `TemplatesList`)
2. **Types**: Toujours typer avec `DocumentTemplate` et `TemplateType`
3. **État**: Utilisez les hooks fournis pour la gestion d'état
4. **Performance**: Les listes utilisent React Query pour le cache automatique

## Migration et Évolution

- ✅ Page abandonnée `src/pages/TemplatesPage.tsx` supprimée
- ✅ Composants partagés créés pour éviter la duplication
- ✅ Architecture claire entre page principale et contextes spécialisés
- ✅ Documentation complète pour éviter future confusion

---

**Note**: Cette architecture consolide définitivement la gestion des templates en évitant la duplication et la confusion entre les différentes pages.