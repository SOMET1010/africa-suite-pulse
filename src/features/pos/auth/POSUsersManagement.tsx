import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePOSAuth } from "@/features/pos/auth/usePOSAuth";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";
import { User, Clock, LogOut, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { useNavigate } from "react-router-dom";

interface POSUser {
  id: string;
  display_name: string;
  employee_code?: string;
  role: string;
  last_login_at?: string;
  is_active: boolean;
}

const roleLabels: Record<string, string> = {
  pos_server: "Serveur",
  pos_cashier: "Caissier", 
  pos_manager: "Manager"
};

export default function POSUsersManagement() {
  const [users, setUsers] = useState<POSUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { session, isManager } = usePOSAuth();
  const { orgId } = useOrgId();
  const navigate = useNavigate();

  useEffect(() => {
    if (orgId) {
      fetchPOSUsers();
    }
  }, [orgId]);

  const fetchPOSUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pos_users")
        .select(`
          id,
          display_name,
          employee_code,
          last_login_at,
          is_active,
          user_id
        `)
        .eq("org_id", orgId);

      if (error) throw error;

      // Get roles for each user
      const userIds = data?.map(u => u.user_id) || [];
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds)
        .eq("org_id", orgId);

      const formattedUsers = data?.map(user => ({
        ...user,
        role: rolesData?.find(r => r.user_id === user.user_id)?.role || 'pos_server'
      })) || [];

      setUsers(formattedUsers);
    } catch (error: unknown) {
      logger.error("Error fetching POS users", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs POS",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoUsers = async () => {
    if (!orgId || !session) return;

    try {
      // Create demo users for testing
      const demoUsers = [
        {
          user_id: crypto.randomUUID(),
          pin: "1234",
          display_name: "Serveur Demo",
          role: "pos_server",
          employee_code: "SRV001"
        },
        {
          user_id: crypto.randomUUID(),
          pin: "2345",
          display_name: "Caissier Demo", 
          role: "pos_cashier",
          employee_code: "CAI001"
        },
        {
          user_id: crypto.randomUUID(),
          pin: "3456",
          display_name: "Manager Demo",
          role: "pos_manager",
          employee_code: "MGR001"
        }
      ];

      for (const user of demoUsers) {
        const { error } = await supabase.rpc("create_pos_user", {
          p_org_id: orgId,
          p_user_id: user.user_id,
          p_pin: user.pin,
          p_display_name: user.display_name,
          p_role: user.role,
          p_employee_code: user.employee_code
        });

        if (error) {
          logger.error(`Error creating user ${user.display_name}`, error);
        }
      }

      toast({
        title: "Utilisateurs créés",
        description: "3 utilisateurs de démonstration ont été créés avec les PINs: 1234 (Serveur), 2345 (Caissier), 3456 (Manager)"
      });

      fetchPOSUsers();
    } catch (error: unknown) {
      logger.error("Error creating demo users", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les utilisateurs de démonstration",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs POS</h1>
          <p className="text-muted-foreground">Gestion des accès au système de point de vente</p>
        </div>
        
        {isManager && users.length === 0 && (
          <Button onClick={createDemoUsers} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer utilisateurs démo
          </Button>
        )}
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun utilisateur POS</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer des utilisateurs pour accéder au système POS
            </p>
            {isManager && (
              <Button onClick={createDemoUsers} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer utilisateurs démo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className={!user.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.display_name}</CardTitle>
                      {user.employee_code && (
                        <p className="text-sm text-muted-foreground">{user.employee_code}</p>
                      )}
                    </div>
                  </div>
                  {!user.is_active && (
                    <Badge variant="destructive">Inactif</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rôle</span>
                  <Badge variant="outline">
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </div>
                
                {user.last_login_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Dernière connexion: {new Date(user.last_login_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Current Session Info */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Session active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{session.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  {roleLabels[session.role]} • Connecté depuis {new Date(session.login_time).toLocaleString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/pos/login")}>
                <LogOut className="w-4 h-4 mr-2" />
                Changer d'utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}