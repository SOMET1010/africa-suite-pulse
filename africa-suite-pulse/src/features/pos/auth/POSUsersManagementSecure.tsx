import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { usePOSAuthContext } from './POSAuthProvider';
import { 
  Users, 
  Plus, 
  Shield, 
  Clock, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  UserPlus,
  Key,
  Lock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface POSUser {
  id: string;
  employee_code: string;
  display_name: string;
  role_name: string;
  is_active: boolean;
  failed_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  metadata: any;
}

const roleLabels: Record<string, string> = {
  pos_hostess: "Hôtesse",
  pos_server: "Serveur",
  pos_cashier: "Caissier", 
  pos_manager: "Manager"
};

const roleVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pos_hostess: "outline",
  pos_server: "default", 
  pos_cashier: "secondary",
  pos_manager: "destructive"
};

export default function POSUsersManagementSecure() {
  const { session, logout } = usePOSAuthContext();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<POSUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    employee_code: '',
    display_name: '',
    pin: '',
    role_name: 'pos_server'
  });
  const [showPin, setShowPin] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPOSUsers();
  }, []);

  const loadPOSUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer les utilisateurs POS depuis la nouvelle table
      const { data, error } = await supabase
        .from('pos_auth_system')
        .select('*')
        .eq('org_id', session?.org_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading POS users:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs POS",
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading POS users:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPOSUser = async () => {
    if (!newUser.employee_code || !newUser.display_name || !newUser.pin) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);

      // Créer l'utilisateur directement via l'insertion dans la table
      const newUserId = crypto.randomUUID();
      
      // D'abord créer le hash du PIN
      const { data: hashData, error: hashError } = await supabase.rpc('hash_pos_pin', {
        pin_text: newUser.pin
      });

      if (hashError) {
        console.error('Error hashing PIN:', hashError);
        toast({
          title: "Erreur",
          description: "Impossible de sécuriser le PIN",
          variant: "destructive"
        });
        return;
      }

      // Insérer l'utilisateur
      const { error: insertError } = await supabase
        .from('pos_auth_system')
        .insert({
          org_id: session?.org_id,
          user_id: newUserId,
          employee_code: newUser.employee_code,
          display_name: newUser.display_name,
          pin_hash: hashData,
          role_name: newUser.role_name,
          is_active: true
        });

      if (insertError) {
        console.error('Error creating POS user:', insertError);
        toast({
          title: "Erreur",
          description: insertError.message || "Impossible de créer l'utilisateur",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: `Utilisateur ${newUser.display_name} créé avec succès`,
      });

      // Reset form
      setNewUser({
        employee_code: '',
        display_name: '',
        pin: '',
        role_name: 'pos_server'
      });
      setShowCreateForm(false);
      
      // Reload users
      loadPOSUsers();
    } catch (error) {
      console.error('Error creating POS user:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'utilisateur",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('pos_auth_system')
        .update({ is_active: isActive })
        .eq('id', userId)
        .eq('org_id', session?.org_id);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: `Utilisateur ${isActive ? 'activé' : 'désactivé'}`,
      });

      loadPOSUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const unlockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('pos_auth_system')
        .update({ 
          failed_attempts: 0, 
          locked_until: null 
        })
        .eq('id', userId)
        .eq('org_id', session?.org_id);

      if (error) {
        console.error('Error unlocking user:', error);
        toast({
          title: "Erreur",
          description: "Impossible de déverrouiller l'utilisateur",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Utilisateur déverrouillé",
      });

      loadPOSUsers();
    } catch (error) {
      console.error('Error unlocking user:', error);
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Vous devez être connecté pour gérer les utilisateurs POS</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec informations de session */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Gestion des Utilisateurs POS</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connecté en tant que {session.display_name} ({session.employee_code})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={roleVariants[session.role_name]}>
                {roleLabels[session.role_name]}
              </Badge>
              <Button onClick={logout} variant="outline" size="sm">
                <XCircle className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bouton pour créer un utilisateur */}
      {session.role_name === 'pos_manager' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Créer un Utilisateur</span>
              </CardTitle>
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showCreateForm ? 'Annuler' : 'Nouveau'}
              </Button>
            </div>
          </CardHeader>
          
          {showCreateForm && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code Employé</label>
                  <Input
                    value={newUser.employee_code}
                    onChange={(e) => setNewUser(prev => ({ ...prev, employee_code: e.target.value.toUpperCase() }))}
                    placeholder="EX: SRV001"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom d'affichage</label>
                  <Input
                    value={newUser.display_name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Nom complet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Code PIN</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPin(!showPin)}
                      className="h-6 px-2"
                    >
                      {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                  <Input
                    type={showPin ? "text" : "password"}
                    value={newUser.pin}
                    onChange={(e) => setNewUser(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="4-6 chiffres"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rôle</label>
                  <select
                    value={newUser.role_name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="pos_hostess">Hôtesse</option>
                    <option value="pos_server">Serveur</option>
                    <option value="pos_cashier">Caissier</option>
                    <option value="pos_manager">Manager</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={createPOSUser}
                disabled={creating}
                className="w-full"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer l'utilisateur
                  </>
                )}
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Utilisateurs POS ({users.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun utilisateur POS trouvé</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => {
                const isLocked = user.locked_until && new Date(user.locked_until) > new Date();
                return (
                  <Card key={user.id} className={cn(
                    "transition-colors",
                    !user.is_active && "opacity-60",
                    isLocked && "border-destructive"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{user.display_name}</h3>
                              <Badge variant={roleVariants[user.role_name]} className="text-xs">
                                {roleLabels[user.role_name]}
                              </Badge>
                              {!user.is_active && (
                                <Badge variant="outline" className="text-xs">Inactif</Badge>
                              )}
                              {isLocked && (
                                <Badge variant="destructive" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Verrouillé
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Code: {user.employee_code}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {user.last_login_at 
                                    ? `Dernière connexion: ${new Date(user.last_login_at).toLocaleString('fr-FR')}`
                                    : 'Jamais connecté'
                                  }
                                </span>
                              </span>
                              {user.failed_attempts > 0 && (
                                <span className="flex items-center space-x-1 text-yellow-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{user.failed_attempts} tentatives échouées</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {session.role_name === 'pos_manager' && user.id !== session.pos_user_id && (
                          <div className="flex items-center space-x-2">
                            {isLocked && (
                              <Button
                                onClick={() => unlockUser(user.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Key className="w-3 h-3 mr-1" />
                                Déverrouiller
                              </Button>
                            )}
                            <Button
                              onClick={() => updateUserStatus(user.id, !user.is_active)}
                              variant={user.is_active ? "outline" : "default"}
                              size="sm"
                            >
                              {user.is_active ? (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Activer
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations de test */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Comptes de test disponibles:</strong>
          <br />• Manager POS - Code: MGR001, PIN: 1234
          <br />• Marie Caissière - Code: CASH01, PIN: 5678  
          <br />• Pierre Serveur - Code: SRV001, PIN: 9999
          <br />• Sophie Hôtesse - Code: HOST01, PIN: 1111
        </AlertDescription>
      </Alert>
    </div>
  );
}