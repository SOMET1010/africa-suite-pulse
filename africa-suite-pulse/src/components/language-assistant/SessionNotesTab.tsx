import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SessionNotesTabProps {
  session: any;
  context?: {
    guestId?: string;
    roomNumber?: string;
    guestName?: string;
  };
}

interface ConversationMessage {
  id: string;
  timestamp: Date;
  type: 'receptionist' | 'guest';
  language: string;
  originalText: string;
  translatedText?: string;
  category?: string;
}

export const SessionNotesTab: React.FC<SessionNotesTabProps> = ({ session, context }) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [conversationHistory] = useState<ConversationMessage[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'receptionist',
      language: 'fr',
      originalText: 'Bonjour et bienvenue à l\'hôtel. Comment puis-je vous aider ?',
      translatedText: 'Hello and welcome to the hotel. How may I help you?',
      category: 'checkin'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: 'guest',
      language: 'en',
      originalText: 'I have a reservation under Smith',
      translatedText: 'J\'ai une réservation au nom de Smith'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: 'receptionist',
      language: 'fr',
      originalText: 'Puis-je voir votre passeport, s\'il vous plaît ?',
      translatedText: 'May I see your passport, please?',
      category: 'checkin'
    }
  ]);

  const saveNotes = async () => {
    try {
      // In real implementation, save to database
      toast({
        title: "Sauvegardé",
        description: "Les notes ont été sauvegardées"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive"
      });
    }
  };

  const exportConversation = () => {
    const exportData = {
      session: {
        id: session?.id,
        timestamp: new Date().toISOString(),
        guest: context?.guestName,
        room: context?.roomNumber
      },
      conversation: conversationHistory,
      notes
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${context?.guestName || 'guest'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exporté",
      description: "La conversation a été exportée"
    });
  };

  const clearHistory = () => {
    // In real implementation, clear session history
    toast({
      title: "Effacé",
      description: "L'historique a été effacé"
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Session info */}
      {session && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">📋 Session actuelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client:</span>
              <span>{context?.guestName || 'Non spécifié'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chambre:</span>
              <span>{context?.roomNumber || 'Non spécifiée'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Langue cible:</span>
              <span>{session.target_language?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Statut:</span>
              <Badge variant={session.is_active ? "default" : "secondary"}>
                {session.is_active ? 'Active' : 'Terminée'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            💬 Historique de conversation
            <Button
              onClick={clearHistory}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {conversationHistory.map((message, index) => (
              <div key={message.id}>
                <div className={`flex gap-3 ${message.type === 'receptionist' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'receptionist' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {message.type === 'receptionist' ? '👤 Réceptionniste' : '🗣️ Client'}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.category && (
                        <Badge variant="outline" className="text-xs h-5">
                          {message.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">
                      {message.originalText}
                    </p>
                    {message.translatedText && (
                      <p className="text-xs mt-2 opacity-80 italic">
                        → {message.translatedText}
                      </p>
                    )}
                  </div>
                </div>
                {index < conversationHistory.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
          
          {conversationHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune conversation enregistrée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">📝 Notes de session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Ajoutez des notes sur cette session (préférences client, demandes spéciales, observations...)."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={saveNotes} size="sm" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
            <Button 
              onClick={exportConversation} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};