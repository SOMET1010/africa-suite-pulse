import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguageAssistant } from '@/hooks/useLanguageAssistant';
import { QuickPhrasesTab } from './QuickPhrasesTab';
import { LiveTranslationTab } from './LiveTranslationTab';
import { SessionNotesTab } from './SessionNotesTab';
import { LanguageSelector } from './LanguageSelector';

interface LanguageAssistantProps {
  open: boolean;
  onClose: () => void;
  context?: {
    guestId?: string;
    roomNumber?: string;
    guestName?: string;
  };
}

export const LanguageAssistant: React.FC<LanguageAssistantProps> = ({
  open,
  onClose,
  context
}) => {
  const { selectedLanguage, setSelectedLanguage, currentSession } = useLanguageAssistant();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                🌐 Assistance Linguistique
              </SheetTitle>
              <SheetDescription>
                Communication multilingue pour l'accueil client
                {context?.guestName && (
                  <span className="block text-sm font-medium text-foreground mt-1">
                    Client: {context.guestName} {context.roomNumber && `- Chambre ${context.roomNumber}`}
                  </span>
                )}
              </SheetDescription>
            </div>
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="phrases" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="phrases" className="text-xs">
                📝 Phrases Rapides
              </TabsTrigger>
              <TabsTrigger value="translation" className="text-xs">
                🔄 Traduction Live
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">
                📋 Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phrases" className="mt-4">
              <QuickPhrasesTab context={context} />
            </TabsContent>

            <TabsContent value="translation" className="mt-4">
              <LiveTranslationTab context={context} />
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <SessionNotesTab 
                session={currentSession}
                context={context}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};