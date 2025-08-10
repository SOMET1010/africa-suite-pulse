import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useOrgId } from "@/core/auth/useOrg";
import { listProfiles, updateProfile, createInvitation } from "./users.api";
import { useToast } from "@/hooks/use-toast";

const roles = ["admin", "manager", "staff"] as const;

export default function UsersPage() {
  const { orgId, loading, error } = useOrgId();
  const [rows, setRows] = useState<any[]>([]);
  const [invite, setInvite] = useState({email: "", role: "staff"});
  const { toast } = useToast();

  useEffect(() => { 
    if(!orgId) return; 
    (async () => { 
      const {data} = await listProfiles(orgId); 
      setRows(data || []); 
    })(); 
  }, [orgId]);

  if (loading) return <div className="p-6">Chargement de l'organisation...</div>;
  if (error) return <div className="p-6 text-destructive">Erreur: {error}</div>;
  if(!orgId) return <div className="p-6">Aucune organisation trouvée. Veuillez configurer votre profil.</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Gestion Utilisateurs</h1>
        <div className="flex gap-2">
          <Input 
            placeholder="email@domaine" 
            value={invite.email} 
            onChange={e => setInvite(v => ({...v, email: e.target.value}))}
          />
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2" 
            value={invite.role} 
            onChange={e => setInvite(v => ({...v, role: e.target.value}))}
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button onClick={async () => {
            if(!invite.email) return toast({title: "Email requis", variant: "destructive"});
            const { error } = await createInvitation({ 
              org_id: orgId, 
              email: invite.email, 
              role: invite.role 
            });
            if(error) return toast({title: "Erreur", description: error.message, variant: "destructive"});
            toast({title: "Invitation créée", description: "E-mail envoyé via votre routine d'envoi."});
            setInvite({email: "", role: "staff"});
          }}>
            Inviter
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Nom</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Rôle</th>
              <th className="px-3 py-2 text-left">Actif</th>
              <th className="px-3 py-2 text-left">Dernière connexion</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={u.user_id} className="border-t">
                <td className="px-3 py-2">{u.full_name || "—"}</td>
                <td className="px-3 py-2">{u.email || "—"}</td>
                <td className="px-3 py-2">
                  <select 
                    className="h-10 rounded-md border border-input bg-background px-3 py-2" 
                    value={u.role || "staff"} 
                    onChange={e => patch(i, {role: e.target.value})}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Switch 
                    checked={!!u.active} 
                    onCheckedChange={v => patch(i, {active: v})}
                  />
                </td>
                <td className="px-3 py-2">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={async () => {
                      const { error } = await updateProfile(u.user_id, { 
                        role: u.role, 
                        active: u.active 
                      });
                      error 
                        ? toast({title: "Erreur", description: error.message, variant: "destructive"}) 
                        : toast({title: "Enregistré"});
                    }}
                  >
                    Save
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  function patch(i: number, p: Partial<any>) {
    setRows(prev => prev.map((row, idx) => idx === i ? {...row, ...p} : row));
  }
}