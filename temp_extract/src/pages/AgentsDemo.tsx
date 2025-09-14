/**
 * Page de Démonstration des Agents Manus
 * Démonstration interactive du système d'agents avancés
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import AfricanAgentsDashboard from '@/components/ui/african/african-agents-dashboard'
import { AfricanCard } from '@/components/ui/african/african-card'
import { AfricanButton } from '@/components/ui/african/african-button'
import {
  Brain,
  Zap,
  Target,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Cpu,
  Network,
  Database
} from 'lucide-react'

export function AgentsDemo() {
  const [currentDemo, setCurrentDemo] = useState<'overview' | 'architecture' | 'live'>('overview')
  const [demoStep, setDemoStep] = useState(0)

  const demoSteps = [
    {
      title: "🤖 Système d'Agents Intelligents",
      description: "5 agents spécialisés avec IA intégrée pour automatiser votre restaurant",
      highlight: "Intelligence Artificielle Africaine"
    },
    {
      title: "📊 Analyse Prédictive",
      description: "Prédiction des tendances, optimisation des prix, maintenance prédictive",
      highlight: "Insights Culturels Avancés"
    },
    {
      title: "⚡ Automatisation Intelligente",
      description: "Processus automatisés, rapports générés, notifications contextuelles",
      highlight: "Efficacité Maximale"
    },
    {
      title: "🎯 ROI Mesurable",
      description: "Économies de 40% sur les coûts, augmentation de 25% des revenus",
      highlight: "Impact Business Concret"
    }
  ]

  const agentCapabilities = [
    {
      agent: "Sales Analyst",
      icon: "📈",
      capabilities: [
        "Analyse des tendances saisonnières africaines",
        "Détection des plats populaires par région",
        "Prédiction de la demande selon les événements locaux",
        "Optimisation du menu selon les préférences culturelles"
      ],
      impact: "+25% revenus"
    },
    {
      agent: "Pricing Optimizer",
      icon: "💰",
      capabilities: [
        "Analyse concurrentielle locale",
        "Ajustement selon le pouvoir d'achat régional",
        "Optimisation des marges par produit",
        "Stratégies de prix pour événements spéciaux"
      ],
      impact: "+15% marge"
    },
    {
      agent: "Maintenance Predictor",
      icon: "🔧",
      capabilities: [
        "Prédiction des pannes d'équipement",
        "Optimisation des stocks selon la demande",
        "Planification de la maintenance préventive",
        "Alertes de réapprovisionnement intelligent"
      ],
      impact: "-40% coûts maintenance"
    },
    {
      agent: "Report Generator",
      icon: "📄",
      capabilities: [
        "Rapports financiers avec analyse culturelle",
        "Tableaux de bord personnalisés par région",
        "Insights prédictifs pour la direction",
        "Rapports de conformité automatisés"
      ],
      impact: "90% temps économisé"
    },
    {
      agent: "Process Automator",
      icon: "⚙️",
      capabilities: [
        "Automatisation des commandes récurrentes",
        "Gestion intelligente des stocks",
        "Notifications contextuelles aux clients",
        "Optimisation des horaires de service"
      ],
      impact: "60% tâches automatisées"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % demoSteps.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-african-neutral-50 to-african-primary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-african-primary-600 to-african-accent-600 opacity-90" />
        <div className="absolute inset-0 bg-african-pattern-bogolan opacity-10" />
        
        <div className="relative px-6 py-16 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm font-medium mb-4">
                <Brain className="w-4 h-4" />
                Intelligence Artificielle Africaine
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold font-heading mb-4">
                🤖 Agents Manus
                <br />
                <span className="text-african-accent-200">Avancés</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-african-primary-100 mb-8">
                Automatisation intelligente pour restaurants africains
                <br />
                avec IA culturellement adaptée
              </p>
            </div>

            {/* Demo Steps Animation */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-african-accent-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {demoStep + 1}
                  </div>
                  <h3 className="text-lg font-semibold">{demoSteps[demoStep].title}</h3>
                </div>
                
                <p className="text-african-primary-100 mb-3">
                  {demoSteps[demoStep].description}
                </p>
                
                <div className="inline-flex items-center gap-2 bg-african-accent-400 text-african-accent-900 px-3 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4" />
                  {demoSteps[demoStep].highlight}
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="flex gap-2 mt-4">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 rounded-full transition-all duration-500',
                      index === demoStep ? 'bg-african-accent-400 w-8' : 'bg-white bg-opacity-30 w-2'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AfricanButton
                variant="primary"
                size="lg"
                onClick={() => setCurrentDemo('architecture')}
                icon={<Network className="w-5 h-5" />}
                className="bg-white text-african-primary-700 hover:bg-african-primary-50"
              >
                Voir l'Architecture
              </AfricanButton>
              
              <AfricanButton
                variant="outline"
                size="lg"
                onClick={() => setCurrentDemo('live')}
                icon={<Zap className="w-5 h-5" />}
                className="border-white text-white hover:bg-white hover:text-african-primary-700"
              >
                Démonstration Live
              </AfricanButton>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Overview */}
          {currentDemo === 'overview' && (
            <div className="space-y-12">
              {/* Architecture Overview */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-african-primary-700 font-heading mb-4">
                  Architecture des Agents Intelligents
                </h2>
                <p className="text-lg text-african-neutral-600 max-w-3xl mx-auto">
                  Un système d'orchestration avancé avec 5 agents spécialisés, 
                  intégration IA et compatibilité hybride Elyx/Moderne
                </p>
              </div>

              {/* Architecture Diagram */}
              <AfricanCard className="p-8 text-center">
                <img 
                  src="/architecture_agents_manus.png" 
                  alt="Architecture des Agents Manus" 
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
                />
                <p className="text-sm text-african-neutral-600 mt-4">
                  Architecture complète du système d'agents avec orchestration intelligente
                </p>
              </AfricanCard>

              {/* Agents Capabilities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {agentCapabilities.map((agent, index) => (
                  <AfricanCard key={index} className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{agent.icon}</div>
                      <h3 className="font-semibold text-african-primary-700 font-heading">
                        {agent.agent}
                      </h3>
                      <div className="inline-flex items-center gap-1 bg-african-success-100 text-african-success-700 px-2 py-1 rounded-full text-sm font-medium mt-2">
                        <TrendingUp className="w-3 h-3" />
                        {agent.impact}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {agent.capabilities.map((capability, capIndex) => (
                        <div key={capIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-african-success-500 flex-shrink-0 mt-0.5" />
                          <span className="text-african-neutral-700">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </AfricanCard>
                ))}
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AfricanCard variant="pattern" pattern="kita" patternIntensity="light" className="p-6 text-center">
                  <Shield className="w-12 h-12 text-african-primary-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-african-primary-700 mb-2">Sécurité Enterprise</h3>
                  <p className="text-sm text-african-neutral-600">
                    Chiffrement bout-en-bout, authentification multi-facteurs, 
                    conformité RGPD et réglementations africaines
                  </p>
                </AfricanCard>
                
                <AfricanCard variant="pattern" pattern="bogolan" patternIntensity="light" className="p-6 text-center">
                  <Cpu className="w-12 h-12 text-african-accent-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-african-accent-700 mb-2">Performance Optimisée</h3>
                  <p className="text-sm text-african-neutral-600">
                    Optimisé pour les connexions africaines, cache intelligent, 
                    synchronisation offline, mode économie de données
                  </p>
                </AfricanCard>
                
                <AfricanCard variant="pattern" pattern="geometric" patternIntensity="light" className="p-6 text-center">
                  <Lightbulb className="w-12 h-12 text-african-success-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-african-success-700 mb-2">Intelligence Culturelle</h3>
                  <p className="text-sm text-african-neutral-600">
                    IA entraînée sur les spécificités africaines, insights culturels, 
                    adaptation aux habitudes locales
                  </p>
                </AfricanCard>
              </div>
            </div>
          )}

          {/* Architecture Detail */}
          {currentDemo === 'architecture' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-african-primary-700 font-heading mb-4">
                  Architecture Technique Détaillée
                </h2>
                <p className="text-lg text-african-neutral-600">
                  Système d'orchestration multi-couches avec IA intégrée
                </p>
              </div>

              {/* Detailed Architecture */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orchestration Layer */}
                <AfricanCard className="p-6">
                  <div className="text-center mb-4">
                    <Cpu className="w-12 h-12 text-african-primary-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-african-primary-700 font-heading">
                      Couche d'Orchestration
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-african-primary-50 rounded-lg">
                      <h4 className="font-medium text-african-primary-700 text-sm">Manus Agent System</h4>
                      <p className="text-xs text-african-primary-600 mt-1">
                        Orchestrateur principal avec planification intelligente
                      </p>
                    </div>
                    
                    <div className="p-3 bg-african-accent-50 rounded-lg">
                      <h4 className="font-medium text-african-accent-700 text-sm">Queue Manager</h4>
                      <p className="text-xs text-african-accent-600 mt-1">
                        Gestion des tâches avec priorisation dynamique
                      </p>
                    </div>
                    
                    <div className="p-3 bg-african-success-50 rounded-lg">
                      <h4 className="font-medium text-african-success-700 text-sm">Metrics Monitor</h4>
                      <p className="text-xs text-african-success-600 mt-1">
                        Surveillance temps réel et optimisation continue
                      </p>
                    </div>
                  </div>
                </AfricanCard>

                {/* AI Layer */}
                <AfricanCard className="p-6">
                  <div className="text-center mb-4">
                    <Brain className="w-12 h-12 text-african-accent-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-african-accent-700 font-heading">
                      Intelligence Artificielle
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-african-info-50 rounded-lg">
                      <h4 className="font-medium text-african-info-700 text-sm">Manus AI API</h4>
                      <p className="text-xs text-african-info-600 mt-1">
                        Moteur IA avec contexte culturel africain
                      </p>
                    </div>
                    
                    <div className="p-3 bg-african-warning-50 rounded-lg">
                      <h4 className="font-medium text-african-warning-700 text-sm">Machine Learning</h4>
                      <p className="text-xs text-african-warning-600 mt-1">
                        Apprentissage adaptatif et prédictions avancées
                      </p>
                    </div>
                    
                    <div className="p-3 bg-african-error-50 rounded-lg">
                      <h4 className="font-medium text-african-error-700 text-sm">NLP Culturel</h4>
                      <p className="text-xs text-african-error-600 mt-1">
                        Traitement du langage avec nuances africaines
                      </p>
                    </div>
                  </div>
                </AfricanCard>

                {/* Integration Layer */}
                <AfricanCard className="p-6">
                  <div className="text-center mb-4">
                    <Database className="w-12 h-12 text-african-success-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-african-success-700 font-heading">
                      Intégrations
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-african-success-50 rounded-lg">
                      <h4 className="font-medium text-african-success-700 text-sm">Supabase</h4>
                      <p className="text-xs text-african-success-600 mt-1">
                        Base de données moderne avec API temps réel
                      </p>
                    </div>
                    
                    <div className="p-3 bg-african-warning-50 rounded-lg">
                      <h4 className="font-medium text-african-warning-700 text-sm">Elyx Legacy</h4>
                      <p className="text-xs text-african-warning-600 mt-1">
                        Compatibilité avec systèmes existants
                      </p>
                    </div>
                    
                    <div className="p-3 bg-african-neutral-50 rounded-lg">
                      <h4 className="font-medium text-african-neutral-700 text-sm">APIs Externes</h4>
                      <p className="text-xs text-african-neutral-600 mt-1">
                        Intégration avec services tiers africains
                      </p>
                    </div>
                  </div>
                </AfricanCard>
              </div>

              <div className="text-center">
                <AfricanButton
                  variant="primary"
                  size="lg"
                  onClick={() => setCurrentDemo('live')}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Voir la Démonstration Live
                </AfricanButton>
              </div>
            </div>
          )}

          {/* Live Demo */}
          {currentDemo === 'live' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-african-primary-700 font-heading mb-4">
                  Démonstration Interactive
                </h2>
                <p className="text-lg text-african-neutral-600">
                  Testez les agents en temps réel avec des données simulées
                </p>
              </div>

              <AfricanAgentsDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentsDemo

