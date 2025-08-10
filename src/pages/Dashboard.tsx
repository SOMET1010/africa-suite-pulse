import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { useEffect } from "react";

const tiles = [
  { title: "Rack Hôtel", to: "/reservations/rack" },
  { title: "Arrivées", to: "/arrivals" },
  { title: "Clients", to: "/" },
  { title: "Facturation", to: "/" },
  { title: "Rapports", to: "/" },
  { title: "Main courante", to: "/" },
];

export default function Dashboard() {
  useEffect(() => {
    document.title = "Top-Menu AfricaSuite - Dashboard";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Dashboard AfriqueSuite PMS: navigation principale, KPIs et accès rapides.");
  }, []);

  return (
    <main className="min-h-screen px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Top-Menu AfricaSuite</h1>
        <p className="text-muted-foreground mt-1">Navigation principale et indicateurs rapides</p>
      </header>

      <section aria-label="Recherche" className="mb-6">
        <div className="max-w-3xl">
          <input
            type="search"
            placeholder="Rechercher (clients, réservations, chambres)"
            className="w-full rounded-xl border border-border bg-background px-4 h-12 shadow-soft focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </section>

      <section aria-label="KPIs" className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{label:"Présents",value:42},{label:"Arrivées",value:12},{label:"Départs",value:9},{label:"Dispo",value:57}].map(k => (
          <Card key={k.label} className="shadow-soft">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle></CardHeader>
            <CardContent className="pt-0"><div className="text-2xl font-bold">{k.value}</div></CardContent>
          </Card>
        ))}
      </section>

      <section aria-label="Modules" className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.title} className="shadow-soft">
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Accédez au module {t.title.toLowerCase()}.</p>
            </CardContent>
            <CardFooter>
              <TButton asChild variant="primary">
                <Link to={t.to}>Accéder</Link>
              </TButton>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
