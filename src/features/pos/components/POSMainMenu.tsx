import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePOSAuth } from "../auth/usePOSAuth";
import { 
  ShoppingCart, 
  ChefHat, 
  BarChart3, 
  Settings, 
  Users, 
  Package, 
  CreditCard,
  ClipboardList,
  LogOut,
  Calendar,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    id: "maitre-hotel",
    title: "Maître d'Hôtel",
    description: "Gestion des tables et assignations serveurs",
    icon: Users,
    path: "/pos/maitre-hotel",
    color: "bg-emerald-600",
    requiredRole: "pos_hostess"
  },
  {
    id: "server",
    title: "Interface Serveur",
    description: "Prise de commandes par les serveurs",
    icon: ShoppingCart,
    path: "/pos/server",
    color: "bg-blue-600",
    requiredRole: "pos_server"
  },
  {
    id: "terminal",
    title: "Terminal de vente",
    description: "Prendre des commandes et encaisser",
    icon: ShoppingCart,
    path: "/pos/terminal",
    color: "bg-emerald-500",
    requiredRole: "pos_server"
  },
  {
    id: "kitchen",
    title: "Affichage cuisine",
    description: "Voir les commandes en cours",
    icon: ChefHat,
    path: "/pos/kitchen",
    color: "bg-orange-500",
    requiredRole: "pos_server"
  },
  {
    id: "inventory",
    title: "Inventaire",
    description: "Gérer les stocks",
    icon: Package,
    path: "/pos/inventory",
    color: "bg-blue-500",
    requiredRole: "pos_cashier"
  },
  {
    id: "reports",
    title: "Rapports",
    description: "Analytics et statistiques",
    icon: BarChart3,
    path: "/pos/reports",
    color: "bg-purple-500",
    requiredRole: "pos_manager"
  },
  {
    id: "sessions",
    title: "Sessions",
    description: "Gérer les sessions de caisse",
    icon: ClipboardList,
    path: "/pos/sessions",
    color: "bg-teal-500",
    requiredRole: "pos_cashier"
  },
  {
    id: "users",
    title: "Utilisateurs POS",
    description: "Gérer les comptes POS",
    icon: Users,
    path: "/pos/users",
    color: "bg-indigo-500",
    requiredRole: "pos_manager"
  },
  {
    id: "settings",
    title: "Paramètres",
    description: "Configuration du système",
    icon: Settings,
    path: "/pos/settings",
    color: "bg-gray-500",
    requiredRole: "pos_manager"
  }
];

export function POSMainMenu() {
  const { session, logout, hasRole } = usePOSAuth();
  const navigate = useNavigate();

  const availableItems = menuItems.filter(item => 
    hasRole(item.requiredRole as any)
  );

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/pos/login");
  };

  if (!session) {
    navigate("/pos/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Point de Vente</h1>
            <p className="text-muted-foreground mt-1">
              Sélectionnez une fonction pour commencer
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{session.display_name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {session.role === 'pos_hostess' && 'Maître d\'Hôtel'}
                    {session.role === 'pos_server' && 'Serveur'}
                    {session.role === 'pos_cashier' && 'Caissier'}
                    {session.role === 'pos_manager' && 'Manager'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Connecté depuis {new Date(session.login_time).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {availableItems.map((item) => (
          <Card 
            key={item.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group"
            onClick={() => handleMenuClick(item.path)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Accéder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventes du jour</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients servis</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}