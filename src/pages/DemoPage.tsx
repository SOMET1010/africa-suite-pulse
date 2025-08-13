import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Server, 
  CheckCircle, 
  Wifi, 
  WifiOff, 
  Globe, 
  Shield, 
  Zap, 
  TrendingUp,
  Users,
  Building,
  Smartphone,
  CreditCard
} from "lucide-react";

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<'cloud' | 'onpremise'>('cloud');

  const features = {
    cloud: [
      { icon: <Zap className="h-4 w-4" />, title: "Déploiement Express", desc: "Setup en 24h" },
      { icon: <Globe className="h-4 w-4" />, title: "Multi-Sites", desc: "Synchronisation temps réel" },
      { icon: <Shield className="h-4 w-4" />, title: "Sécurité Renforcée", desc: "Chiffrement + Sauvegarde auto" },
      { icon: <TrendingUp className="h-4 w-4" />, title: "Scaling Auto", desc: "Performance adaptée" },
      { icon: <Users className="h-4 w-4" />, title: "Support 24/7", desc: "Équipe dédiée Afrique" },
      { icon: <Smartphone className="h-4 w-4" />, title: "Mobile Ready", desc: "Accès tablette/smartphone" }
    ],
    onpremise: [
      { icon: <Server className="h-4 w-4" />, title: "Données Locales", desc: "100% chez vous" },
      { icon: <WifiOff className="h-4 w-4" />, title: "Mode Offline", desc: "Fonctionne sans internet" },
      { icon: <Building className="h-4 w-4" />, title: "Conformité", desc: "Respect réglementations" },
      { icon: <Shield className="h-4 w-4" />, title: "Contrôle Total", desc: "Gestion complète accès" },
      { icon: <Wifi className="h-4 w-4" />, title: "Sync Optionnelle", desc: "Remontée cloud au choix" },
      { icon: <CreditCard className="h-4 w-4" />, title: "Licence Unique", desc: "Pas d'abonnement" }
    ]
  };

  const modules = [
    { name: "PMS Core", desc: "Réservations, Rack, Arrivées/Départs", status: "✅ Opérationnel" },
    { name: "POS Multi-Points", desc: "Restaurant, Bar, Room Service, Spa", status: "✅ Opérationnel" },
    { name: "Analytics Avancés", desc: "Tableaux de bord temps réel", status: "✅ Opérationnel" },
    { name: "Mobile Money", desc: "Orange, MTN, Moov Money", status: "✅ Intégré" },
    { name: "SYSCOHADA Export", desc: "Conformité comptable", status: "✅ Opérationnel" },
    { name: "Multi-Devises", desc: "FCFA, EUR, USD + locales", status: "✅ Opérationnel" },
    { name: "Housekeeping", desc: "Gestion ménage optimisée", status: "✅ Opérationnel" },
    { name: "Night Audit", desc: "Clôture automatisée", status: "✅ Opérationnel" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AfricaSuite Demo Center
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Découvrez la puissance de notre solution PMS + POS
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Cloud className="h-4 w-4 mr-2" />
              Cloud Ready
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Server className="h-4 w-4 mr-2" />
              On-Premise
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Production Ready
            </Badge>
          </div>
        </div>

        {/* Demo Selection */}
        <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as 'cloud' | 'onpremise')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Demo Cloud
            </TabsTrigger>
            <TabsTrigger value="onpremise" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Demo On-Premise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-8">
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Cloud className="h-6 w-6" />
                  Mode Cloud - Hébergement Centralisé
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Infrastructure géographiquement distribuée avec synchronisation temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {features.cloud.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="text-blue-600">{feature.icon}</div>
                      <div>
                        <div className="font-medium text-blue-900">{feature.title}</div>
                        <div className="text-sm text-blue-700">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="w-full">
                  🚀 Démarrer Demo Cloud (Accès Immédiat)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onpremise" className="space-y-8">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Server className="h-6 w-6" />
                  Mode On-Premise - Installation Locale
                </CardTitle>
                <CardDescription className="text-green-700">
                  Données 100% chez vous avec contrôle total et conformité réglementaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {features.onpremise.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="text-green-600">{feature.icon}</div>
                      <div>
                        <div className="font-medium text-green-900">{feature.title}</div>
                        <div className="text-sm text-green-700">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="w-full" variant="secondary">
                  🏢 Programmer Demo On-Premise
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modules Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modules Disponibles</CardTitle>
            <CardDescription>
              Tous les modules sont opérationnels et prêts pour la production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {modules.map((module, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{module.name}</div>
                    <div className="text-sm text-muted-foreground">{module.desc}</div>
                  </div>
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    {module.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="text-center p-8">
            <h3 className="text-2xl font-bold mb-4">Prêt à Tester AfricaSuite ?</h3>
            <p className="text-muted-foreground mb-6">
              Demandez votre accès demo personnalisé ou planifiez une présentation avec notre équipe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                📧 Demander Accès Demo
              </Button>
              <Button size="lg" variant="outline">
                📞 Planifier Présentation
              </Button>
              <Button size="lg" variant="secondary">
                💬 Contact WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tech Specs */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Spécifications Techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frontend</span>
                <span>React + TypeScript</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend</span>
                <span>Supabase (PostgreSQL)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Déploiement</span>
                <span>Docker + Kubernetes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sécurité</span>
                <span>TLS 1.3 + AES-256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Performance</span>
                <span>&lt; 200ms latence</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support & Formation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Setup Initial</span>
                <span>24h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Formation</span>
                <span>2 jours sur site</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Support Technique</span>
                <span>24/7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SLA Uptime</span>
                <span>99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Équipe Dédiée</span>
                <span>Afrique</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}