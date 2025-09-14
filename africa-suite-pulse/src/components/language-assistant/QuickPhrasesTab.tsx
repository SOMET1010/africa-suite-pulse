import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Copy } from 'lucide-react';
import { useLanguageAssistant } from '@/hooks/useLanguageAssistant';
import { useToast } from '@/components/ui/use-toast';

interface QuickPhrasesTabProps {
  context?: {
    guestId?: string;
    roomNumber?: string;
    guestName?: string;
  };
}

const PHRASE_CATEGORIES = [
  { key: 'checkin', label: 'Check-in', icon: '🏨', color: 'bg-blue-100 text-blue-800' },
  { key: 'checkout', label: 'Check-out', icon: '🚪', color: 'bg-green-100 text-green-800' },
  { key: 'services', label: 'Services', icon: '🛎️', color: 'bg-purple-100 text-purple-800' },
  { key: 'emergency', label: 'Urgence', icon: '🚨', color: 'bg-red-100 text-red-800' },
  { key: 'politeness', label: 'Politesse', icon: '🤝', color: 'bg-yellow-100 text-yellow-800' },
];

export const QuickPhrasesTab: React.FC<QuickPhrasesTabProps> = ({ context }) => {
  const { toast } = useToast();
  const { getPhrasesByCategory, getPhrase, speakText, selectedLanguage } = useLanguageAssistant();
  const [selectedCategory, setSelectedCategory] = useState('checkin');
  const [searchQuery, setSearchQuery] = useState('');

  const phrases = getPhrasesByCategory(selectedCategory);

  const filteredPhrases = phrases.filter(phrase => {
    const translation = phrase.translations[selectedLanguage] || '';
    return translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
           phrase.phrase_key.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCopyPhrase = async (phraseKey: string) => {
    const variables = context?.roomNumber ? { room_number: context.roomNumber } : undefined;
    const text = getPhrase(phraseKey, variables);
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: "Phrase copiée dans le presse-papier"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier la phrase",
        variant: "destructive"
      });
    }
  };

  const handleSpeakPhrase = (phraseKey: string) => {
    const variables = context?.roomNumber ? { room_number: context.roomNumber } : undefined;
    const text = getPhrase(phraseKey, variables);
    speakText(text);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Rechercher une phrase..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PHRASE_CATEGORIES.map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.key)}
            className="flex items-center gap-1"
          >
            <span>{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>

      {/* Phrases */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPhrases.map((phrase) => {
          const variables = context?.roomNumber ? { room_number: context.roomNumber } : undefined;
          const translatedText = getPhrase(phrase.phrase_key, variables);
          
          return (
            <Card key={phrase.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {phrase.context}
                    </p>
                    <p className="text-base leading-relaxed break-words">
                      {translatedText}
                    </p>
                    {phrase.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {phrase.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSpeakPhrase(phrase.phrase_key)}
                      className="h-8 w-8 p-0"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyPhrase(phrase.phrase_key)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPhrases.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune phrase trouvée pour cette recherche</p>
        </div>
      )}
    </div>
  );
};