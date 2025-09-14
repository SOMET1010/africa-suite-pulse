import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/errorHandling";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";
import { Plus, Users, Edit, Trash2 } from "lucide-react";

interface POSUser {
  id: string;
  user_id: string;
  display_name: string;
  employee_code: string;
  is_active: boolean;
  last_login_at: string;
  role?: string;
}

export default function POSUserManagement() {
  const [users, setUsers] = useState<POSUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    employee_code: "",
    pin: "",
    role: "pos_server"
  });
  const { toast } = useToast();
  const { orgId } = useOrgId();

  const handleCreateUser = async () => {
    if (!orgId) return;

    setLoading(true);
    try {
      // Create a dummy user ID for POS users
      const dummyUserId = crypto.randomUUID();
      
      const { data, error } = await supabase.rpc("create_pos_user", {
        p_org_id: orgId,
        p_user_id: dummyUserId,
        p_pin: formData.pin,
        p_display_name: formData.display_name,
        p_role: formData.role,
        p_employee_code: formData.employee_code
      });

      if (error) throw error;

      toast({
        title: "Utilisateur POS créé",
        description: `${formData.display_name} a été ajouté avec succès.`
      });

      setShowForm(false);
      setFormData({
        display_name: "",
        employee_code: "",
        pin: "",
        role: "pos_server"
      });
      
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: getErrorMessage(err),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Gestion Utilisateurs POS</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs et leurs accès au système de point de vente
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un utilisateur POS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Nom d'affichage</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="employee_code">Code employé</Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_code: e.target.value }))}
                  placeholder="Ex: EMP001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pin">Code PIN (4-6 chiffres)</Label>
                <Input
                  id="pin"
                  type="password"
                  value={formData.pin}
                  onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder="****"
                  maxLength={6}
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="pos_server">Serveur (SRV)</option>
                  <option value="pos_cashier">Caissier (CAI)</option>
                  <option value="pos_manager">Manager (MGR)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateUser} 
                disabled={loading || !formData.display_name || !formData.pin}
              >
                {loading ? "Création..." : "Créer"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>Rôles POS :</strong>
          <br />
          • <strong>Serveur (SRV)</strong> : Prendre commandes, gérer tables
          <br />
          • <strong>Caissier (CAI)</strong> : Encaissements, clôtures
          <br />
          • <strong>Manager (MGR)</strong> : Accès complet, rapports, paramètres
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Guide de configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Créer des utilisateurs POS</h4>
              <p className="text-sm text-muted-foreground">
                Utilisez le formulaire ci-dessus pour créer des comptes avec PIN pour votre équipe.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Connexion POS</h4>
              <p className="text-sm text-muted-foreground">
                Les utilisateurs se connectent via <code>/pos/login</code> avec leur PIN.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Accès par rôle</h4>
              <p className="text-sm text-muted-foreground">
                Les permissions sont automatiquement appliquées selon le rôle assigné.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}