import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrgId } from "@/core/auth/useOrg";
import ProfilesTab from "./components/ProfilesTab";
import AppUsersTab from "./components/AppUsersTab";

export default function UsersSettingsPage() {
  const { orgId, loading, error } = useOrgId();

  if (loading) return <div className="p-6">Chargement de l'organisation...</div>;
  if (error) return <div className="p-6 text-destructive">Erreur: {error}</div>;
  if (!orgId) return <div className="p-6">Aucune organisation trouvée. Veuillez configurer votre profil.</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Gestion Utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérez les profils de permissions et les comptes utilisateurs de votre organisation.
        </p>
      </div>

      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profiles">Profils</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <ProfilesTab orgId={orgId} />
        </TabsContent>

        <TabsContent value="users">
          <AppUsersTab orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}