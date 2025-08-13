import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, DollarSign, Play, Square, Clock, TrendingUp, Calculator, FileText, History } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface POSSession {
  id: string;
  session_number: string;
  user_id: string;
  outlet_id: string;
  status: string;
  opening_amount: number;
  expected_amount: number;
  counted_amount?: number;
  discrepancy?: number;
  opened_at: string;
  closed_at?: string;
  notes?: string;
  user_name?: string;
  outlet_name?: string;
}

export function POSSessionManagement() {
  const [showOpenSession, setShowOpenSession] = useState(false);
  const [showCloseSession, setShowCloseSession] = useState(false);
  const [selectedSession, setSelectedSession] = useState<POSSession | null>(null);
  const [countingData, setCountingData] = useState({
    counted_amount: 0,
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["pos-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_sessions")
        .select(`
          *,
          pos_users!inner(display_name),
          pos_outlets!inner(name)
        `)
        .order("opened_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data?.map(session => ({
        ...session,
        user_name: session.pos_users?.display_name,
        outlet_name: session.pos_outlets?.name
      })) || [];
    }
  });

  // Get current active session
  const currentSession = sessions.find(s => s.status === 'open');

  // Open session mutation
  const openSessionMutation = useMutation({
    mutationFn: async (data: { opening_amount: number; notes?: string }) => {
      const { data: result, error } = await supabase
        .from("pos_sessions")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          outlet_id: 'default', // Would get from context
          opening_amount: data.opening_amount,
          status: 'open',
          notes: data.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-sessions"] });
      toast({
        title: "Session ouverte",
        description: "La session de caisse a été ouverte avec succès",
      });
      setShowOpenSession(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'ouvrir la session: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Close session mutation
  const closeSessionMutation = useMutation({
    mutationFn: async (data: { session_id: string; counted_amount: number; notes?: string }) => {
      const session = sessions.find(s => s.id === data.session_id);
      if (!session) throw new Error("Session introuvable");

      const discrepancy = data.counted_amount - session.expected_amount;

      const { error } = await supabase
        .from("pos_sessions")
        .update({
          status: 'closed',
          counted_amount: data.counted_amount,
          discrepancy: discrepancy,
          closed_at: new Date().toISOString(),
          notes: data.notes
        })
        .eq("id", data.session_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-sessions"] });
      toast({
        title: "Session fermée",
        description: "La session de caisse a été fermée avec succès",
      });
      setShowCloseSession(false);
      setSelectedSession(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de fermer la session: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const getSessionStatus = (session: POSSession) => {
    switch (session.status) {
      case 'open':
        return <Badge className="bg-green-500">Ouverte</Badge>;
      case 'closed':
        return <Badge variant="secondary">Fermée</Badge>;
      default:
        return <Badge variant="outline">{session.status}</Badge>;
    }
  };

  const calculateSessionDuration = (session: POSSession) => {
    const start = new Date(session.opened_at);
    const end = session.closed_at ? new Date(session.closed_at) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const todaySessions = sessions.filter(s => 
    new Date(s.opened_at).toDateString() === new Date().toDateString()
  );

  const totalRevenue = todaySessions.reduce((sum, s) => sum + (s.expected_amount || 0), 0);
  const totalDiscrepancy = todaySessions.reduce((sum, s) => sum + Math.abs(s.discrepancy || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Gestion des Sessions
          </h1>
          <p className="text-muted-foreground">
            Gérez l'ouverture et fermeture des caisses
          </p>
        </div>
        <div className="flex gap-2">
          {!currentSession ? (
            <Dialog open={showOpenSession} onOpenChange={setShowOpenSession}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90">
                  <Play className="w-4 h-4 mr-2" />
                  Ouvrir Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <OpenSessionForm 
                  onSubmit={(data) => openSessionMutation.mutate(data)}
                  onClose={() => setShowOpenSession(false)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              variant="destructive"
              onClick={() => {
                setSelectedSession(currentSession);
                setShowCloseSession(true);
              }}
            >
              <Square className="w-4 h-4 mr-2" />
              Fermer Session
            </Button>
          )}
        </div>
      </div>

      {/* Current Session Alert */}
      {currentSession && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-medium">Session Active</p>
                  <p className="text-sm text-muted-foreground">
                    {currentSession.session_number} • Ouverte à {new Date(currentSession.opened_at).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-mono font-medium">{calculateSessionDuration(currentSession)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Aujourd'hui</p>
                <p className="text-2xl font-bold">{todaySessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus Journée</p>
                <p className="text-xl font-bold">{totalRevenue.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Écarts Totaux</p>
                <p className="text-xl font-bold text-yellow-600">{totalDiscrepancy.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Fermées</p>
                <p className="text-2xl font-bold text-blue-600">
                  {todaySessions.filter(s => s.status === 'closed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Session Courante</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentSession ? (
            <Card>
              <CardHeader>
                <CardTitle>Session Active - {currentSession.session_number}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Utilisateur:</span>
                        <span className="font-medium">{currentSession.user_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Point de vente:</span>
                        <span className="font-medium">{currentSession.outlet_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ouverture:</span>
                        <span className="font-medium">
                          {new Date(currentSession.opened_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durée:</span>
                        <span className="font-medium">{calculateSessionDuration(currentSession)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Montants</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ouverture:</span>
                        <span className="font-medium">{currentSession.opening_amount.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ventes:</span>
                        <span className="font-medium">
                          {(currentSession.expected_amount - currentSession.opening_amount).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attendu:</span>
                        <span className="font-medium">{currentSession.expected_amount.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          // Ouvrir tiroir caisse
                          toast({
                            title: "Tiroir caisse ouvert",
                            description: "Le tiroir caisse a été ouvert"
                          });
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Ouvrir Tiroir
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          // Voir rapport intermédiaire
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Rapport Intérimaire
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune session active</h3>
                <p className="text-muted-foreground mb-4">
                  Ouvrez une session pour commencer à enregistrer les ventes
                </p>
                <Button onClick={() => setShowOpenSession(true)}>
                  <Play className="w-4 h-4 mr-2" />
                  Ouvrir Session
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Ouverture</TableHead>
                    <TableHead>Fermeture</TableHead>
                    <TableHead>Attendu</TableHead>
                    <TableHead>Compté</TableHead>
                    <TableHead>Écart</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono">{session.session_number}</TableCell>
                      <TableCell>{session.user_name}</TableCell>
                      <TableCell>
                        {new Date(session.opened_at).toLocaleDateString('fr-FR')} <br />
                        <span className="text-sm text-muted-foreground">
                          {new Date(session.opened_at).toLocaleTimeString('fr-FR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {session.closed_at ? (
                          <>
                            {new Date(session.closed_at).toLocaleDateString('fr-FR')} <br />
                            <span className="text-sm text-muted-foreground">
                              {new Date(session.closed_at).toLocaleTimeString('fr-FR')}
                            </span>
                          </>
                        ) : 'En cours'}
                      </TableCell>
                      <TableCell>{session.expected_amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        {session.counted_amount ? `${session.counted_amount.toLocaleString()} FCFA` : '-'}
                      </TableCell>
                      <TableCell>
                        {session.discrepancy !== undefined ? (
                          <span className={session.discrepancy === 0 ? 'text-green-600' : 'text-red-600'}>
                            {session.discrepancy > 0 ? '+' : ''}{session.discrepancy.toLocaleString()} FCFA
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getSessionStatus(session)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Rapports détaillés</p>
                <p className="text-muted-foreground">Fonctionnalité en développement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Close Session Dialog */}
      {selectedSession && (
        <Dialog open={showCloseSession} onOpenChange={setShowCloseSession}>
          <DialogContent>
            <CloseSessionForm 
              session={selectedSession}
              onSubmit={(data) => closeSessionMutation.mutate({
                session_id: selectedSession.id,
                ...data
              })}
              onClose={() => {
                setShowCloseSession(false);
                setSelectedSession(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function OpenSessionForm({ onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    opening_amount: 0,
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Ouvrir une Session</DialogTitle>
        <DialogDescription>
          Enregistrez le montant d'ouverture de caisse
        </DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="opening_amount">Montant d'ouverture (FCFA)</Label>
        <Input
          id="opening_amount"
          type="number"
          value={formData.opening_amount}
          onChange={(e) => setFormData({...formData, opening_amount: Number(e.target.value)})}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Notes sur l'ouverture de session..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-green-500 hover:bg-green-600">
          Ouvrir Session
        </Button>
      </DialogFooter>
    </form>
  );
}

function CloseSessionForm({ session, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    counted_amount: session.expected_amount,
    notes: ""
  });

  const discrepancy = formData.counted_amount - session.expected_amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Fermer la Session</DialogTitle>
        <DialogDescription>
          Comptez la caisse et enregistrez le montant final
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Attendu</p>
          <p className="text-lg font-semibold">{session.expected_amount.toLocaleString()} FCFA</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Écart</p>
          <p className={`text-lg font-semibold ${discrepancy === 0 ? 'text-green-600' : discrepancy > 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {discrepancy > 0 ? '+' : ''}{discrepancy.toLocaleString()} FCFA
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="counted_amount">Montant compté (FCFA)</Label>
        <Input
          id="counted_amount"
          type="number"
          value={formData.counted_amount}
          onChange={(e) => setFormData({...formData, counted_amount: Number(e.target.value)})}
          required
        />
      </div>

      <div>
        <Label htmlFor="close_notes">Notes de fermeture</Label>
        <Textarea
          id="close_notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Notes sur la fermeture de session..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" variant="destructive">
          Fermer Session
        </Button>
      </DialogFooter>
    </form>
  );
}