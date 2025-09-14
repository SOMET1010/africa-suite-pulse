import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ConsentPreferences } from '@/components/language-assistant/GDPRConsentModal';

interface GDPRSettings {
  id: string;
  userId: string;
  consents: ConsentPreferences;
  consentDate: Date;
  lastUpdated: Date;
  dataRetentionDays: number;
  privacyPolicyVersion: string;
}

export const useGDPRCompliance = () => {
  const { toast } = useToast();
  const [gdprSettings, setGdprSettings] = useState<GDPRSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false);

  // Load existing GDPR settings
  useEffect(() => {
    loadGDPRSettings();
  }, []);

  const loadGDPRSettings = async () => {
    setIsLoading(true);
    try {
      // For now, use localStorage as mock until GDPR tables are created
      const stored = localStorage.getItem('gdpr-language-assistant');
      if (stored) {
        const settings = JSON.parse(stored);
        setGdprSettings({
          ...settings,
          consentDate: new Date(settings.consentDate),
          lastUpdated: new Date(settings.lastUpdated)
        });
        setNeedsConsent(false);
      } else {
        setNeedsConsent(true);
      }
    } catch (error) {
      console.error('Error loading GDPR settings:', error);
      setNeedsConsent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConsent = async (consents: ConsentPreferences) => {
    setIsLoading(true);
    try {
      const settings: GDPRSettings = {
        id: Date.now().toString(),
        userId: 'current-user', // Replace with actual user ID
        consents,
        consentDate: new Date(),
        lastUpdated: new Date(),
        dataRetentionDays: consents.privateMode ? 0 : 30,
        privacyPolicyVersion: '1.0'
      };

      // Store in localStorage as mock
      localStorage.setItem('gdpr-language-assistant', JSON.stringify(settings));
      
      setGdprSettings(settings);
      setNeedsConsent(false);

      toast({
        title: "Consentement enregistré",
        description: "Vos préférences de confidentialité ont été sauvegardées."
      });

      // Log consent for audit trail
      await logDataProcessingEvent('consent_given', {
        consents,
        timestamp: new Date().toISOString(),
        ipAddress: 'masked',
        userAgent: 'masked'
      });

    } catch (error) {
      console.error('Error saving consent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos préférences.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeConsent = async () => {
    setIsLoading(true);
    try {
      // Log revocation for audit trail
      await logDataProcessingEvent('consent_revoked', {
        timestamp: new Date().toISOString(),
        previousConsents: gdprSettings?.consents
      });

      // Clear all stored data
      localStorage.removeItem('gdpr-language-assistant');
      localStorage.removeItem('language-assistant-conversations');
      
      setGdprSettings(null);
      setNeedsConsent(true);

      toast({
        title: "Consentement révoqué",
        description: "Toutes vos données ont été supprimées."
      });

    } catch (error) {
      console.error('Error revoking consent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de révoquer le consentement.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportUserData = async () => {
    try {
      const conversations = localStorage.getItem('language-assistant-conversations');
      const settings = localStorage.getItem('gdpr-language-assistant');
      
      const exportData = {
        timestamp: new Date().toISOString(),
        gdprSettings: settings ? JSON.parse(settings) : null,
        conversations: conversations ? JSON.parse(conversations) : [],
        dataTypes: [
          'language_preferences',
          'conversation_history',
          'consent_records',
          'usage_analytics'
        ],
        retentionPeriod: gdprSettings?.dataRetentionDays || 0
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `language-assistant-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log export for audit trail
      await logDataProcessingEvent('data_exported', {
        timestamp: new Date().toISOString(),
        dataTypes: exportData.dataTypes
      });

      toast({
        title: "Export terminé",
        description: "Vos données ont été téléchargées."
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter vos données.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purgeExpiredData = async () => {
    try {
      if (!gdprSettings || gdprSettings.dataRetentionDays === 0) return;

      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - gdprSettings.dataRetentionDays);

      const conversations = localStorage.getItem('language-assistant-conversations');
      if (conversations) {
        const parsed = JSON.parse(conversations);
        const filtered = parsed.filter((conv: any) => 
          new Date(conv.createdAt) > retentionDate
        );
        
        if (filtered.length !== parsed.length) {
          localStorage.setItem('language-assistant-conversations', JSON.stringify(filtered));
          
          await logDataProcessingEvent('data_purged', {
            timestamp: new Date().toISOString(),
            itemsRemoved: parsed.length - filtered.length,
            retentionDate: retentionDate.toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error purging expired data:', error);
    }
  };

  const logDataProcessingEvent = async (event: string, details: Record<string, any>) => {
    try {
      // Log to audit trail (mock implementation)
      const auditEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        event,
        details: anonymizeDetails(details),
        component: 'language_assistant',
        compliance: 'gdpr'
      };

      const auditLog = localStorage.getItem('gdpr-audit-log') || '[]';
      const entries = JSON.parse(auditLog);
      entries.push(auditEntry);
      
      // Keep only last 1000 entries
      if (entries.length > 1000) {
        entries.splice(0, entries.length - 1000);
      }
      
      localStorage.setItem('gdpr-audit-log', JSON.stringify(entries));
    } catch (error) {
      console.error('Error logging GDPR event:', error);
    }
  };

  const anonymizeDetails = (details: Record<string, any>) => {
    const anonymized = { ...details };
    
    // Remove or mask sensitive fields
    if (anonymized.ipAddress) anonymized.ipAddress = 'xxx.xxx.xxx.xxx';
    if (anonymized.userAgent) anonymized.userAgent = 'masked';
    if (anonymized.conversationContent) delete anonymized.conversationContent;
    
    return anonymized;
  };

  // Auto-purge on component mount
  useEffect(() => {
    if (gdprSettings && !gdprSettings.consents.privateMode) {
      purgeExpiredData();
    }
  }, [gdprSettings]);

  const hasValidConsent = () => {
    if (!gdprSettings) return false;
    
    const consentAge = Date.now() - gdprSettings.consentDate.getTime();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    
    return consentAge < oneYear && gdprSettings.consents.voiceProcessing;
  };

  const canStoreConversations = () => {
    return gdprSettings?.consents.conversationStorage && !gdprSettings?.consents.privateMode;
  };

  const canUseVoiceProcessing = () => {
    return gdprSettings?.consents.voiceProcessing || false;
  };

  const canShareWithExternalServices = () => {
    return gdprSettings?.consents.dataSharing || false;
  };

  return {
    gdprSettings,
    needsConsent,
    isLoading,
    saveConsent,
    revokeConsent,
    exportUserData,
    purgeExpiredData,
    hasValidConsent,
    canStoreConversations,
    canUseVoiceProcessing,
    canShareWithExternalServices,
    logDataProcessingEvent
  };
};
