import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { listUsers, updateUser, listUserProfiles } from "../profiles.api";
import { updateProfile, createInvitation } from "../users.api";
import { CalendarIcon, Pencil, Save } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface User {
  user_id: string;
  full_name?: string;
  email?: string;
  role: string;
  active: boolean;
  last_login_at?: string;
  profile_id?: string;
  login_code?: string;
  expires_at?: string;
}

interface UserProfile {
  id: string;
  name: string;
  access_level: string;
  is_active: boolean;
}

interface UsersTabProps {
  orgId: string;
}

export default function UsersTab({ orgId }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [invite, setInvite] = useState({ email: "", role: "staff" });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadProfiles();
  }, [orgId]);

  const loadUsers = async () => {
    const { data, error } = await listUsers(orgId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setUsers(data || []);
  };

  const loadProfiles = async () => {
    const { data, error } = await listUserProfiles(orgId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setProfiles(data || []);
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    const { error } = await updateProfile(userId, updates);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Utilisateur mis à jour" });
    setEditingUser(null);
    loadUsers();
  };

  const handleInvite = async () => {
    if (!invite.email) {
      toast({ title: "Email requis", variant: "destructive" });
      return;
    }

    const { error } = await createInvitation({
      org_id: orgId,
      email: invite.email,
      role: invite.role
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Invitation créée", description: "E-mail envoyé via votre routine d'envoi." });
    setInvite({ email: "", role: "staff" });
  };

  const patch = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.user_id === userId ? { ...user, ...updates } : user
    ));
  };

  const getProfileName = (profileId?: string) => {
    if (!profileId) return "Aucun profil";
    const profile = profiles.find(p => p.id === profileId);
    return profile?.name || "Profil inconnu";
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestion des Utilisateurs</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="email@domaine" 
            value={invite.email} 
            onChange={e => setInvite(v => ({...v, email: e.target.value}))}
            className="w-48"
          />
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2" 
            value={invite.role} 
            onChange={e => setInvite(v => ({...v, role: e.target.value}))}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
          <Button onClick={handleInvite}>
            Inviter
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.user_id}>
            <CardContent className="pt-6">
              {editingUser === user.user_id ? (
                <EditUserForm 
                  user={user}
                  profiles={profiles}
                  onSave={(updates) => handleUserUpdate(user.user_id, updates)}
                  onCancel={() => setEditingUser(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{user.full_name || "—"}</h4>
                      {user.login_code && (
                        <Badge variant="outline">Code: {user.login_code}</Badge>
                      )}
                      {!user.active && <Badge variant="destructive">Inactif</Badge>}
                      {isExpired(user.expires_at) && <Badge variant="destructive">Expiré</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{user.email || "—"}</p>
                      <p>Rôle: {user.role}</p>
                      <p>Dernière connexion: {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—"}</p>
                      {user.expires_at && (
                        <p>Expire le: {format(new Date(user.expires_at), "dd/MM/yyyy", { locale: fr })}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Actif</span>
                      <Switch 
                        checked={!!user.active} 
                        onCheckedChange={v => patch(user.user_id, { active: v })}
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingUser(user.user_id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleUserUpdate(user.user_id, { 
                        active: user.active,
                        profile_id: user.profile_id,
                        login_code: user.login_code,
                        expires_at: user.expires_at
                      })}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface EditUserFormProps {
  user: User;
  profiles: UserProfile[];
  onSave: (updates: Partial<User>) => void;
  onCancel: () => void;
}

function EditUserForm({ user, profiles, onSave, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    login_code: user.login_code || "",
    profile_id: user.profile_id || "",
    expires_at: user.expires_at || ""
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nom complet</label>
          <Input
            value={formData.full_name}
            onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Code de connexion</label>
          <Input
            value={formData.login_code}
            onChange={e => setFormData(prev => ({ ...prev, login_code: e.target.value }))}
            placeholder="Code court unique"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Profil</label>
          <Select 
            value={formData.profile_id} 
            onValueChange={profileId => setFormData(prev => ({ ...prev, profile_id: profileId }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un profil" />
            </SelectTrigger>
            <SelectContent>
              {profiles.filter(p => p.is_active).map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name} ({profile.access_level})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Date d'expiration</label>
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expires_at 
                  ? format(new Date(formData.expires_at), "dd/MM/yyyy", { locale: fr })
                  : "Pas de limite"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expires_at ? new Date(formData.expires_at) : undefined}
                onSelect={(date) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    expires_at: date ? date.toISOString().split('T')[0] : ""
                  }));
                  setShowCalendar(false);
                }}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit}>Enregistrer</Button>
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}