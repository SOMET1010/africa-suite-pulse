import { QRCodeSVG } from "qrcode.react";

interface FNETicketSectionProps {
  fneInvoiceId?: string;
  fneReferenceNumber?: string;
  fneQrCode?: string;
  fneValidatedAt?: string;
}

export const FNETicketSection = ({ 
  fneInvoiceId, 
  fneReferenceNumber, 
  fneQrCode, 
  fneValidatedAt 
}: FNETicketSectionProps) => {
  // Ne pas afficher si pas de données FNE
  if (!fneInvoiceId || !fneQrCode) {
    return null;
  }

  return (
    <div className="fne-section" style={{ 
      borderTop: '2px solid #000', 
      paddingTop: '10px', 
      marginTop: '15px',
      textAlign: 'center'
    }}>
      {/* En-tête FNE */}
      <div style={{ 
        fontSize: '14px', 
        fontWeight: 'bold', 
        marginBottom: '8px',
        letterSpacing: '1px'
      }}>
        FACTURE NORMALISEE ELECTRONIQUE
      </div>
      
      <div style={{ 
        fontSize: '12px', 
        marginBottom: '5px',
        color: '#666'
      }}>
        Direction Générale des Impôts - Côte d'Ivoire
      </div>

      {/* QR Code centré */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        margin: '10px 0'
      }}>
        <QRCodeSVG 
          value={fneQrCode}
          size={120}
          level="M"
          includeMargin={false}
        />
      </div>

      {/* Informations FNE */}
      <div style={{ fontSize: '10px', lineHeight: '1.3' }}>
        <div style={{ marginBottom: '3px' }}>
          <strong>ID FNE:</strong> {fneInvoiceId}
        </div>
        
        {fneReferenceNumber && (
          <div style={{ marginBottom: '3px' }}>
            <strong>Réf DGI:</strong> {fneReferenceNumber}
          </div>
        )}
        
        {fneValidatedAt && (
          <div style={{ marginBottom: '3px' }}>
            <strong>Validée le:</strong> {new Date(fneValidatedAt).toLocaleString('fr-FR')}
          </div>
        )}
      </div>

      {/* Instructions de vérification */}
      <div style={{ 
        fontSize: '9px', 
        marginTop: '8px',
        fontStyle: 'italic',
        color: '#555'
      }}>
        Scannez ce QR code pour vérifier l'authenticité
        <br />
        de cette facture sur le site de la DGI
      </div>

      {/* URL courte pour vérification manuelle */}
      <div style={{ 
        fontSize: '8px', 
        marginTop: '5px',
        wordBreak: 'break-all'
      }}>
        {fneQrCode.replace('https://', '')}
      </div>
    </div>
  );
};