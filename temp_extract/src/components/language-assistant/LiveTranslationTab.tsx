import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Volume2, Copy, ArrowUpDown } from 'lucide-react';
import { useLanguageAssistant } from '@/hooks/useLanguageAssistant';
import { useToast } from '@/components/ui/use-toast';

interface LiveTranslationTabProps {
  context?: {
    guestId?: string;
    roomNumber?: string;
    guestName?: string;
  };
}

export const LiveTranslationTab: React.FC<LiveTranslationTabProps> = ({ context }) => {
  const { toast } = useToast();
  const { selectedLanguage, speakText, translateText } = useLanguageAssistant();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Real translation using Edge Function
  const performTranslation = async (text: string, fromLang: string = 'fr', toLang: string = selectedLanguage) => {
    setIsTranslating(true);
    try {
      const translatedResult = await translateText(text, toLang, {
        ...context,
        category: 'general'
      });
      setTranslatedText(translatedResult);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de traduire le texte",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    performTranslation(sourceText);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée par votre navigateur",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSourceText(text);
      performTranslation(text);
    };

    recognition.onerror = () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la reconnaissance vocale",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: "Texte copié dans le presse-papier"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive"
      });
    }
  };

  const swapLanguages = () => {
    // For now, just swap the text content
    const temp = sourceText;
    setSourceText(translatedText);
    setTranslatedText(temp);
  };

  return (
    <div className="space-y-4">
      {/* Source text input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            🇫🇷 Français (Réceptionniste)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Tapez votre message en français..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-24 resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleVoiceInput}
              disabled={isRecording}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
              {isRecording ? 'Écoute...' : 'Vocal'}
            </Button>
            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              size="sm"
            >
              {isTranslating ? 'Traduction...' : 'Traduire'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Swap button */}
      <div className="flex justify-center">
        <Button
          onClick={swapLanguages}
          variant="outline"
          size="sm"
          className="rounded-full h-10 w-10 p-0"
          disabled={!translatedText}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Translated text output */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {selectedLanguage === 'en' && '🇺🇸 English'}
            {selectedLanguage === 'es' && '🇪🇸 Español'}
            {selectedLanguage === 'pt' && '🇵🇹 Português'}
            {selectedLanguage === 'ar' && '🇸🇦 العربية'}
            {selectedLanguage === 'fr' && '🇫🇷 Français'}
            (Client)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="min-h-24 p-3 border rounded-md bg-muted/30">
            {translatedText || (
              <span className="text-muted-foreground italic">
                La traduction apparaîtra ici...
              </span>
            )}
          </div>
          {translatedText && (
            <div className="flex gap-2">
              <Button
                onClick={() => speakText(translatedText)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Écouter
              </Button>
              <Button
                onClick={() => handleCopy(translatedText)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">💡 Suggestions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {[
              'Bonjour, comment allez-vous ?',
              'Pouvez-vous m\'aider ?',
              'Un moment s\'il vous plaît',
              'Merci beaucoup'
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                className="justify-start text-left h-auto p-2"
                onClick={() => {
                  setSourceText(suggestion);
                  performTranslation(suggestion);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};