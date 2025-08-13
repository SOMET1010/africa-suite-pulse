import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Cloud, Server, Zap, Building, Users, Crown } from "lucide-react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const cloudPlans = [
    {
      id: "cloud-starter",
      name: "Starter Cloud",
      icon: <Zap className="h-6 w-6" />,
      description: "Idéal pour petits hôtels et guesthouses",
      monthlyPrice: 25000,
      yearlyPrice: 250000,
      currency: "FCFA",
      maxRooms: 20,
      maxUsers: 5,
      maxPOSPoints: 2,
      features: [
        "PMS Core (Réservations, Rack, Arrivées)",
        "POS Restaurant & Bar",
        "Mobile Money intégré",
        "Rapports standards",
        "Support email",
        "Sauvegarde automatique",
        "Synchronisation temps réel"
      ],
      color: "border-blue-200 bg-blue-50",
      buttonColor: "default"
    },
    {
      id: "cloud-business",
      name: "Business Cloud",
      icon: <Building className="h-6 w-6" />,
      description: "Solution complète pour hôtels professionnels",
      monthlyPrice: 75000,
      yearlyPrice: 750000,
      currency: "FCFA",
      maxRooms: 100,
      maxUsers: 20,
      maxPOSPoints: 10,
      features: [
        "Toutes fonctionnalités Starter",
        "Analytics avancés",
        "Housekeeping & Maintenance",
        "Night Audit automatisé",
        "SYSCOHADA Export",
        "Multi-devises",
        "Room Service & Spa POS",
        "Support téléphone prioritaire",
        "Formation incluse (2 jours)"
      ],
      color: "border-green-200 bg-green-50",
      buttonColor: "default",
      popular: true
    },
    {
      id: "cloud-enterprise",
      name: "Enterprise Cloud",
      icon: <Crown className="h-6 w-6" />,
      description: "Pour chaînes hôtelières et groupes",
      monthlyPrice: 150000,
      yearlyPrice: 1500000,
      currency: "FCFA",
      maxRooms: "Illimité",
      maxUsers: "Illimité",
      maxPOSPoints: "Illimité",
      features: [
        "Toutes fonctionnalités Business",
        "Multi-propriétés",
        "API complète",
        "Intégrations tiers (Opera, Protel)",
        "Rapports personnalisés",
        "Support dédié 24/7",
        "Formation avancée",
        "Consulting inclus",
        "SLA 99.9%"
      ],
      color: "border-purple-200 bg-purple-50",
      buttonColor: "default"
    }
  ];

  const onPremisePlans = [
    {
      id: "onprem-standard",
      name: "Standard On-Premise",
      icon: <Server className="h-6 w-6" />,
      description: "Installation locale avec support",
      price: 2500000,
      currency: "FCFA",
      type: "one-time",
      maxRooms: 50,
      maxUsers: 10,
      maxPOSPoints: 5,
      features: [
        "Licence à vie",
        "Installation sur vos serveurs",
        "Toutes fonctionnalités PMS/POS",
        "Mode offline complet",
        "Support 1 an inclus",
        "Formation sur site (3 jours)",
        "Mises à jour majeures 1 an"
      ],
      color: "border-orange-200 bg-orange-50",
      buttonColor: "secondary"
    },
    {
      id: "onprem-enterprise",
      name: "Enterprise On-Premise",
      icon: <Building className="h-6 w-6" />,
      description: "Solution sur mesure pour grands groupes",
      price: "Sur devis",
      currency: "",
      type: "custom",
      maxRooms: "Illimité",
      maxUsers: "Illimité",
      maxPOSPoints: "Illimité",
      features: [
        "Licence illimitée",
        "Installation multi-sites",
        "Personnalisations incluses",
        "Haute disponibilité",
        "Support prioritaire",
        "Formation équipe complète",
        "Consulting architecture",
        "Synchronisation cloud optionnelle"
      ],
      color: "border-slate-200 bg-slate-50",
      buttonColor: "outline"
    }
  ];

  const formatPrice = (price: number | string, currency: string, isYearly = false) => {
    if (typeof price === 'string') return price;
    
    const displayPrice = isYearly ? price * 10 : price; // 2 mois offerts sur l'annuel
    return `${displayPrice.toLocaleString()} ${currency}${isYearly ? '/an' : '/mois'}`;
  };

  const getDiscount = () => {
    if (isYearly) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          🎉 2 mois offerts
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Tarifs AfricaSuite
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choisissez la solution qui correspond à vos besoins
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
              Mensuel
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
              Annuel
            </span>
            {getDiscount()}
          </div>
        </div>

        {/* Cloud Plans */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2 mb-4">
              <Cloud className="h-8 w-8 text-blue-600" />
              Offres Cloud
            </h2>
            <p className="text-muted-foreground">
              Hébergement centralisé avec synchronisation temps réel
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {cloudPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  plan.color
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Plus Populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="text-3xl font-bold mt-4">
                    {formatPrice(
                      isYearly ? plan.yearlyPrice : plan.monthlyPrice,
                      plan.currency,
                      isYearly
                    )}
                  </div>
                  {isYearly && (
                    <div className="text-sm text-muted-foreground line-through">
                      {formatPrice(plan.monthlyPrice * 12, plan.currency, false).replace('/mois', '/an')}
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="font-semibold">{plan.maxRooms}</div>
                      <div className="text-xs text-muted-foreground">Chambres</div>
                    </div>
                    <div>
                      <div className="font-semibold">{plan.maxUsers}</div>
                      <div className="text-xs text-muted-foreground">Utilisateurs</div>
                    </div>
                    <div>
                      <div className="font-semibold">{plan.maxPOSPoints}</div>
                      <div className="text-xs text-muted-foreground">Points POS</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.buttonColor as any}
                    size="lg"
                  >
                    {plan.popular ? '🚀 Choisir Business' : 'Choisir ce plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* On-Premise Plans */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2 mb-4">
              <Server className="h-8 w-8 text-orange-600" />
              Offres On-Premise
            </h2>
            <p className="text-muted-foreground">
              Installation locale avec contrôle total de vos données
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {onPremisePlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  plan.color
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="text-3xl font-bold mt-4">
                    {formatPrice(plan.price, plan.currency)}
                    {plan.type === 'one-time' && (
                      <div className="text-sm text-muted-foreground font-normal">
                        Licence unique
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="font-semibold">{plan.maxRooms}</div>
                      <div className="text-xs text-muted-foreground">Chambres</div>
                    </div>
                    <div>
                      <div className="font-semibold">{plan.maxUsers}</div>
                      <div className="text-xs text-muted-foreground">Utilisateurs</div>
                    </div>
                    <div>
                      <div className="font-semibold">{plan.maxPOSPoints}</div>
                      <div className="text-xs text-muted-foreground">Points POS</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.buttonColor as any}
                    size="lg"
                  >
                    {plan.type === 'custom' ? 'Demander devis' : 'Acheter licence'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Questions Fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Quelle différence entre Cloud et On-Premise ?</h4>
              <p className="text-sm text-muted-foreground">
                Le mode Cloud est hébergé sur nos serveurs avec maintenance automatique et support 24/7. 
                Le mode On-Premise est installé sur vos serveurs avec un contrôle total des données.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Puis-je changer de plan ?</h4>
              <p className="text-sm text-muted-foreground">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                La facturation sera ajustée au prorata.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Y a-t-il des frais de setup ?</h4>
              <p className="text-sm text-muted-foreground">
                Non, le setup initial et la formation sont inclus dans tous nos plans. 
                Seules les personnalisations spécifiques peuvent être facturées en supplément.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Support technique inclus ?</h4>
              <p className="text-sm text-muted-foreground">
                Oui, tous nos plans incluent le support technique. Le niveau varie selon l'offre : 
                email, téléphone, ou support dédié 24/7 pour Enterprise.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="text-center p-8">
            <h3 className="text-2xl font-bold mb-4">Besoin d'une solution sur mesure ?</h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe commerciale est là pour vous accompagner dans le choix de la meilleure solution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                📞 Appeler Commercial
              </Button>
              <Button size="lg" variant="outline">
                📧 Demander Devis
              </Button>
              <Button size="lg" variant="secondary">
                💬 Chat WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}