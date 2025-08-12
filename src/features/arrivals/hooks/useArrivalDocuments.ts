import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DocumentGenerationOptions {
  reservationId: string;
  template?: string;
}

interface RoomCardOptions extends DocumentGenerationOptions {
  cardType?: 'magnetic' | 'qr' | 'pin';
}

interface StayProgramOptions extends DocumentGenerationOptions {
  includeServices?: boolean;
}

interface EmailDocumentOptions {
  reservationId: string;
  documentType: 'police_form' | 'room_card' | 'stay_program';
  email?: string;
  additionalOptions?: any;
}

export function useGeneratePoliceForm() {
  return useMutation({
    mutationFn: async (options: DocumentGenerationOptions) => {
      console.log('🔄 Generating police form...', options);
      
      const { data, error } = await supabase.functions.invoke('generate-police-form', {
        body: options
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Police form generated successfully');
      toast({
        title: "Fiche de police générée",
        description: "La fiche de police a été générée avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error generating police form:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la génération de la fiche de police",
        variant: "destructive",
      });
    }
  });
}

export function useGenerateRoomCard() {
  return useMutation({
    mutationFn: async (options: RoomCardOptions) => {
      console.log('🔄 Generating room card...', options);
      
      const { data, error } = await supabase.functions.invoke('generate-room-card', {
        body: options
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Room card generated successfully');
      toast({
        title: "Carte de chambre générée",
        description: `Carte de chambre ${data.card_type} générée avec succès`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Error generating room card:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la génération de la carte de chambre",
        variant: "destructive",
      });
    }
  });
}

export function useGenerateStayProgram() {
  return useMutation({
    mutationFn: async (options: StayProgramOptions) => {
      console.log('🔄 Generating stay program...', options);
      
      const { data, error } = await supabase.functions.invoke('generate-stay-program', {
        body: options
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Stay program generated successfully');
      toast({
        title: "Programme de séjour généré",
        description: `Programme généré avec ${data.services_count} services inclus`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Error generating stay program:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la génération du programme de séjour",
        variant: "destructive",
      });
    }
  });
}

export function useEmailDocument() {
  return useMutation({
    mutationFn: async (options: EmailDocumentOptions) => {
      console.log('🔄 Sending document by email...', options);
      
      // First generate the document
      let documentData;
      
      switch (options.documentType) {
        case 'police_form':
          const policeResponse = await supabase.functions.invoke('generate-police-form', {
            body: { 
              reservationId: options.reservationId,
              ...(options.additionalOptions || {})
            }
          });
          if (policeResponse.error) throw policeResponse.error;
          documentData = policeResponse.data;
          break;
          
        case 'room_card':
          const cardResponse = await supabase.functions.invoke('generate-room-card', {
            body: { 
              reservationId: options.reservationId,
              ...(options.additionalOptions || {})
            }
          });
          if (cardResponse.error) throw cardResponse.error;
          documentData = cardResponse.data;
          break;
          
        case 'stay_program':
          const programResponse = await supabase.functions.invoke('generate-stay-program', {
            body: { 
              reservationId: options.reservationId,
              ...(options.additionalOptions || {})
            }
          });
          if (programResponse.error) throw programResponse.error;
          documentData = programResponse.data;
          break;
          
        default:
          throw new Error('Type de document non supporté');
      }

      // Then send by email
      const { data, error } = await supabase.functions.invoke('send-reservation-email', {
        body: {
          reservationId: options.reservationId,
          action: 'document_delivery',
          customMessage: `Voici votre ${options.documentType === 'police_form' ? 'fiche de police' : 
                                       options.documentType === 'room_card' ? 'carte de chambre' : 
                                       'programme de séjour'}.`,
          sendPdf: true,
          documentType: options.documentType,
          documentData: documentData.pdf_data,
          documentFilename: documentData.filename,
          recipientEmail: options.email
        }
      });

      if (error) throw error;
      
      return { ...data, documentData };
    },
    onSuccess: (data) => {
      console.log('✅ Document sent by email successfully');
      toast({
        title: "Document envoyé",
        description: "Le document a été envoyé par email avec succès",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error sending document:', error);
      toast({
        title: "Erreur d'envoi",
        description: error.message || "Erreur lors de l'envoi du document par email",
        variant: "destructive",
      });
    }
  });
}