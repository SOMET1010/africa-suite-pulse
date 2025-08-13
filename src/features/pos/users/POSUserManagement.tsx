import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Shield, Key, Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface POSUser {
  id: string;
  user_id: string;
  display_name: string;
  employee_code?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  role?: string;
}

export function POSUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<POSUser | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch POS users
  const { data: posUsers = [], isLoading } = useQuery({
    queryKey: ["pos-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_users")
        .select(`
          *,
          user_roles!inner(role)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create POS user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data, error } = await supabase.rpc('create_pos_user', {
        p_org_id: (await supabase.rpc('get_current_user_org_id')).data,
        p_user_id: crypto.randomUUID(),
        p_pin: userData.pin,
        p_display_name: userData.display_name,
        p_role: userData.role,
        p_employee_code: userData.employee_code
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-users"] });
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur POS a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'utilisateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update user status mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { error } = await supabase
        .from("pos_users")
        .update(updates)
        .eq("id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-users"] });
      toast({
        title: "Utilisateur mis à jour",
        description: "Les modifications ont été sauvegardées",
      });
    }
  });

  const filteredUsers = posUsers.filter(user => {
    return (
      (searchTerm === "" || 
       user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (user.employee_code && user.employee_code.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (roleFilter === "" || user.user_roles?.role === roleFilter)
    );
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      pos_manager: { label: "Manager", color: "default" },
      pos_cashier: { label: "Caissier", color: "secondary" },
      pos_server: { label: "Serveur", color: "outline" },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: "outline" };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Gestion des Utilisateurs POS
          </h1>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs, rôles et permissions POS
          </p>
        </div>
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-dark hover:opacity-90">
              <UserPlus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateUserForm 
              onSubmit={(data) => {
                createUserMutation.mutate(data);
                setShowCreateUser(false);
              }}
              onClose={() => setShowCreateUser(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{posUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {posUsers.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactifs</p>
                <p className="text-2xl font-bold text-red-600">
                  {posUsers.filter(u => !u.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {posUsers.filter(u => u.user_roles?.role === 'pos_manager').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions Actives</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les rôles</SelectItem>
                    <SelectItem value="pos_manager">Manager</SelectItem>
                    <SelectItem value="pos_cashier">Caissier</SelectItem>
                    <SelectItem value="pos_server">Serveur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Code Employé</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Dernière Connexion</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>{getInitials(user.display_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.display_name}</p>
                            <p className="text-sm text-muted-foreground">#{user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.employee_code || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.user_roles?.role || 'pos_server')}
                      </TableCell>
                      <TableCell>
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString('fr-FR')
                          : 'Jamais'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={(checked) => {
                              updateUserMutation.mutate({
                                userId: user.id,
                                updates: { is_active: checked }
                              });
                            }}
                          />
                          <span className="text-sm">
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditUser(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              updateUserMutation.mutate({
                                userId: user.id,
                                updates: { is_active: false }
                              });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des Rôles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">Manager POS</h4>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Gestion complète du système</li>
                        <li>• Configuration des paramètres</li>
                        <li>• Rapports et analyses</li>
                        <li>• Gestion des utilisateurs</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="w-5 h-5 text-green-500" />
                        <h4 className="font-semibold">Caissier</h4>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Traitement des commandes</li>
                        <li>• Gestion des paiements</li>
                        <li>• Ouverture/fermeture de caisse</li>
                        <li>• Rapports de session</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Key className="w-5 h-5 text-orange-500" />
                        <h4 className="font-semibold">Serveur</h4>
                      </div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Prise de commandes</li>
                        <li>• Gestion des tables</li>
                        <li>• Modification des commandes</li>
                        <li>• Communication cuisine</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Aucune session active</p>
                <p className="text-muted-foreground">Les sessions actives apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
          <DialogContent>
            <EditUserForm 
              user={editingUser}
              onSubmit={(data) => {
                updateUserMutation.mutate({
                  userId: editingUser.id,
                  updates: data
                });
                setShowEditUser(false);
                setEditingUser(null);
              }}
              onClose={() => {
                setShowEditUser(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateUserForm({ onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    display_name: "",
    employee_code: "",
    role: "pos_server",
    pin: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Créer un Utilisateur POS</DialogTitle>
        <DialogDescription>
          Ajoutez un nouvel utilisateur au système POS
        </DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="display_name">Nom d'affichage</Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({...formData, display_name: e.target.value})}
          required
        />
      </div>

      <div>
        <Label htmlFor="employee_code">Code employé</Label>
        <Input
          id="employee_code"
          value={formData.employee_code}
          onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
          placeholder="Optionnel"
        />
      </div>

      <div>
        <Label htmlFor="role">Rôle</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pos_server">Serveur</SelectItem>
            <SelectItem value="pos_cashier">Caissier</SelectItem>
            <SelectItem value="pos_manager">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="pin">Code PIN (4 chiffres)</Label>
        <Input
          id="pin"
          type="password"
          value={formData.pin}
          onChange={(e) => setFormData({...formData, pin: e.target.value})}
          pattern="[0-9]{4}"
          maxLength={4}
          placeholder="1234"
          required
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          Créer
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditUserForm({ user, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    display_name: user.display_name,
    employee_code: user.employee_code || "",
    is_active: user.is_active
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Modifier l'Utilisateur</DialogTitle>
        <DialogDescription>
          Modifiez les informations de {user.display_name}
        </DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="edit_display_name">Nom d'affichage</Label>
        <Input
          id="edit_display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({...formData, display_name: e.target.value})}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit_employee_code">Code employé</Label>
        <Input
          id="edit_employee_code"
          value={formData.employee_code}
          onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="edit_is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
        />
        <Label htmlFor="edit_is_active">Compte actif</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          Sauvegarder
        </Button>
      </DialogFooter>
    </form>
  );
}