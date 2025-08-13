import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { useEffect } from "react";
import { Crown, Hotel, Users, CreditCard, FileText, Clock, Sparkles, Wrench } from "lucide-react";
import { MobileOptimizedLayout, ResponsiveGrid, TouchOptimizedCard } from "@/core/ui/Mobile";
import { BottomActionBar } from "@/core/layout/BottomActionBar";

const tiles = [
  { title: "Rack Hôtel", to: "/reservations/rack", icon: Hotel, description: "Gestion visuelle des chambres et réservations" },
  { title: "Réservations", to: "/reservations", icon: FileText, description: "Gestion des réservations et planning" },
  { title: "Arrivées", to: "/arrivals", icon: Users, description: "Check-in express et gestion des arrivées" },
  { title: "Gouvernante", to: "/housekeeping", icon: Sparkles, description: "Tâches ménage et statut des chambres" },
  { title: "Maintenance", to: "/maintenance", icon: Wrench, description: "Gestion maintenance et équipements" },
  { title: "Clients", to: "/guests", icon: Users, description: "Base de données clients et profils" },
  { title: "Facturation", to: "/billing", icon: CreditCard, description: "Gestion des factures et paiements" },
  { title: "Paramètres", to: "/settings", icon: Crown, description: "Configuration et administration" },
];

export default function Dashboard() {
  useEffect(() => {
    document.title = "AfricaSuite PMS - Dashboard Excellence";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Dashboard AfricaSuite PMS: interface luxueuse pour la gestion hôtelière de prestige.");
  }, []);

  return (
    <MobileOptimizedLayout title="Dashboard AfricaSuite PMS">
      <header className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="h-8 w-8 text-brand-accent" />
          <h1 className="text-4xl font-luxury font-bold text-gradient">AfricaSuite PMS</h1>
        </div>
        <p className="responsive-text-lg text-charcoal/80 font-premium">Excellence hôtelière • Gestion de prestige</p>
      </header>

      <section aria-label="Recherche" className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-2xl mx-auto">
          <input
            type="search"
            placeholder="Rechercher clients, réservations, chambres..."
            aria-label="Recherche globale"
            className="w-full rounded-2xl border border-accent-gold/20 bg-glass-card px-6 h-14 shadow-luxury focus-input backdrop-blur text-charcoal placeholder:text-charcoal/60 transition-elegant tap-target"
          />
        </div>
      </section>

      <section aria-label="Indicateurs" className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <ResponsiveGrid variant="2-4">
          {[
            {label:"Présents",value:42,color:"text-success"},
            {label:"Arrivées",value:12,color:"text-info"},
            {label:"Départs",value:9,color:"text-warning"},
            {label:"Disponibles",value:57,color:"text-brand-accent"}
          ].map((k, index) => (
            <Card key={k.label} className="glass-card shadow-luxury hover-glow transition-elegant" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
              <CardHeader className="pb-3">
                <CardTitle className="responsive-text-sm font-premium text-charcoal/70 uppercase tracking-wide">{k.label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-3xl font-luxury font-bold ${k.color}`}>{k.value}</div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </section>

      <section aria-label="Modules" className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <ResponsiveGrid variant="1-2-3">
          {tiles.map((t, index) => {
            const Icon = t.icon;
            return (
              <TouchOptimizedCard 
                key={t.title} 
                href={t.to}
                ariaLabel={`Accéder au module ${t.title}: ${t.description}`}
                className="glass-card shadow-luxury group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-brand-accent/10 group-hover:bg-brand-accent/20 transition-elegant">
                      <Icon className="h-6 w-6 text-brand-accent" />
                    </div>
                    <h3 className="responsive-text-lg font-luxury text-charcoal">{t.title}</h3>
                  </div>
                  <p className="responsive-text-sm text-charcoal/70 font-premium leading-relaxed">{t.description}</p>
                  <div className="pt-2">
                    <TButton variant="primary" className="w-full group-hover:scale-[1.02] transition-elegant">
                      <span>Accéder au module</span>
                      <Crown className="h-4 w-4 ml-2" />
                    </TButton>
                  </div>
                </div>
              </TouchOptimizedCard>
            );
          })}
        </ResponsiveGrid>
      </section>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        <div className="flex items-center gap-2 responsive-text-sm text-muted-foreground">
          <span>42/85 occupées</span>
          <span>•</span>
          <span>12 arrivées</span>
          <span>•</span>
          <span>9 départs</span>
        </div>
        <div className="flex items-center gap-2">
          <TButton asChild className="tap-target">
            <Link to="/arrivals">Check-in</Link>
          </TButton>
          <TButton asChild variant="default" className="tap-target mobile-hidden">
            <Link to="/reservations/rack">Rack</Link>
          </TButton>
          <TButton asChild variant="ghost" className="tap-target mobile-hidden">
            <Link to="/reports">Rapports</Link>
          </TButton>
        </div>
      </BottomActionBar>
    </MobileOptimizedLayout>
  );
}
