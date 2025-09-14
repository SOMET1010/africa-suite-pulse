import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Palette de couleurs africaines authentiques
const AFRICAN_COLORS = {
  terracotta: '#8B4513',
  gold: '#FFD700', 
  baobab: '#D2691E',
  savanna: '#CD853F',
  earth: '#A0522D',
  sunset: '#FF8C00',
  forest: '#228B22',
  sky: '#87CEEB'
};

// Motifs africains traditionnels
const AFRICAN_PATTERNS = {
  bogolan: {
    name: 'Bogolan (Mali)',
    description: 'Motifs traditionnels maliens sur tissu de boue',
    pattern: '◆ ◇ ◆ ◇ ◆',
    usage: 'En-têtes de rapports financiers'
  },
  kente: {
    name: 'Kente (Ghana)',
    description: 'Tissage royal ghanéen aux couleurs vives',
    pattern: '▓▒░▓▒░▓▒░',
    usage: 'Bordures des rapports de performance'
  },
  mudcloth: {
    name: 'Mudcloth (Afrique de l\'Ouest)',
    description: 'Tissus de boue avec symboles géométriques',
    pattern: '⬢ ⬡ ⬢ ⬡ ⬢',
    usage: 'Arrière-plans des sections KPI'
  },
  adinkra: {
    name: 'Adinkra (Ghana)',
    description: 'Symboles akan représentant des concepts',
    pattern: '⚡ ☀ ⚡ ☀ ⚡',
    usage: 'Icônes des métriques importantes'
  },
  wax: {
    name: 'Wax (Afrique de l\'Ouest)',
    description: 'Tissus colorés aux motifs floraux',
    pattern: '🌺 🌿 🌺 🌿 🌺',
    usage: 'Décorations des rapports clients'
  }
};

// Philosophies africaines intégrées
const AFRICAN_PHILOSOPHIES = {
  ubuntu: {
    name: 'Ubuntu',
    origin: 'Afrique du Sud',
    meaning: 'Je suis parce que nous sommes',
    application: 'Rapports de performance du personnel',
    color: AFRICAN_COLORS.earth,
    symbol: '🤝'
  },
  teranga: {
    name: 'Teranga',
    origin: 'Sénégal',
    meaning: 'Hospitalité et accueil chaleureux',
    application: 'Rapports de satisfaction client',
    color: AFRICAN_COLORS.sunset,
    symbol: '🤗'
  },
  harambee: {
    name: 'Harambee',
    origin: 'Kenya',
    meaning: 'Travaillons ensemble',
    application: 'Rapports d\'équipe et collaboration',
    color: AFRICAN_COLORS.forest,
    symbol: '💪'
  },
  sankofa: {
    name: 'Sankofa',
    origin: 'Ghana',
    meaning: 'Apprendre du passé pour avancer',
    application: 'Analyses historiques et tendances',
    color: AFRICAN_COLORS.gold,
    symbol: '🔄'
  }
};

// Proverbes africains utilisés dans les rapports
const AFRICAN_PROVERBS = [
  {
    text: "L'hospitalité africaine transforme l'étranger en famille",
    origin: "Proverbe Akan",
    usage: "Rapports de satisfaction client",
    context: "Mesure de l'accueil et du service"
  },
  {
    text: "Comme le baobab, notre service grandit avec le temps",
    origin: "Sagesse Africaine",
    usage: "Rapports de croissance",
    context: "Évolution des performances"
  },
  {
    text: "Seul on va plus vite, ensemble on va plus loin",
    origin: "Proverbe Africain",
    usage: "Rapports d'équipe",
    context: "Performance collaborative"
  },
  {
    text: "Chaque client apporte sa propre lumière dans notre maison",
    origin: "Philosophie de l'hospitalité",
    usage: "Rapports d'occupation",
    context: "Valeur de chaque client"
  }
];

export function AfricanDesignShowcase() {
  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* En-tête avec design africain */}
      <div className="text-center mb-8">
        <div 
          className="p-8 rounded-lg mb-6"
          style={{ 
            background: `linear-gradient(135deg, ${AFRICAN_COLORS.terracotta}, ${AFRICAN_COLORS.gold})`,
            color: 'white'
          }}
        >
          <h1 className="text-4xl font-bold mb-4">
            🌍 Design Africain Authentique
          </h1>
          <p className="text-xl opacity-90">
            Éléments culturels intégrés dans Africa Suite Pulse Reports
          </p>
          <div className="mt-4 text-center">
            <span className="text-2xl">◆ ◇ ◆ ◇ ◆ ◇ ◆</span>
          </div>
        </div>
      </div>

      {/* Palette de couleurs africaines */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-900">🎨 Palette de Couleurs Africaines</CardTitle>
          <CardDescription>Couleurs authentiques inspirées des paysages et cultures d'Afrique</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(AFRICAN_COLORS).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-full h-20 rounded-lg mb-2 border-2 border-gray-200"
                  style={{ backgroundColor: color }}
                ></div>
                <h4 className="font-semibold capitalize">{name}</h4>
                <p className="text-sm text-gray-600">{color}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Utilisation dans les Rapports</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li><strong>Terracotta :</strong> Couleur principale des en-têtes</li>
              <li><strong>Or :</strong> Accents pour les métriques importantes</li>
              <li><strong>Baobab :</strong> Couleur secondaire pour les sections</li>
              <li><strong>Savane :</strong> Arrière-plans neutres</li>
              <li><strong>Forêt :</strong> Indicateurs positifs et croissance</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Motifs africains traditionnels */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-900">🧵 Motifs Africains Traditionnels</CardTitle>
          <CardDescription>Patterns authentiques intégrés dans le design des rapports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(AFRICAN_PATTERNS).map(([key, pattern]) => (
              <div key={key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center mb-3">
                  <div className="text-2xl font-mono mb-2" style={{ color: AFRICAN_COLORS.terracotta }}>
                    {pattern.pattern}
                  </div>
                  <h4 className="font-semibold">{pattern.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                <Badge variant="outline" className="text-xs">
                  {pattern.usage}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">🎯 Application Pratique</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>En-têtes PDF :</strong>
                <div className="mt-1 p-2 bg-white rounded border" style={{ borderColor: AFRICAN_COLORS.terracotta }}>
                  <div className="text-center" style={{ color: AFRICAN_COLORS.terracotta }}>
                    ◆ ◇ ◆ RAPPORT FINANCIER ◆ ◇ ◆
                  </div>
                </div>
              </div>
              <div>
                <strong>Bordures de sections :</strong>
                <div className="mt-1 p-2 bg-white rounded border" style={{ borderColor: AFRICAN_COLORS.gold }}>
                  <div className="text-center" style={{ color: AFRICAN_COLORS.gold }}>
                    ▓▒░ PERFORMANCE HÔTELIÈRE ░▒▓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Philosophies africaines */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-900">🎭 Philosophies Africaines Intégrées</CardTitle>
          <CardDescription>Valeurs et concepts africains appliqués aux métriques business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(AFRICAN_PHILOSOPHIES).map(([key, philosophy]) => (
              <div key={key} className="border rounded-lg p-4" style={{ borderColor: philosophy.color }}>
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{philosophy.symbol}</span>
                  <div>
                    <h4 className="font-semibold" style={{ color: philosophy.color }}>
                      {philosophy.name}
                    </h4>
                    <p className="text-sm text-gray-600">{philosophy.origin}</p>
                  </div>
                </div>
                <p className="text-sm italic mb-2" style={{ color: philosophy.color }}>
                  "{philosophy.meaning}"
                </p>
                <Badge variant="outline" className="text-xs">
                  {philosophy.application}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">📊 Métriques Culturelles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Score Ubuntu :</strong> Mesure l'esprit d'équipe et la collaboration
              </div>
              <div>
                <strong>Rating Teranga :</strong> Évalue la qualité de l'hospitalité
              </div>
              <div>
                <strong>Index Harambee :</strong> Performance du travail collectif
              </div>
              <div>
                <strong>Coefficient Sankofa :</strong> Apprentissage des expériences passées
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proverbes africains */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-900">💬 Proverbes et Sagesse Africaine</CardTitle>
          <CardDescription>Citations inspirantes intégrées dans les rapports pour contextualiser les données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {AFRICAN_PROVERBS.map((proverb, index) => (
              <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: AFRICAN_COLORS.gold }}>
                <p className="italic text-lg mb-2" style={{ color: AFRICAN_COLORS.terracotta }}>
                  "{proverb.text}"
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <Badge variant="outline">{proverb.origin}</Badge>
                  <Badge variant="outline">{proverb.usage}</Badge>
                </div>
                <p className="text-sm text-gray-700 mt-1">{proverb.context}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exemple de rapport avec design africain */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-900">📄 Exemple de Rapport avec Design Africain</CardTitle>
          <CardDescription>Aperçu d'un rapport PDF généré avec tous les éléments culturels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-white">
            {/* En-tête du rapport */}
            <div 
              className="p-4 rounded-t-lg text-white text-center mb-4"
              style={{ background: `linear-gradient(135deg, ${AFRICAN_COLORS.terracotta}, ${AFRICAN_COLORS.gold})` }}
            >
              <div className="text-2xl font-bold mb-2">
                🏨 AFRICA SUITE PULSE
              </div>
              <div className="text-lg">
                Rapport de Performance Hôtelière - Style Ubuntu
              </div>
              <div className="text-sm opacity-90 mt-2">
                ◆ ◇ ◆ ◇ ◆ ◇ ◆
              </div>
            </div>

            {/* Section KPI avec philosophie Ubuntu */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: AFRICAN_COLORS.earth }}>
                🤝 Performance Ubuntu - Esprit d'Équipe
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded" style={{ backgroundColor: `${AFRICAN_COLORS.earth}20` }}>
                  <div className="text-2xl font-bold" style={{ color: AFRICAN_COLORS.earth }}>87%</div>
                  <div className="text-sm">Score Ubuntu</div>
                </div>
                <div className="text-center p-3 rounded" style={{ backgroundColor: `${AFRICAN_COLORS.sunset}20` }}>
                  <div className="text-2xl font-bold" style={{ color: AFRICAN_COLORS.sunset }}>92%</div>
                  <div className="text-sm">Rating Teranga</div>
                </div>
                <div className="text-center p-3 rounded" style={{ backgroundColor: `${AFRICAN_COLORS.forest}20` }}>
                  <div className="text-2xl font-bold" style={{ color: AFRICAN_COLORS.forest }}>78%</div>
                  <div className="text-sm">Index Harambee</div>
                </div>
                <div className="text-center p-3 rounded" style={{ backgroundColor: `${AFRICAN_COLORS.gold}20` }}>
                  <div className="text-2xl font-bold" style={{ color: AFRICAN_COLORS.gold }}>85%</div>
                  <div className="text-sm">Coefficient Sankofa</div>
                </div>
              </div>
            </div>

            {/* Citation inspirante */}
            <div 
              className="p-4 rounded-lg mb-4"
              style={{ backgroundColor: `${AFRICAN_COLORS.gold}10`, borderLeft: `4px solid ${AFRICAN_COLORS.gold}` }}
            >
              <p className="italic text-center" style={{ color: AFRICAN_COLORS.terracotta }}>
                "Ubuntu : Je suis parce que nous sommes"
              </p>
              <p className="text-sm text-center text-gray-600 mt-1">
                Philosophie africaine appliquée à la performance d'équipe
              </p>
            </div>

            {/* Pied de page avec motifs */}
            <div 
              className="p-3 rounded-b-lg text-white text-center text-sm"
              style={{ background: `linear-gradient(135deg, ${AFRICAN_COLORS.terracotta}, ${AFRICAN_COLORS.baobab})` }}
            >
              <div className="mb-1">🌍 🦁 🌳 🥁 🏺 🎭 ☀️ 🌙</div>
              <div>© 2024 Africa Suite Pulse - Excellence Hôtelière Africaine</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide d'utilisation */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-900">📚 Guide d'Utilisation du Design Africain</CardTitle>
          <CardDescription>Comment les éléments culturels sont appliqués dans chaque type de rapport</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: AFRICAN_COLORS.terracotta }}>
                  📊 Rapports Financiers
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Couleurs : Terracotta + Or (prospérité)</li>
                  <li>• Motifs : Bogolan (tradition malienne)</li>
                  <li>• Philosophie : Prospérité communautaire</li>
                  <li>• Proverbes : Croissance et abondance</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2" style={{ color: AFRICAN_COLORS.sunset }}>
                  🏨 Rapports d'Hospitalité
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Couleurs : Sunset + Sky (accueil chaleureux)</li>
                  <li>• Motifs : Kente (royauté ghanéenne)</li>
                  <li>• Philosophie : Teranga (hospitalité sénégalaise)</li>
                  <li>• Proverbes : Accueil et générosité</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2" style={{ color: AFRICAN_COLORS.earth }}>
                  👥 Rapports RH
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Couleurs : Earth + Forest (communauté)</li>
                  <li>• Motifs : Adinkra (symboles akan)</li>
                  <li>• Philosophie : Ubuntu (esprit d'équipe)</li>
                  <li>• Proverbes : Collaboration et unité</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2" style={{ color: AFRICAN_COLORS.forest }}>
                  🌱 Rapports Durabilité
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Couleurs : Forest + Savanna (nature)</li>
                  <li>• Motifs : Mudcloth (terre et nature)</li>
                  <li>• Philosophie : Respect de la terre mère</li>
                  <li>• Proverbes : Harmonie avec la nature</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

