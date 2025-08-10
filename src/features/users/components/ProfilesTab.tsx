import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createUserProfile, updateUserProfile, deleteUserProfile } from "../profiles.api";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
    loadPermissions();
  }, [orgId]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await (supabase as any).from("user_profiles")
        .select("*")
        .eq("org_id", orgId)
        .order("name", { ascending: true });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const loadPermissions = async () => {
    try {
      const { data, error } = await (supabase as any).from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("label", { ascending: true });
      
      if (error) throw error;
      setPermissions(data || []);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "Nom requis", variant: "destructive" });
      return;
    }

    try {
      if (editingProfile) {
        await updateUserProfile(editingProfile.id, formData);
      } else {
        await createUserProfile({
          ...formData,
          org_id: orgId
        });
      }
      
      toast({ title: editingProfile ? "Profil modifié" : "Profil créé" });
      resetForm();
      loadProfiles();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
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
    
    const { error } = await deleteUserProfile(profile.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Profil supprimé" });
    loadProfiles();
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