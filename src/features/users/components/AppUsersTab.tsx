import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { listAppUsers, listProfiles, upsertAppUser, deleteAppUser } from "../users.api";

interface AppUser {
  id: string;
  user_id: string;
  org_id: string;
  login: string;
  full_name: string;
  profile_id: string | null;
  password_expires_on: string | null;
  active: boolean;
  profiles?: {
    id: string;
    name: string;
    access_level: string;
  };
}

interface Profile {
  id: string;
  name: string;
  access_level: string;
}

interface AppUsersTabProps {
  orgId: string;
}

export default function AppUsersTab({ orgId }: AppUsersTabProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState({
    login: "",
    full_name: "",
    profile_id: "",
    password_expires_on: null as Date | null,
    active: true
  });

  useEffect(() => {
    loadUsers();
    loadProfiles();
  }, [orgId]);

  const loadUsers = async () => {
    try {
      const { data, error } = await listAppUsers(orgId);
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await listProfiles(orgId);
      if (error) throw error;
      // Map the data to match our Profile interface
      const mappedProfiles = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || item.full_name || "Sans nom",
        access_level: item.access_level || "C"
      }));
      setProfiles(mappedProfiles);
    } catch (error) {
      console.error("Erreur lors du chargement des profils:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...(editingUser && { id: editingUser.id }),
        org_id: orgId,
        user_id: editingUser?.user_id || crypto.randomUUID(), // En réel, il faudra créer l'utilisateur auth
        login: formData.login,
        full_name: formData.full_name,
        profile_id: formData.profile_id || null,
        password_expires_on: formData.password_expires_on?.toISOString().split('T')[0] || null,
        active: formData.active
      };

      const { error } = await upsertAppUser(payload);
      if (error) throw error;

      toast({
        title: "Succès",
        description: editingUser ? "Utilisateur modifié" : "Utilisateur créé"
      });

      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      login: user.login,
      full_name: user.full_name,
      profile_id: user.profile_id || "",
      password_expires_on: user.password_expires_on ? new Date(user.password_expires_on) : null,
      active: user.active
    });
    setIsEditing(true);
  };

  const handleDelete = async (user: AppUser) => {
    if (!confirm(`Supprimer l'utilisateur ${user.full_name} ?`)) return;
    
    try {
      const { error } = await deleteAppUser(user.id);
      if (error) throw error;

      toast({
        title: "Succès",
        description: "Utilisateur supprimé"
      });

      loadUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      login: "",
      full_name: "",
      profile_id: "",
      password_expires_on: null,
      active: true
    });
    setEditingUser(null);
    setIsEditing(false);
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'T': return 'Tous droits';
      case 'H': return 'Hors facturation';
      case 'C': return 'Consultation';
      default: return level;
    }
  };

  const getAccessLevelVariant = (level: string) => {
    switch (level) {
      case 'T': return 'default';
      case 'H': return 'secondary';
      case 'C': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Liste des utilisateurs */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Utilisateurs ({users.length})</h2>
        <Button onClick={() => setIsEditing(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{user.full_name}</h3>
                    <span className="text-sm text-muted-foreground">@{user.login}</span>
                    {!user.active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inactif</span>
                    )}
                  </div>
                  
                   {user.profiles && (
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-medium">{user.profiles.name}</span>
                       <span className={`text-xs px-2 py-1 rounded ${
                         getAccessLevelVariant(user.profiles.access_level) === 'default' ? 'bg-primary text-primary-foreground' :
                         getAccessLevelVariant(user.profiles.access_level) === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                         'bg-muted text-muted-foreground'
                       }`}>
                         {getAccessLevelLabel(user.profiles.access_level)}
                       </span>
                     </div>
                   )}

                  {user.password_expires_on && (
                    <p className="text-sm text-muted-foreground">
                      Expire le {format(new Date(user.password_expires_on), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulaire d'édition */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Code de connexion *</Label>
                  <Input
                    id="login"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder="ex: jdupont"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_id">Profil</Label>
                <Select
                  value={formData.profile_id}
                  onValueChange={(value) => setFormData({ ...formData, profile_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un profil" />
                  </SelectTrigger>
                  <SelectContent>
                     {profiles.map((profile) => (
                       <SelectItem key={profile.id} value={profile.id}>
                         {profile.name} ({getAccessLevelLabel(profile.access_level)})
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date d'expiration du mot de passe</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.password_expires_on ? (
                        format(formData.password_expires_on, 'dd/MM/yyyy', { locale: fr })
                      ) : (
                        "Sélectionner une date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.password_expires_on || undefined}
                      onSelect={(date) => setFormData({ ...formData, password_expires_on: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Compte actif</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingUser ? "Modifier" : "Créer"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}