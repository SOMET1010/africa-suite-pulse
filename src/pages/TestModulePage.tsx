/**
 * 🧪 Test Module Page - Interface de test interactive
 * 
 * Page de test pour un module spécifique avec checklist interactive,
 * résultats et commentaires.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Save, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrgId } from '@/core/auth/useOrg';

// Types
interface TestCase {
  id: string;
  section: string;
  number: string;
  name: string;
  description: string;
  expectedResult?: string;
  steps?: string;
  isCritical: boolean;
  result: 'pending' | 'ok' | 'ko' | 'partial' | 'skipped';
  comments: string;
  tested: boolean;
}

interface TestSession {
  id: string;
  sessionName: string;
  testerName: string;
  moduleName: string;
  environment: string;
  platformVersion: string;
  status: 'in_progress' | 'completed' | 'paused';
  startedAt: string;
  notes: string;
}

const TestModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();
  
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(true);
  const [sessionForm, setSessionForm] = useState({
    sessionName: '',
    testerName: '',
    environment: 'staging',
    platformVersion: '',
    notes: ''
  });

  // Templates de tests par module
  const getTestTemplates = (module: string): TestCase[] => {
    const templates: Record<string, TestCase[]> = {
      restaurant: [
        {
          id: '1.1',
          section: 'Navigation & Interface',
          number: '1.1',
          name: 'Accès au module Restaurant',
          description: 'Vérifier l\'accès et le chargement du module Restaurant',
          expectedResult: 'Le module se charge correctement avec toutes les sections visibles',
          steps: '1. Cliquer sur "Restaurant" dans le menu\n2. Vérifier le chargement\n3. Contrôler l\'affichage des éléments',
          isCritical: true,
          result: 'pending',
          comments: '',
          tested: false
        },
        {
          id: '1.2',
          section: 'Navigation & Interface',
          number: '1.2',
          name: 'Navigation entre onglets',
          description: 'Tester la navigation entre Terminal, Cuisine, Maître d\'hôtel',
          expectedResult: 'Navigation fluide sans perte de données',
          isCritical: true,
          result: 'pending',
          comments: '',
          tested: false
        },
        {
          id: '2.1',
          section: 'Gestion des Tables',
          number: '2.1',
          name: 'Affichage des tables',
          description: 'Vérifier l\'affichage correct des tables et leur statut',
          expectedResult: 'Toutes les tables s\'affichent avec leur statut correct',
          isCritical: true,
          result: 'pending',
          comments: '',
          tested: false
        },
        {
          id: '2.2',
          section: 'Gestion des Tables',
          number: '2.2',
          name: 'Assignation de table',
          description: 'Tester l\'assignation d\'une table à un serveur',
          expectedResult: 'Table assignée avec mise à jour visuelle',
          isCritical: false,
          result: 'pending',
          comments: '',
          tested: false
        },
        {
          id: '3.1',
          section: 'Commandes',
          number: '3.1',
          name: 'Création de commande',
          description: 'Créer une nouvelle commande avec articles',
          expectedResult: 'Commande créée et sauvegardée correctement',
          isCritical: true,
          result: 'pending',
          comments: '',
          tested: false
        }
      ],
      hotel: [
        {
          id: '1.1',
          section: 'Rack View',
          number: '1.1',
          name: 'Affichage du Rack',
          description: 'Vérifier l\'affichage du planning des chambres',
          expectedResult: 'Toutes les chambres et réservations s\'affichent correctement',
          isCritical: true,
          result: 'pending',
          comments: '',
          tested: false
        },
        {
          id: '1.2',
          section: 'Rack View',
          number: '1.2',
          name: 'Navigation temporelle',
          description: 'Tester la navigation entre les dates',
          expectedResult: 'Navigation fluide avec mise à jour des données',
          isCritical: true,
          result: 'pending',
          comments: '',
          tested: false
        },
        {
          id: '2.1',
          section: 'Réservations',
          number: '2.1',
          name: 'Création de réservation',
          description: 'Créer une nouvelle réservation',
          expectedResult: 'Réservation créée et visible dans le rack',
          isCritical: true,
          result: 'pending',
          comments: '',
          tested: false
        }
      ]
    };
    
    return templates[module] || [];
  };

  // Créer une nouvelle session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      if (!orgId) throw new Error('Organisation non trouvée');
      
      const { data, error } = await supabase
        .from('test_sessions')
        .insert({
          org_id: orgId,
          module_name: moduleId || '',
          session_name: sessionData.sessionName,
          tester_name: sessionData.testerName,
          test_environment: sessionData.environment,
          platform_version: sessionData.platformVersion,
          notes: sessionData.notes,
          status: 'in_progress'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      setCurrentSession({
        id: session.id,
        sessionName: session.session_name,
        testerName: session.tester_name,
        moduleName: session.module_name,
        environment: session.test_environment,
        platformVersion: session.platform_version || '',
        status: session.status as 'in_progress' | 'completed' | 'paused',
        startedAt: session.started_at,
        notes: session.notes || ''
      });
      
      // Initialiser les cas de test
      const templates = getTestTemplates(moduleId || '');
      setTestCases(templates);
      setShowNewSessionDialog(false);
      
      toast.success('Session de test créée avec succès');
    },
    onError: (error) => {
      console.error('Erreur création session:', error);
      toast.error('Erreur lors de la création de la session');
    }
  });

  // Sauvegarder les résultats
  const saveResultsMutation = useMutation({
    mutationFn: async (results: TestCase[]) => {
      if (!currentSession) return;
      
      const testResults = results.map(test => ({
        session_id: currentSession.id,
        test_section: test.section,
        test_number: test.number,
        test_name: test.name,
        test_description: test.description,
        result: test.result,
        comments: test.comments,
        tested_at: test.tested ? new Date().toISOString() : null
      }));
      
      // Supprimer les anciens résultats et insérer les nouveaux
      await supabase
        .from('test_results')
        .delete()
        .eq('session_id', currentSession.id);
      
      const { error } = await supabase
        .from('test_results')
        .insert(testResults);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Résultats sauvegardés');
    },
    onError: (error) => {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  });

  const handleCreateSession = () => {
    if (!sessionForm.sessionName || !sessionForm.testerName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    createSessionMutation.mutate(sessionForm);
  };

  const updateTestResult = (testId: string, field: string, value: any) => {
    setTestCases(prev => prev.map(test => 
      test.id === testId 
        ? { 
            ...test, 
            [field]: value,
            tested: field === 'result' && value !== 'pending' ? true : test.tested
          }
        : test
    ));
  };

  const saveResults = () => {
    saveResultsMutation.mutate(testCases);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'ko':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'skipped':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProgress = () => {
    const tested = testCases.filter(t => t.tested).length;
    const total = testCases.length;
    const passed = testCases.filter(t => t.result === 'ok').length;
    const failed = testCases.filter(t => t.result === 'ko').length;
    
    return { tested, total, passed, failed, percentage: total ? (tested / total) * 100 : 0 };
  };

  const progress = getProgress();

  if (showNewSessionDialog) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>🧪 Nouvelle Session de Test</CardTitle>
            <CardDescription>
              Module: {moduleId?.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessionName">Nom de la session *</Label>
                <Input
                  id="sessionName"
                  placeholder="Ex: Test v2.1.0 - Restaurant"
                  value={sessionForm.sessionName}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, sessionName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testerName">Nom du testeur *</Label>
                <Input
                  id="testerName"
                  placeholder="Votre nom"
                  value={sessionForm.testerName}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, testerName: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Environnement</Label>
                <Select value={sessionForm.environment} onValueChange={(value) => setSessionForm(prev => ({ ...prev, environment: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Développement</SelectItem>
                    <SelectItem value="staging">Pré-production</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platformVersion">Version Plateforme</Label>
                <Input
                  id="platformVersion"
                  placeholder="Ex: v2.1.0"
                  value={sessionForm.platformVersion}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, platformVersion: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes initiales</Label>
              <Textarea
                id="notes"
                placeholder="Objectifs du test, contexte, etc."
                value={sessionForm.notes}
                onChange={(e) => setSessionForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={() => navigate('/testing')} variant="outline">
                Annuler
              </Button>
              <Button onClick={handleCreateSession} disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? 'Création...' : 'Créer Session'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/testing')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Test: {currentSession?.sessionName}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {currentSession?.testerName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {currentSession?.startedAt && new Date(currentSession.startedAt).toLocaleDateString('fr-FR')}
              </span>
              <Badge variant="outline">
                {currentSession?.environment}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={saveResults} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Progression */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{progress.tested}</div>
              <div className="text-sm text-muted-foreground">Tests effectués</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{progress.passed}</div>
              <div className="text-sm text-muted-foreground">Réussis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{progress.failed}</div>
              <div className="text-sm text-muted-foreground">Échoués</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(progress.percentage)}%</div>
              <div className="text-sm text-muted-foreground">Progression</div>
            </div>
          </div>
          
          <div className="mt-4 w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des tests */}
      <div className="space-y-6">
        {Object.entries(
          testCases.reduce((acc, test) => {
            if (!acc[test.section]) acc[test.section] = [];
            acc[test.section].push(test);
            return acc;
          }, {} as Record<string, TestCase[]>)
        ).map(([section, sectionTests]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section}
                <Badge variant="secondary">
                  {sectionTests.filter(t => t.tested).length}/{sectionTests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {test.number}
                        </span>
                        <h3 className="font-medium">{test.name}</h3>
                        {test.isCritical && (
                          <Badge variant="destructive" className="text-xs">
                            Critique
                          </Badge>
                        )}
                        {getResultIcon(test.result)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {test.description}
                      </p>
                      
                      {test.expectedResult && (
                        <div className="text-sm space-y-1">
                          <span className="font-medium">Résultat attendu:</span>
                          <p className="text-muted-foreground">{test.expectedResult}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Résultat</Label>
                      <Select 
                        value={test.result} 
                        onValueChange={(value) => updateTestResult(test.id, 'result', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="ok">✅ OK</SelectItem>
                          <SelectItem value="ko">❌ KO</SelectItem>
                          <SelectItem value="partial">⚠️ Partiel</SelectItem>
                          <SelectItem value="skipped">⏭️ Ignoré</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label>Commentaires / Anomalies</Label>
                      <Textarea
                        placeholder="Décrivez les problèmes rencontrés ou observations..."
                        value={test.comments}
                        onChange={(e) => updateTestResult(test.id, 'comments', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`tested-${test.id}`}
                      checked={test.tested}
                      onCheckedChange={(checked) => updateTestResult(test.id, 'tested', checked)}
                    />
                    <Label htmlFor={`tested-${test.id}`} className="text-sm">
                      Test effectué
                    </Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zone d'observations libres */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Observations Générales</CardTitle>
          <CardDescription>
            Notes libres sur la session de test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observations générales, améliorations suggérées, problèmes systémiques..."
            value={currentSession?.notes || ''}
            onChange={(e) => setCurrentSession(prev => prev ? { ...prev, notes: e.target.value } : null)}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TestModulePage;