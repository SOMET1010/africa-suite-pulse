import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { useEffect } from "react";
import { Crown, Hotel, Users, CreditCard, FileText, Clock } from "lucide-react";

const tiles = [
  { title: "Rack Hôtel", to: "/reservations/rack", icon: Hotel, description: "Gestion visuelle des chambres et réservations" },
  { title: "Arrivées", to: "/arrivals", icon: Users, description: "Check-in express et gestion des arrivées" },
  { title: "Paramètres", to: "/settings", icon: Crown, description: "Configuration et administration" },
  { title: "Clients", to: "/", icon: Users, description: "Base de données clients et profils" },
  { title: "Facturation", to: "/billing", icon: CreditCard, description: "Gestion des factures et paiements" },
  { title: "Rapports", to: "/", icon: FileText, description: "Analytics et rapports détaillés" },
  { title: "Main courante", to: "/", icon: Clock, description: "Journal des événements et activités" },
];

export default function Dashboard() {
  useEffect(() => {
    document.title = "AfricaSuite PMS - Dashboard Excellence";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Dashboard AfricaSuite PMS: interface luxueuse pour la gestion hôtelière de prestige.");
  }, []);

  return (
    <main className="min-h-screen bg-pearl px-6 py-12 animate-fade-in">
      <div className="container mx-auto">
        <header className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-8 w-8 text-brand-accent" />
            <h1 className="text-4xl font-luxury font-bold text-gradient">AfricaSuite PMS</h1>
          </div>
          <p className="text-lg text-charcoal/80 font-premium">Excellence hôtelière • Gestion de prestige</p>
        </header>

        <section aria-label="Recherche" className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="max-w-2xl mx-auto">
            <input
              type="search"
              placeholder="Rechercher clients, réservations, chambres..."
              className="w-full rounded-2xl border border-accent-gold/20 bg-glass-card px-6 h-14 shadow-luxury focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent backdrop-blur text-charcoal placeholder:text-charcoal/60 transition-elegant"
            />
          </div>
        </section>

        <section aria-label="Indicateurs" className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {label:"Présents",value:42,color:"text-success"},
              {label:"Arrivées",value:12,color:"text-info"},
              {label:"Départs",value:9,color:"text-warning"},
              {label:"Disponibles",value:57,color:"text-brand-accent"}
            ].map((k, index) => (
              <Card key={k.label} className="glass-card shadow-luxury hover-glow transition-elegant" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-premium text-charcoal/70 uppercase tracking-wide">{k.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`text-3xl font-luxury font-bold ${k.color}`}>{k.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-label="Modules" className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {tiles.map((t, index) => {
              const Icon = t.icon;
              return (
                <Card key={t.title} className="glass-card shadow-luxury hover-lift transition-elegant group" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-brand-accent/10 group-hover:bg-brand-accent/20 transition-elegant">
                        <Icon className="h-6 w-6 text-brand-accent" />
                      </div>
                      <CardTitle className="text-xl font-luxury text-charcoal">{t.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-charcoal/70 font-premium leading-relaxed">{t.description}</p>
                  </CardContent>
                  <CardFooter>
                    <TButton asChild variant="primary" className="w-full group-hover:scale-[1.02] transition-elegant">
                      <Link to={t.to} className="flex items-center justify-center gap-2">
                        <span>Accéder au module</span>
                        <Crown className="h-4 w-4" />
                      </Link>
                    </TButton>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
