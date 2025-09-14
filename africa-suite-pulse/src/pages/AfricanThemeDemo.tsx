/**
 * Page de Démonstration du Thème Africain
 * Showcase complet du design africain authentique
 */

import React from 'react'
import { AfricanDashboardExample } from '@/components/ui/african/african-dashboard'
import { AfricanCard, AfricanStatCard } from '@/components/ui/african/african-card'
import { AfricanButton, AfricanButtonGroup } from '@/components/ui/african/african-button'
import { AfricanThemeToggle, AfricanThemeSettings } from '@/components/providers/african-theme-provider'
import { 
  Heart, 
  Star, 
  MapPin, 
  Calendar,
  Users,
  TrendingUp,
  Coffee,
  Utensils,
  Bed,
  Wifi,
  Car,
  Shield
} from 'lucide-react'

export default function AfricanThemeDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-african-neutral-50 to-african-neutral-100">
      {/* Header de démonstration */}
      <div className="bg-gradient-to-r from-african-primary-500 to-african-primary-600 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold font-heading mb-2">
                🌍 Africa Suite Pulse
              </h1>
              <p className="text-xl text-african-neutral-100 mb-4">
                Design Africain Authentique - Démonstration Interactive
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-african-secondary-400 text-african-secondary-900 px-3 py-1 rounded-full">
                  Motifs Bogolan
                </span>
                <span className="bg-african-accent-400 text-white px-3 py-1 rounded-full">
                  Couleurs Terre
                </span>
                <span className="bg-african-success-400 text-white px-3 py-1 rounded-full">
                  Typographie Culturelle
                </span>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 space-y-4">
              <AfricanThemeToggle />
              <AfricanButtonGroup orientation="horizontal">
                <AfricanButton variant="secondary" size="sm">
                  Documentation
                </AfricanButton>
                <AfricanButton variant="accent" size="sm">
                  Voir le Code
                </AfricanButton>
              </AfricanButtonGroup>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Configuration du thème */}
        <AfricanThemeSettings />

        {/* Section des composants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cartes de statistiques */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-african-primary-700">
              Cartes Statistiques
            </h2>
            
            <AfricanStatCard
              title="Revenus Journaliers"
              value="247 500 FCFA"
              description="+18% vs hier"
              icon={<TrendingUp className="w-6 h-6" />}
              trend="up"
            />
            
            <AfricanStatCard
              title="Réservations"
              value="42"
              description="Chambres occupées"
              icon={<Bed className="w-6 h-6" />}
              trend="up"
            />
            
            <AfricanStatCard
              title="Satisfaction Client"
              value="4.9/5"
              description="Excellent service"
              icon={<Star className="w-6 h-6" />}
              trend="neutral"
            />
          </div>

          {/* Boutons africains */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-african-primary-700">
              Boutons Authentiques
            </h2>
            
            <div className="space-y-3">
              <AfricanButton variant="primary" fullWidth>
                Réserver Maintenant
              </AfricanButton>
              
              <AfricanButton 
                variant="secondary" 
                fullWidth
                icon={<Calendar className="w-4 h-4" />}
              >
                Planifier Séjour
              </AfricanButton>
              
              <AfricanButton 
                variant="accent" 
                fullWidth
                pattern="subtle"
              >
                Découvrir l'Afrique
              </AfricanButton>
              
              <AfricanButton 
                variant="earth" 
                fullWidth
                icon={<MapPin className="w-4 h-4" />}
              >
                Localiser Hôtel
              </AfricanButton>
              
              <AfricanButton 
                variant="sunset" 
                fullWidth
                pattern="subtle"
              >
                Coucher de Soleil
              </AfricanButton>
              
              <AfricanButton variant="outline" fullWidth>
                En Savoir Plus
              </AfricanButton>
            </div>
          </div>

          {/* Cartes avec motifs */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-african-primary-700">
              Cartes avec Motifs
            </h2>
            
            <AfricanCard 
              variant="pattern" 
              pattern="bogolan" 
              patternIntensity="light"
              className="p-6"
            >
              <h3 className="text-lg font-semibold text-african-primary-700 mb-2 font-heading">
                Motif Bogolan
              </h3>
              <p className="text-african-neutral-600 text-sm">
                Géométrie traditionnelle malienne intégrée subtilement dans le design moderne.
              </p>
            </AfricanCard>
            
            <AfricanCard 
              variant="accent" 
              pattern="kita" 
              patternIntensity="medium"
              className="p-6"
            >
              <h3 className="text-lg font-semibold text-african-primary-700 mb-2 font-heading">
                Motif Kita
              </h3>
              <p className="text-african-neutral-600 text-sm">
                Artisanat ouest-africain célébrant la richesse culturelle du continent.
              </p>
            </AfricanCard>
            
            <AfricanCard 
              variant="earth" 
              className="p-6"
            >
              <h3 className="text-lg font-semibold text-african-primary-700 mb-2 font-heading">
                Tons Terre
              </h3>
              <p className="text-african-neutral-600 text-sm">
                Palette inspirée des terres africaines : argile, ocre, latérite.
              </p>
            </AfricanCard>
          </div>
        </div>

        {/* Section services hôteliers */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-african-secondary-400 to-african-secondary-500 p-6">
            <h2 className="text-2xl font-bold text-white font-heading">
              Services Hôteliers Africains
            </h2>
            <p className="text-african-secondary-100 mt-2">
              Découvrez nos services inspirés de l'hospitalité africaine
            </p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Utensils className="w-8 h-8" />, title: "Restaurant Traditionnel", desc: "Cuisine authentique africaine" },
              { icon: <Coffee className="w-8 h-8" />, title: "Café Baobab", desc: "Café et thés d'Afrique" },
              { icon: <Wifi className="w-8 h-8" />, title: "WiFi Gratuit", desc: "Connexion haut débit" },
              { icon: <Car className="w-8 h-8" />, title: "Navette Aéroport", desc: "Service 24h/24" }
            ].map((service, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-african-neutral-50 hover:bg-african-primary-50 transition-colors">
                <div className="text-african-primary-500 mb-3 flex justify-center">
                  {service.icon}
                </div>
                <h3 className="font-semibold text-african-primary-700 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-african-neutral-600">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AfricanCard variant="pattern" pattern="bogolan" patternIntensity="light" className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-african-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                AD
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-african-primary-700">Amadou Diallo</h4>
                  <div className="flex text-african-warning-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-african-neutral-600 text-sm italic">
                  "Une expérience authentiquement africaine ! Le design respecte notre culture 
                  tout en étant moderne et fonctionnel. Félicitations à l'équipe !"
                </p>
                <div className="flex items-center mt-3 text-xs text-african-neutral-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  Dakar, Sénégal
                </div>
              </div>
            </div>
          </AfricanCard>

          <AfricanCard variant="accent" pattern="kita" patternIntensity="light" className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-african-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                FS
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-african-primary-700">Fatou Sow</h4>
                  <div className="flex text-african-warning-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-african-neutral-600 text-sm italic">
                  "Enfin une plateforme qui nous représente ! Les motifs bogolan et kita 
                  sont magnifiquement intégrés. C'est notre identité digitale !"
                </p>
                <div className="flex items-center mt-3 text-xs text-african-neutral-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  Bamako, Mali
                </div>
              </div>
            </div>
          </AfricanCard>
        </div>

        {/* Call to action */}
        <div className="text-center bg-gradient-to-r from-african-primary-500 to-african-accent-500 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold font-heading mb-4">
            Prêt à Adopter le Design Africain ?
          </h2>
          <p className="text-xl mb-6 text-african-neutral-100">
            Transformez votre application avec notre thème authentiquement africain
          </p>
          <AfricanButtonGroup orientation="horizontal">
            <AfricanButton 
              variant="secondary" 
              size="lg"
              icon={<Heart className="w-5 h-5" />}
            >
              J'adore ce Design
            </AfricanButton>
            <AfricanButton 
              variant="outline" 
              size="lg"
              className="text-white border-white hover:bg-white hover:text-african-primary-600"
            >
              Voir la Documentation
            </AfricanButton>
          </AfricanButtonGroup>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-african-neutral-200">
          <p className="text-african-neutral-600">
            🌍 <strong>Africa Suite Pulse</strong> - Design Africain Authentique par <strong>Manus AI</strong>
          </p>
          <p className="text-sm text-african-neutral-500 mt-2">
            Célébrant la richesse culturelle africaine dans le design moderne
          </p>
        </div>
      </div>
    </div>
  )
}

