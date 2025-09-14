# 🤝 Guide de Contribution - AfricaSuite PMS

Merci de votre intérêt pour contribuer à AfricaSuite PMS ! Ce guide vous aidera à comprendre comment participer efficacement au développement du projet.

## 📋 Table des Matières

1. [Code de conduite](#code-de-conduite)
2. [Types de contributions](#types-de-contributions)
3. [Première contribution](#première-contribution)
4. [Workflow de développement](#workflow-de-développement)
5. [Standards de code](#standards-de-code)
6. [Processus de review](#processus-de-review)
7. [Documentation](#documentation)
8. [Tests](#tests)
9. [Déploiement](#déploiement)

## 🤝 Code de conduite

En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md). Nous nous engageons à maintenir un environnement accueillant et inclusif pour tous.

### Nos valeurs
- **Respect** : Traitez tous les contributeurs avec respect
- **Inclusivité** : Accueillez les perspectives diverses
- **Collaboration** : Travaillez ensemble vers des objectifs communs
- **Excellence** : Visez la qualité dans tout ce que vous faites

## 🎯 Types de contributions

### 🐛 Rapports de bugs
Signalez les problèmes que vous rencontrez.

**Avant de signaler :**
- Vérifiez les [issues existantes](https://github.com/africasuite/pms/issues)
- Testez avec la dernière version
- Reproduisez le problème de manière consistante

**Template de rapport de bug :**
```markdown
## Description du bug
Brève description du problème rencontré.

## Étapes pour reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler vers '...'
4. Voir l'erreur

## Comportement attendu
Ce qui devrait se passer normalement.

## Comportement actuel
Ce qui se passe actuellement.

## Screenshots
Si applicable, ajoutez des captures d'écran.

## Environnement
- OS: [ex: Windows 10, macOS 12]
- Navigateur: [ex: Chrome 96, Safari 15]
- Version de l'app: [ex: v3.0.0]
```

### 💡 Demandes de fonctionnalités
Proposez de nouvelles fonctionnalités ou améliorations.

**Template de feature request :**
```markdown
## Problème à résoudre
Décrivez le problème que cette fonctionnalité résoudrait.

## Solution proposée
Description claire de ce que vous aimeriez voir implémenté.

## Alternatives considérées
Autres solutions que vous avez envisagées.

## Contexte additionnel
Informations supplémentaires, maquettes, exemples...
```

### 🔧 Contributions de code
Implémentez des corrections ou nouvelles fonctionnalités.

**Types de contributions acceptées :**
- Corrections de bugs
- Nouvelles fonctionnalités
- Améliorations de performance
- Améliorations d'accessibilité
- Optimisations UI/UX

### 📖 Amélioration de la documentation
Aidez à améliorer la documentation du projet.

**Types de contributions documentaires :**
- Correction d'erreurs de frappe
- Clarification d'instructions
- Ajout d'exemples
- Traduction en nouvelles langues
- Guides tutoriels

## 🚀 Première contribution

### Configuration de l'environnement

1. **Fork du repository**
   ```bash
   # Cliquez sur "Fork" sur la page GitHub
   # Puis clonez votre fork
   git clone https://github.com/YOUR_USERNAME/africasuite-pms.git
   cd africasuite-pms
   ```

2. **Installation des dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env.local
   # Éditez .env.local avec vos clés de développement
   ```

4. **Vérification de l'installation**
   ```bash
   npm run dev
   # L'application devrait démarrer sur http://localhost:5173
   ```

### Issues débutants
Recherchez les issues avec le label `good first issue` pour commencer. Ces issues sont spécialement sélectionnées pour les nouveaux contributeurs.

## 🔄 Workflow de développement

### 1. Créer une branche feature
```bash
# Synchroniser avec le repository principal
git checkout main
git pull upstream main

# Créer une nouvelle branche
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/correction-bug
```

### 2. Faire vos modifications
- Respectez les [standards de code](#standards-de-code)
- Ajoutez des tests pour vos modifications
- Mettez à jour la documentation si nécessaire

### 3. Commits
Utilisez des messages de commit clairs et conventionnels :

```bash
# Format : type(scope): description
git commit -m "feat(reservations): add bulk reservation creation"
git commit -m "fix(pos): resolve payment calculation error"
git commit -m "docs(api): update authentication examples"
```

**Types de commits :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Changements de formatage (espaces, points-virgules, etc.)
- `refactor`: Refactoring de code sans changement de fonctionnalité
- `test`: Ajout ou modification de tests
- `chore`: Tâches de maintenance

### 4. Push et Pull Request
```bash
# Push vers votre fork
git push origin feature/ma-fonctionnalite

# Créer une Pull Request via l'interface GitHub
```

## 📏 Standards de code

### TypeScript
- Utilisez TypeScript strict mode
- Définissez les types explicites pour les props et états
- Évitez `any`, préférez `unknown` si nécessaire
- Utilisez les types générés par Supabase

```typescript
// ✅ Bon
interface UserCardProps {
  user: User;
  onEdit?: (userId: string) => void;
  className?: string;
}

// ❌ À éviter
interface UserCardProps {
  user: any;
  onEdit?: any;
  className?: any;
}
```

### React
- Utilisez les hooks fonctionnels
- Préférez la composition à l'héritage
- Extrayez la logique complexe dans des hooks personnalisés
- Utilisez `memo` pour les composants coûteux

```tsx
// ✅ Bon
const UserCard = memo(function UserCard({ user, onEdit }: UserCardProps) {
  const { permissions } = usePermissions();
  
  const handleEdit = useCallback(() => {
    onEdit?.(user.id);
  }, [onEdit, user.id]);

  return (
    <Card>
      {/* Contenu */}
    </Card>
  );
});
```

### CSS/Styling
- Utilisez les classes utilitaires Tailwind
- Préférez les tokens CSS du design system
- Évitez les styles inline sauf exceptions
- Utilisez `cn()` pour la composition de classes

```tsx
// ✅ Bon
<Button className={cn(
  "bg-primary text-primary-foreground",
  isActive && "bg-primary-hover",
  className
)}>
  {children}
</Button>

// ❌ À éviter
<Button style={{ backgroundColor: '#3b82f6', color: 'white' }}>
  {children}
</Button>
```

### Gestion des erreurs
- Utilisez des Error Boundaries pour les erreurs UI
- Gérez les erreurs de réseau avec React Query
- Loggez les erreurs importantes
- Fournissez des messages d'erreur utiles

```tsx
// ✅ Bon
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  throwOnError: true, // Error Boundary va gérer
});

if (isLoading) return <Skeleton />;

// Error Boundary gère l'erreur
return <UserList users={data} />;
```

### Performance
- Utilisez `React.lazy()` pour le code splitting
- Optimisez les images avec les tailles appropriées
- Évitez les re-renders inutiles avec `useMemo` et `useCallback`
- Profilez avec React DevTools

### Accessibilité
- Ajoutez des labels ARIA appropriés
- Supportez la navigation clavier
- Respectez les contrastes de couleur
- Testez avec un lecteur d'écran

```tsx
// ✅ Bon
<Button
  aria-label="Supprimer la réservation"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</Button>
<div id="delete-help" className="sr-only">
  Cette action est irréversible
</div>
```

## 🔍 Processus de review

### Avant de soumettre
- [ ] Le code compile sans erreurs
- [ ] Tous les tests passent
- [ ] La fonctionnalité fonctionne comme attendu
- [ ] La documentation est mise à jour
- [ ] Le code respecte les standards
- [ ] Les changements sont testés manuellement

### Template de Pull Request
```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Bug fix (changement non-breaking qui corrige un problème)
- [ ] Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] Breaking change (correction ou fonctionnalité qui casserait la fonctionnalité existante)
- [ ] Mise à jour de documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Testé manuellement

## Screenshots
Si applicable, ajoutez des captures d'écran des changements UI.

## Checklist
- [ ] Mon code suit les guidelines du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté les parties complexes de mon code
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] Tous les tests passent
```

### Critères de review
Les reviewers vérifieront :

**Fonctionnalité :**
- Le code fait ce qu'il est censé faire
- Les edge cases sont gérés
- L'UX est intuitive

**Qualité du code :**
- Lisibilité et maintenabilité
- Respect des patterns établis
- Performance appropriée

**Tests :**
- Couverture de test suffisante
- Tests pertinents et robustes

**Documentation :**
- Code auto-documenté
- Documentation technique mise à jour
- Commentaires utiles

### Processus d'approbation
1. **Review automatique** : Checks CI/CD passent
2. **Review technique** : Au moins un développeur approuve
3. **Review produit** : Validation UX/métier si nécessaire
4. **Merge** : Squash et merge dans main

## 📖 Documentation

### Types de documentation à maintenir

**Code documentation :**
```tsx
/**
 * Composant pour afficher une carte de réservation
 * 
 * @param reservation - Les données de la réservation
 * @param onEdit - Callback appelé lors de l'édition
 * @param className - Classes CSS additionnelles
 * 
 * @example
 * ```tsx
 * <ReservationCard
 *   reservation={reservation}
 *   onEdit={(id) => navigate(`/edit/${id}`)}
 * />
 * ```
 */
export function ReservationCard({ reservation, onEdit, className }: ReservationCardProps) {
  // Implementation
}
```

**API documentation :**
- Documentez tous les endpoints publics
- Incluez des exemples de requêtes/réponses
- Spécifiez les codes d'erreur possibles

**User documentation :**
- Guides d'utilisation pas-à-pas
- Screenshots annotés
- FAQ pour problèmes courants

### Guidelines de documentation
- **Clarté** : Écrivez pour votre audience
- **Concision** : Soyez précis et pertinent
- **Actualité** : Maintenez la documentation à jour
- **Exemples** : Incluez des exemples pratiques

## 🧪 Tests

### Types de tests requis

**Tests unitaires :**
```tsx
// tests/components/ReservationCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationCard } from '@/components/ReservationCard';

describe('ReservationCard', () => {
  const mockReservation = {
    id: '1',
    reference: 'RES-001',
    guest_name: 'John Doe',
    status: 'confirmed'
  };

  it('displays reservation information correctly', () => {
    render(<ReservationCard reservation={mockReservation} />);
    
    expect(screen.getByText('RES-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(
      <ReservationCard 
        reservation={mockReservation} 
        onEdit={mockOnEdit} 
      />
    );
    
    fireEvent.click(screen.getByText('Modifier'));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });
});
```

**Tests d'intégration :**
```tsx
// tests/features/reservations.test.tsx
describe('Reservation Flow', () => {
  it('should create a reservation successfully', async () => {
    render(<App />);
    
    // Navigate to reservations
    fireEvent.click(screen.getByText('Réservations'));
    
    // Click create button
    fireEvent.click(screen.getByText('Nouvelle réservation'));
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Nom du client'), {
      target: { value: 'John Doe' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Créer'));
    
    // Verify
    await waitFor(() => {
      expect(screen.getByText('Réservation créée')).toBeInTheDocument();
    });
  });
});
```

### Commandes de test
```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

### Standards de test
- **Couverture minimale** : 80% pour les nouvelles fonctionnalités
- **Nomenclature** : Décrivez ce que teste chaque test
- **Isolation** : Chaque test doit être indépendant
- **Mocking** : Mockez les dépendances externes

## 🚀 Déploiement

### Environnements

**Development :**
- Déployé automatiquement à chaque push sur une branche
- URL temporaire générée par Lovable

**Staging :**
- Déployé automatiquement à chaque merge dans `main`
- Tests automatisés complets

**Production :**
- Déployé manuellement après validation
- Monitoring et rollback disponibles

### Processus de release

1. **Préparation**
   ```bash
   # Mettre à jour le CHANGELOG
   # Bumper la version dans package.json
   git commit -m "chore: release v3.1.0"
   git tag v3.1.0
   ```

2. **Publication**
   ```bash
   git push origin main
   git push origin v3.1.0
   ```

3. **Déploiement**
   - Déploiement automatique en staging
   - Tests de validation
   - Déploiement manuel en production

## 🎓 Ressources d'apprentissage

### Technologies clés
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Guides](https://supabase.com/docs)

### Outils de développement
- [React DevTools](https://react-devtools-tutorial.vercel.app/)
- [Redux DevTools](https://extension.remotedev.io/)
- [React Hook Form DevTools](https://react-hook-form.com/dev-tools)

### Communauté
- [Discord AfricaSuite](https://discord.gg/africasuite)
- [Forum développeurs](https://forum.africasuite.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/africasuite)

## 💬 Support et questions

### Avant de poser une question
1. Vérifiez la [documentation](docs/)
2. Recherchez dans les [issues existantes](https://github.com/africasuite/pms/issues)
3. Consultez les [discussions](https://github.com/africasuite/pms/discussions)

### Canaux de support
- **Issues GitHub** : Bugs et demandes de fonctionnalités
- **Discussions GitHub** : Questions générales et aide
- **Discord** : Chat en temps réel avec la communauté
- **Email** : support@africasuite.com pour les questions urgentes

---

**🙏 Merci de contribuer à AfricaSuite PMS !**

Votre participation aide à améliorer l'industrie hôtelière africaine. Chaque contribution, petite ou grande, fait la différence.