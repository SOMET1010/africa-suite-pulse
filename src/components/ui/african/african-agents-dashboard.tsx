/**
 * Dashboard des Agents Manus Avancés
 * Interface de visualisation et contrôle des agents IA
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AfricanCard, AfricanStatCard } from './african-card'
import { AfricanButton, AfricanButtonGroup } from './african-button'
import { ManusAgentSystem, ManusAgent, AgentTask, createManusAgentSystem } from '@/agents/manus-agent-system'
import {
  Bot,
  Brain,
  Zap,
  BarChart3,
  DollarSign,
  Wrench,
  FileText,
  Cog,
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  Eye,
  Calendar,
  Target,
  Lightbulb,
  Cpu,
  Database,
  Network,
  Shield
} from 'lucide-react'

interface AfricanAgentsDashboardProps {
  className?: string
}

export function AfricanAgentsDashboard({ className }: AfricanAgentsDashboardProps) {
  const [agentSystem, setAgentSystem] = useState<ManusAgentSystem | null>(null)
  const [agents, setAgents] = useState<ManusAgent[]>([])
  const [systemMetrics, setSystemMetrics] = useState<any>(null)
  const [selectedAgent, setSelectedAgent] = useState<ManusAgent | null>(null)
  const [isSystemRunning, setIsSystemRunning] = useState(false)
  const [showArchitecture, setShowArchitecture] = useState(false)

  // Initialiser le système d'agents
  useEffect(() => {
    const system = createManusAgentSystem({
      manusApiKey: 'demo-key' // En production, utiliser la vraie clé
    })
    setAgentSystem(system)
    
    // Charger les données initiales
    updateDashboard(system)
    
    // Mise à jour périodique
    const interval = setInterval(() => {
      if (system) {
        updateDashboard(system)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const updateDashboard = (system: ManusAgentSystem) => {
    setAgents(system.getAgentsStatus())
    setSystemMetrics(system.getSystemMetrics())
  }

  const handleStartSystem = async () => {
    if (agentSystem) {
      await agentSystem.start()
      setIsSystemRunning(true)
    }
  }

  const handleStopSystem = async () => {
    if (agentSystem) {
      await agentSystem.stop()
      setIsSystemRunning(false)
    }
  }

  const handleExecuteAgent = async (agentId: string) => {
    if (agentSystem) {
      try {
        await agentSystem.executeAgent(agentId)
        updateDashboard(agentSystem)
      } catch (error) {
        console.error('Erreur exécution agent:', error)
      }
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <BarChart3 className="w-5 h-5" />
      case 'optimization': return <DollarSign className="w-5 h-5" />
      case 'prediction': return <Wrench className="w-5 h-5" />
      case 'reporting': return <FileText className="w-5 h-5" />
      case 'automation': return <Cog className="w-5 h-5" />
      default: return <Bot className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-african-warning-600 bg-african-warning-100'
      case 'completed': return 'text-african-success-600 bg-african-success-100'
      case 'error': return 'text-african-error-600 bg-african-error-100'
      default: return 'text-african-neutral-600 bg-african-neutral-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header avec contrôles système */}
      <AfricanCard variant="pattern" pattern="bogolan" patternIntensity="light">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl font-bold text-african-primary-700 font-heading mb-2 flex items-center gap-2">
                <Brain className="w-7 h-7" />
                🤖 Agents Manus Avancés
              </h2>
              <p className="text-african-neutral-600">
                Intelligence artificielle intégrée pour l'automatisation et l'optimisation
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <AfricanButtonGroup orientation="horizontal">
                <AfricanButton
                  variant={isSystemRunning ? "outline" : "primary"}
                  size="sm"
                  onClick={handleStartSystem}
                  disabled={isSystemRunning}
                  icon={<Play className="w-4 h-4" />}
                >
                  Démarrer
                </AfricanButton>
                <AfricanButton
                  variant={isSystemRunning ? "primary" : "outline"}
                  size="sm"
                  onClick={handleStopSystem}
                  disabled={!isSystemRunning}
                  icon={<Pause className="w-4 h-4" />}
                >
                  Arrêter
                </AfricanButton>
              </AfricanButtonGroup>
              
              <AfricanButton
                variant="outline"
                size="sm"
                onClick={() => setShowArchitecture(!showArchitecture)}
                icon={<Network className="w-4 h-4" />}
              >
                Architecture
              </AfricanButton>
            </div>
          </div>
        </div>
      </AfricanCard>

      {/* Architecture du système */}
      {showArchitecture && (
        <AfricanCard className="p-6">
          <h3 className="text-lg font-semibold text-african-primary-700 mb-4 font-heading flex items-center gap-2">
            <Network className="w-5 h-5" />
            Architecture des Agents Manus
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Couche d'orchestration */}
            <div className="space-y-4">
              <h4 className="font-medium text-african-primary-600 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Orchestration
              </h4>
              
              <div className="space-y-2">
                <div className="p-3 bg-african-primary-50 rounded-lg border border-african-primary-200">
                  <div className="font-medium text-african-primary-700 text-sm">Manus Agent System</div>
                  <div className="text-xs text-african-primary-600 mt-1">
                    • Planification des tâches<br/>
                    • Gestion des ressources<br/>
                    • Monitoring temps réel
                  </div>
                </div>
                
                <div className="p-3 bg-african-accent-50 rounded-lg border border-african-accent-200">
                  <div className="font-medium text-african-accent-700 text-sm">Queue Manager</div>
                  <div className="text-xs text-african-accent-600 mt-1">
                    • Priorisation des tâches<br/>
                    • Load balancing<br/>
                    • Retry automatique
                  </div>
                </div>
              </div>
            </div>

            {/* Agents spécialisés */}
            <div className="space-y-4">
              <h4 className="font-medium text-african-primary-600 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Agents Spécialisés
              </h4>
              
              <div className="space-y-2">
                {[
                  { name: 'Sales Analyst', color: 'success', icon: BarChart3 },
                  { name: 'Pricing Optimizer', color: 'warning', icon: DollarSign },
                  { name: 'Maintenance Predictor', color: 'error', icon: Wrench },
                  { name: 'Report Generator', color: 'info', icon: FileText },
                  { name: 'Process Automator', color: 'secondary', icon: Cog }
                ].map((agent, index) => (
                  <div key={index} className={`p-2 bg-african-${agent.color}-50 rounded border border-african-${agent.color}-200`}>
                    <div className={`font-medium text-african-${agent.color}-700 text-xs flex items-center gap-1`}>
                      <agent.icon className="w-3 h-3" />
                      {agent.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intégrations */}
            <div className="space-y-4">
              <h4 className="font-medium text-african-primary-600 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Intégrations
              </h4>
              
              <div className="space-y-2">
                <div className="p-3 bg-african-success-50 rounded-lg border border-african-success-200">
                  <div className="font-medium text-african-success-700 text-sm">Supabase</div>
                  <div className="text-xs text-african-success-600 mt-1">
                    • Base de données moderne<br/>
                    • API temps réel<br/>
                    • Authentification
                  </div>
                </div>
                
                <div className="p-3 bg-african-warning-50 rounded-lg border border-african-warning-200">
                  <div className="font-medium text-african-warning-700 text-sm">Elyx Legacy</div>
                  <div className="text-xs text-african-warning-600 mt-1">
                    • Données existantes<br/>
                    • Migration progressive<br/>
                    • Compatibilité hybride
                  </div>
                </div>
                
                <div className="p-3 bg-african-info-50 rounded-lg border border-african-info-200">
                  <div className="font-medium text-african-info-700 text-sm">Manus AI API</div>
                  <div className="text-xs text-african-info-600 mt-1">
                    • Intelligence artificielle<br/>
                    • Analyse prédictive<br/>
                    • Insights culturels
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Flux de données */}
          <div className="mt-6 p-4 bg-african-neutral-50 rounded-lg">
            <h5 className="font-medium text-african-neutral-700 mb-3">Flux de Données</h5>
            <div className="flex items-center justify-between text-sm text-african-neutral-600">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Sources</span>
              </div>
              <div className="flex-1 border-t border-dashed border-african-neutral-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>Agents IA</span>
              </div>
              <div className="flex-1 border-t border-dashed border-african-neutral-300 mx-4"></div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Actions</span>
              </div>
            </div>
          </div>
        </AfricanCard>
      )}

      {/* Métriques système */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AfricanStatCard
            title="Agents Actifs"
            value={systemMetrics.activeAgents}
            description={`${systemMetrics.totalAgents} agents au total`}
            icon={<Bot className="w-6 h-6" />}
            trend="neutral"
          />
          
          <AfricanStatCard
            title="Taux de Succès"
            value={`${Math.round(systemMetrics.averageSuccessRate * 100)}%`}
            description="Moyenne des agents"
            icon={<CheckCircle className="w-6 h-6" />}
            trend={systemMetrics.averageSuccessRate > 0.8 ? "up" : "down"}
          />
          
          <AfricanStatCard
            title="Tâches en Attente"
            value={systemMetrics.pendingTasks}
            description={`${systemMetrics.totalTasks} tâches totales`}
            icon={<Clock className="w-6 h-6" />}
            trend="neutral"
          />
          
          <AfricanStatCard
            title="Système"
            value={isSystemRunning ? "Actif" : "Arrêté"}
            description={isSystemRunning ? "Fonctionnel" : "En attente"}
            icon={<Activity className="w-6 h-6" />}
            trend={isSystemRunning ? "up" : "neutral"}
          />
        </div>
      )}

      {/* Liste des agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <AfricanCard key={agent.id} className="p-6">
            <div className="space-y-4">
              {/* Header de l'agent */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-african-primary-100 rounded-lg">
                    {getAgentIcon(agent.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-african-primary-700 font-heading">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-african-neutral-600 mt-1">
                      {agent.description}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                  getStatusColor(agent.status)
                )}>
                  {getStatusIcon(agent.status)}
                  {agent.status}
                </div>
              </div>

              {/* Métriques de l'agent */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-african-primary-700">
                    {agent.metrics.totalRuns}
                  </div>
                  <div className="text-xs text-african-neutral-600">Exécutions</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-african-success-700">
                    {Math.round(agent.metrics.successRate * 100)}%
                  </div>
                  <div className="text-xs text-african-neutral-600">Succès</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-african-warning-700">
                    {Math.round(agent.metrics.averageExecutionTime)}ms
                  </div>
                  <div className="text-xs text-african-neutral-600">Temps moy.</div>
                </div>
              </div>

              {/* Capacités */}
              <div>
                <h4 className="text-sm font-medium text-african-neutral-700 mb-2">Capacités</h4>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((capability, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-african-accent-100 text-african-accent-700 text-xs rounded-full"
                    >
                      {capability}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="px-2 py-1 bg-african-neutral-100 text-african-neutral-600 text-xs rounded-full">
                      +{agent.capabilities.length - 3} autres
                    </span>
                  )}
                </div>
              </div>

              {/* Dernière exécution */}
              <div className="flex items-center justify-between text-sm text-african-neutral-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {agent.lastRun 
                      ? `Dernière: ${agent.lastRun.toLocaleDateString('fr-FR')}`
                      : 'Jamais exécuté'
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {agent.nextScheduledRun 
                      ? `Prochaine: ${agent.nextScheduledRun.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Non programmé'
                    }
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-african-neutral-200">
                <AfricanButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleExecuteAgent(agent.id)}
                  disabled={agent.status === 'running'}
                  icon={<Play className="w-4 h-4" />}
                  className="flex-1"
                >
                  Exécuter
                </AfricanButton>
                
                <AfricanButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAgent(agent)}
                  icon={<Eye className="w-4 h-4" />}
                  className="flex-1"
                >
                  Détails
                </AfricanButton>
                
                <AfricanButton
                  variant="outline"
                  size="sm"
                  icon={<Settings className="w-4 h-4" />}
                >
                  Config
                </AfricanButton>
              </div>
            </div>
          </AfricanCard>
        ))}
      </div>

      {/* Modal de détails d'agent */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <AfricanCard className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-african-primary-700 font-heading">
                  Détails de l'Agent
                </h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-african-neutral-500 hover:text-african-neutral-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-african-primary-600 mb-2">{selectedAgent.name}</h4>
                  <p className="text-sm text-african-neutral-600">{selectedAgent.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-african-primary-600 mb-2">Toutes les Capacités</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-african-neutral-50 rounded">
                        <Lightbulb className="w-4 h-4 text-african-accent-500" />
                        <span className="text-sm text-african-neutral-700">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-african-primary-600 mb-2">Métriques Détaillées</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-african-success-50 rounded">
                      <div className="text-sm text-african-success-600">Exécutions Réussies</div>
                      <div className="text-lg font-semibold text-african-success-700">
                        {Math.round(selectedAgent.metrics.totalRuns * selectedAgent.metrics.successRate)}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-african-error-50 rounded">
                      <div className="text-sm text-african-error-600">Erreurs</div>
                      <div className="text-lg font-semibold text-african-error-700">
                        {selectedAgent.metrics.errorCount}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-african-warning-50 rounded">
                      <div className="text-sm text-african-warning-600">Temps Moyen</div>
                      <div className="text-lg font-semibold text-african-warning-700">
                        {Math.round(selectedAgent.metrics.averageExecutionTime)}ms
                      </div>
                    </div>
                    
                    <div className="p-3 bg-african-info-50 rounded">
                      <div className="text-sm text-african-info-600">Score d'Impact</div>
                      <div className="text-lg font-semibold text-african-info-700">
                        {selectedAgent.metrics.impactScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AfricanCard>
        </div>
      )}
    </div>
  )
}

export default AfricanAgentsDashboard

