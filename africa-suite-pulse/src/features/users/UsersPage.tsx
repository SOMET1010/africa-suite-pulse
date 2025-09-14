import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrgId } from "@/core/auth/useOrg";
import { GlobalNavigationLayout } from "@/core/layout/GlobalNavigationLayout";
import ProfilesTab from "./components/ProfilesTab";
import UsersTab from "./components/UsersTab";

export default function UsersPage() {
  const { orgId, loading, error } = useOrgId();
  const [activeTab, setActiveTab] = useState("users");

  if (loading) return <div className="p-6">Chargement de l'organisation...</div>;
  if (error) return <div className="p-6 text-destructive">Erreur: {error}</div>;
  if(!orgId) return <div className="p-6">Aucune organisation trouvée. Veuillez configurer votre profil.</div>;

  return (
    <GlobalNavigationLayout title="Gestion des Utilisateurs">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Gérez les profils de permissions et les comptes utilisateurs de votre organisation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="profiles">Profils</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab orgId={orgId} />
        </TabsContent>

        <TabsContent value="profiles">
          <ProfilesTab orgId={orgId} />
        </TabsContent>
      </Tabs>
    </GlobalNavigationLayout>
  );
}