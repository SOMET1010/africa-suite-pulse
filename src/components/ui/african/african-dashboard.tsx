/**
 * Dashboard Africain Authentique
 * Interface de tableau de bord avec design culturel africain
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { AfricanCard, AfricanStatCard } from './african-card'
import { AfricanButton } from './african-button'
import { useAfricanTheme } from '@/components/providers/african-theme-provider'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  Sun,
  Moon,
  Settings,
  Bell
} from 'lucide-react'

interface AfricanDashboardProps {
  className?: string
  children?: React.ReactNode
}

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

interface DashboardStatsProps {
  stats: Array<{
    title: string
    value: string | number
    description?: string
    icon?: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
    change?: string
  }>
  className?: string
}

// Composant principal du dashboard
export function AfricanDashboard({ className, children }: AfricanDashboardProps) {
  const { isAfricanTheme } = useAfricanTheme()
  
  return (
    <div className={cn(
      'min-h-screen transition-all duration-300',
      isAfricanTheme && 'african-theme',
      className
    )}>
      {children}
    </div>
  )
}

// Header du dashboard avec salutation africaine
export function AfricanDashboardHeader({ 
  title, 
  subtitle, 
  actions, 
  className 
}: DashboardHeaderProps) {
  const { isAfricanTheme } = useAfricanTheme()
  const currentHour = new Date().getHours()
  
  // Salutations en français avec touche africaine
  const getGreeting = () => {
    if (currentHour < 12) return "Bonjour et bienvenue"
    if (currentHour < 17) return "Bon après-midi"
    return "Bonsoir"
  }
  
  const getGreetingIcon = () => {
    if (currentHour < 12) return <Sun className="w-5 h-5 text-african-warning-500" />
    if (currentHour < 17) return <Sun className="w-5 h-5 text-african-accent-500" />
    return <Moon className="w-5 h-5 text-african-primary-400" />
  }

  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between',
      'p-6 border-b',
      isAfricanTheme 
        ? 'bg-gradient-to-r from-african-primary-500 to-african-primary-600 border-african-primary-700 text-white' 
        : 'bg-white border-gray-200',
      className
    )}>
      <div className="flex items-center space-x-3 mb-4 sm:mb-0">
        {getGreetingIcon()}
        <div>
          <div className="flex items-center space-x-2">
            <h1 className={cn(
              'text-2xl font-bold',
              isAfricanTheme ? 'font-heading text-white' : 'text-gray-900'
            )}>
              {title}
            </h1>
            <span className={cn(
              'text-sm px-2 py-1 rounded-full',
              isAfricanTheme 
                ? 'bg-african-secondary-400 text-african-secondary-900' 
                : 'bg-blue-100 text-blue-800'
            )}>
              {getGreeting()}
            </span>
          </div>
          {subtitle && (
            <p className={cn(
              'text-sm mt-1',
              isAfricanTheme ? 'text-african-neutral-100' : 'text-gray-600'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
}

// Section de statistiques avec design africain
export function AfricanDashboardStats({ stats, className }: DashboardStatsProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6',
      className
    )}>
      {stats.map((stat, index) => (
        <AfricanStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          trend={stat.trend}
          className="hover:scale-105 transition-transform duration-200"
        />
      ))}
    </div>
  )
}

// Grille de contenu principal
export function AfricanDashboardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn(
      'flex-1 p-6 space-y-6',
      className
    )}>
      {children}
    </div>
  )
}

// Sidebar africaine
export function AfricanDashboardSidebar({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const { isAfricanTheme } = useAfricanTheme()
  
  return (
    <aside className={cn(
      'w-64 border-r min-h-screen',
      isAfricanTheme 
        ? 'bg-gradient-to-b from-african-neutral-50 to-african-neutral-100 border-african-neutral-200' 
        : 'bg-gray-50 border-gray-200',
      className
    )}>
      <div className="p-4">
        {children}
      </div>
    </aside>
  )
}

// Widget de dashboard africain
export function AfricanDashboardWidget({ 
  title, 
  children, 
  actions,
  pattern = 'none',
  className 
}: {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  pattern?: 'none' | 'bogolan' | 'kita'
  className?: string
}) {
  return (
    <AfricanCard 
      variant="default" 
      pattern={pattern}
      patternIntensity="light"
      className={cn('h-full', className)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-african-primary-700 font-heading">
            {title}
          </h3>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </AfricanCard>
  )
}

// Exemple de dashboard complet
export function AfricanDashboardExample() {
  const { isAfricanTheme, toggleAfricanTheme } = useAfricanTheme()
  
  const sampleStats = [
    {
      title: "Revenus du jour",
      value: "125 000 FCFA",
      description: "+12% vs hier",
      icon: <DollarSign className="w-6 h-6" />,
      trend: 'up' as const,
      change: "+12%"
    },
    {
      title: "Réservations",
      value: "24",
      description: "Chambres occupées",
      icon: <Calendar className="w-6 h-6" />,
      trend: 'up' as const,
      change: "+3"
    },
    {
      title: "Clients actifs",
      value: "156",
      description: "En ligne maintenant",
      icon: <Users className="w-6 h-6" />,
      trend: 'neutral' as const
    },
    {
      title: "Taux d'occupation",
      value: "87%",
      description: "Objectif: 85%",
      icon: <BarChart3 className="w-6 h-6" />,
      trend: 'up' as const,
      change: "+2%"
    }
  ]

  return (
    <AfricanDashboard>
      <AfricanDashboardHeader
        title="Africa Suite Pulse"
        subtitle="Tableau de bord hôtelier authentiquement africain"
        actions={
          <div className="flex items-center space-x-2">
            <AfricanButton
              variant="secondary"
              size="sm"
              icon={<Bell className="w-4 h-4" />}
            >
              Notifications
            </AfricanButton>
            <AfricanButton
              variant="outline"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
              onClick={toggleAfricanTheme}
            >
              {isAfricanTheme ? 'Thème Standard' : 'Thème Africain'}
            </AfricanButton>
          </div>
        }
      />
      
      <AfricanDashboardStats stats={sampleStats} />
      
      <AfricanDashboardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AfricanDashboardWidget 
            title="Revenus par mois"
            pattern="bogolan"
            actions={
              <AfricanButton variant="ghost" size="sm">
                Voir détails
              </AfricanButton>
            }
          >
            <div className="h-64 flex items-center justify-center text-african-neutral-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-african-primary-400" />
                <p>Graphique des revenus</p>
                <p className="text-sm">Intégration en cours...</p>
              </div>
            </div>
          </AfricanDashboardWidget>
          
          <AfricanDashboardWidget 
            title="Réservations récentes"
            pattern="kita"
          >
            <div className="space-y-3">
              {[
                { name: "Amadou Diallo", room: "Suite Baobab", time: "Il y a 2h" },
                { name: "Fatou Sow", room: "Chambre Savane", time: "Il y a 4h" },
                { name: "Ibrahim Traoré", room: "Suite Kita", time: "Il y a 6h" }
              ].map((reservation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-african-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-african-neutral-800">{reservation.name}</p>
                    <p className="text-sm text-african-neutral-600">{reservation.room}</p>
                  </div>
                  <span className="text-xs text-african-neutral-500">{reservation.time}</span>
                </div>
              ))}
            </div>
          </AfricanDashboardWidget>
        </div>
        
        <AfricanDashboardWidget 
          title="Activité en temps réel"
          pattern="bogolan"
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-african-success-50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-african-success-600" />
              <p className="font-semibold text-african-success-800">Revenus en hausse</p>
              <p className="text-sm text-african-success-600">+15% cette semaine</p>
            </div>
            <div className="text-center p-4 bg-african-warning-50 rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-african-warning-600" />
              <p className="font-semibold text-african-warning-800">Nouvelles réservations</p>
              <p className="text-sm text-african-warning-600">8 aujourd'hui</p>
            </div>
            <div className="text-center p-4 bg-african-accent-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-african-accent-600" />
              <p className="font-semibold text-african-accent-800">Satisfaction client</p>
              <p className="text-sm text-african-accent-600">4.8/5 étoiles</p>
            </div>
          </div>
        </AfricanDashboardWidget>
      </AfricanDashboardContent>
    </AfricanDashboard>
  )
}

// Export des composants
export {
  AfricanDashboardHeader,
  AfricanDashboardStats,
  AfricanDashboardContent,
  AfricanDashboardSidebar,
  AfricanDashboardWidget,
  AfricanDashboardExample
}

