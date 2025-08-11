import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { listProfiles, upsertProfile, deleteProfile, listPermissions, listProfilePermissions, upsertProfilePermissions } from "../users.api";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  description?: string;
  access_level: string;
  is_active: boolean;
}

interface Permission {
  id: string;
  code: string;
  label: string;
  category: string;
  description?: string;
}

interface ProfilesTabProps {
  orgId: string;
}

export default function ProfilesTab({ orgId }: ProfilesTabProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    access_level: "C"
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
    loadPermissions();
  }, [orgId]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await listProfiles(orgId);
      if (error) throw error;
      // Map the data to match our Profile interface
      const mappedProfiles = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || item.full_name || "Sans nom",
        description: item.description || "",
        access_level: item.access_level || "C",
        is_active: item.is_active !== false
      }));
      setProfiles(mappedProfiles);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des profils");
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const { data, error } = await listPermissions();
      if (error) throw error;
      setPermissions(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des permissions");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Nom requis");
      return;
    }

    try {
      const profileData = {
        id: editingProfile?.id,
        org_id: orgId,
        name: formData.name,
        description: formData.description,
        access_level: formData.access_level,
        is_active: true
      };

      const { data, error } = await upsertProfile(profileData);
      if (error) throw error;

      const profileId = data[0].id;

      // Update permissions
      await upsertProfilePermissions(
        selectedPermissions.map(permissionId => ({
          profile_id: profileId,
          permission_id: permissionId
        }))
      );
      
      toast.success(editingProfile ? "Profil modifié" : "Profil créé");
      resetForm();
      loadProfiles();
    } catch (error: any) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description || "",
      access_level: profile.access_level
    });
    setSelectedPermissions([]);
    setShowForm(true);
  };

  const handleDelete = async (profile: Profile) => {
    if (!confirm(`Supprimer le profil "${profile.name}" ?`)) return;
    
    try {
      const { error } = await deleteProfile(profile.id);
      if (error) throw error;
      
      toast.success("Profil supprimé");
      loadProfiles();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingProfile(null);
    setShowForm(false);
    setFormData({ name: "", description: "", access_level: "C" });
    setSelectedPermissions([]);
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case "T": return "Tous les accès";
      case "H": return "Hors facturation";
      case "C": return "Consultation";
      default: return level;
    }
  };

  const getAccessLevelVariant = (level: string) => {
    switch (level) {
      case "T": return "default";
      case "H": return "secondary";
      case "C": return "outline";
      default: return "outline";
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestion des Profils</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Profil
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProfile ? "Modifier le profil" : "Nouveau profil"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom du profil</label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Réception de jour"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Niveau d'accès</label>
                <Select value={formData.access_level} onValueChange={level => setFormData(prev => ({ ...prev, access_level: level }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T">T - Tous les accès</SelectItem>
                    <SelectItem value="H">H - Hors facturation</SelectItem>
                    <SelectItem value="C">C - Consultation uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du profil..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Permissions spécifiques</label>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryPermissions.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions(prev => [...prev, permission.id]);
                              } else {
                                setSelectedPermissions(prev => prev.filter(id => id !== permission.id));
                              }
                            }}
                          />
                          <label htmlFor={permission.id} className="text-sm">{permission.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit}>
                {editingProfile ? "Modifier" : "Créer"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {profiles.map(profile => (
          <Card key={profile.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{profile.name}</h4>
                    <Badge variant={getAccessLevelVariant(profile.access_level)}>
                      {getAccessLevelLabel(profile.access_level)}
                    </Badge>
                    {!profile.is_active && <Badge variant="destructive">Inactif</Badge>}
                  </div>
                  {profile.description && (
                    <p className="text-sm text-muted-foreground">{profile.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Profil configuré
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(profile)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(profile)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}