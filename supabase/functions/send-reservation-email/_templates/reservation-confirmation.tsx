import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ReservationConfirmationEmailProps {
  reservation: {
    id: string;
    reference?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    room_number?: string;
    room_type?: string;
    date_arrival: string;
    date_departure: string;
    planned_time?: string;
    adults: number;
    children: number;
    rate_total?: number;
    status: string;
    special_requests?: string;
    notes?: string;
  };
  hotelSettings?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
  };
  action: 'confirmation' | 'modification' | 'cancellation';
  customMessage?: string;
}

export const ReservationConfirmationEmail = ({
  reservation,
  hotelSettings,
  action,
  customMessage,
}: ReservationConfirmationEmailProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActionTitle = () => {
    switch (action) {
      case 'confirmation':
        return 'Confirmation de votre réservation';
      case 'modification':
        return 'Modification de votre réservation';
      case 'cancellation':
        return 'Annulation de votre réservation';
      default:
        return 'Votre réservation';
    }
  };

  const getActionColor = () => {
    switch (action) {
      case 'confirmation':
        return '#22c55e';
      case 'modification':
        return '#f59e0b';
      case 'cancellation':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const getStatusText = () => {
    switch (reservation.status) {
      case 'confirmed':
        return 'Confirmée';
      case 'option':
        return 'En option';
      case 'present':
        return 'Client présent';
      case 'cancelled':
        return 'Annulée';
      default:
        return reservation.status;
    }
  };

  const nights = Math.ceil(
    (new Date(reservation.date_departure).getTime() - new Date(reservation.date_arrival).getTime()) 
    / (1000 * 60 * 60 * 24)
  );

  return (
    <Html>
      <Head />
      <Preview>{getActionTitle()} - {hotelSettings?.name || 'AfricaSuite Hotel'}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {hotelSettings?.logo_url && (
              <Img
                src={hotelSettings.logo_url}
                width="120"
                height="40"
                alt={hotelSettings.name}
                style={logo}
              />
            )}
            <Heading style={h1}>{hotelSettings?.name || 'AfricaSuite Hotel'}</Heading>
            {hotelSettings?.address && (
              <Text style={headerText}>{hotelSettings.address}</Text>
            )}
          </Section>

          {/* Action Banner */}
          <Section style={{...actionBanner, backgroundColor: getActionColor()}}>
            <Text style={actionText}>{getActionTitle()}</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={text}>
              Cher(e) {reservation.guest_name},
            </Text>
            
            {action === 'confirmation' && (
              <Text style={text}>
                Nous avons le plaisir de confirmer votre réservation. Vous trouverez ci-dessous tous les détails de votre séjour.
              </Text>
            )}
            
            {action === 'modification' && (
              <Text style={text}>
                Votre réservation a été modifiée avec succès. Veuillez trouver ci-dessous les détails mis à jour.
              </Text>
            )}
            
            {action === 'cancellation' && (
              <Text style={text}>
                Nous avons pris en compte l'annulation de votre réservation. Nous espérons avoir le plaisir de vous accueillir à une autre occasion.
              </Text>
            )}

            {customMessage && (
              <Text style={{...text, ...customMessageStyle}}>
                {customMessage}
              </Text>
            )}
          </Section>

          {/* Reservation Details */}
          <Section style={detailsSection}>
            <Heading style={h2}>Détails de la réservation</Heading>
            
            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={labelText}>Référence :</Text>
              </Column>
              <Column style={detailValue}>
                <Text style={valueText}>{reservation.reference || reservation.id}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={labelText}>Statut :</Text>
              </Column>
              <Column style={detailValue}>
                <Text style={{...valueText, color: getActionColor(), fontWeight: 'bold'}}>
                  {getStatusText()}
                </Text>
              </Column>
            </Row>

            <Hr style={separator} />

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={labelText}>Arrivée :</Text>
              </Column>
              <Column style={detailValue}>
                <Text style={valueText}>
                  {formatDate(reservation.date_arrival)}
                  {reservation.planned_time && ` à ${reservation.planned_time}`}
                </Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={labelText}>Départ :</Text>
              </Column>
              <Column style={detailValue}>
                <Text style={valueText}>{formatDate(reservation.date_departure)}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={labelText}>Durée :</Text>
              </Column>
              <Column style={detailValue}>
                <Text style={valueText}>{nights} nuit{nights > 1 ? 's' : ''}</Text>
              </Column>
            </Row>

            <Hr style={separator} />

            {reservation.room_number && (
              <Row style={detailRow}>
                <Column style={detailLabel}>
                  <Text style={labelText}>Chambre :</Text>
                </Column>
                <Column style={detailValue}>
                  <Text style={valueText}>Ch. {reservation.room_number}</Text>
                </Column>
              </Row>
            )}

            {reservation.room_type && (
              <Row style={detailRow}>
                <Column style={detailLabel}>
                  <Text style={labelText}>Type :</Text>
                </Column>
                <Column style={detailValue}>
                  <Text style={valueText}>{reservation.room_type}</Text>
                </Column>
              </Row>
            )}

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={labelText}>Occupants :</Text>
              </Column>
              <Column style={detailValue}>
                <Text style={valueText}>
                  {reservation.adults} adulte{reservation.adults > 1 ? 's' : ''}
                  {reservation.children > 0 && `, ${reservation.children} enfant${reservation.children > 1 ? 's' : ''}`}
                </Text>
              </Column>
            </Row>

            {reservation.rate_total && (
              <>
                <Hr style={separator} />
                <Row style={detailRow}>
                  <Column style={detailLabel}>
                    <Text style={labelText}>Tarif total :</Text>
                  </Column>
                  <Column style={detailValue}>
                    <Text style={{...valueText, fontSize: '18px', fontWeight: 'bold', color: '#059669'}}>
                      {reservation.rate_total.toLocaleString()} F CFA
                    </Text>
                  </Column>
                </Row>
              </>
            )}

            {reservation.special_requests && (
              <>
                <Hr style={separator} />
                <Row style={detailRow}>
                  <Column style={detailLabel}>
                    <Text style={labelText}>Demandes spéciales :</Text>
                  </Column>
                  <Column style={detailValue}>
                    <Text style={valueText}>{reservation.special_requests}</Text>
                  </Column>
                </Row>
              </>
            )}
          </Section>

          {/* Contact Information */}
          <Section style={contactSection}>
            <Heading style={h2}>Informations de contact</Heading>
            <Text style={text}>
              Pour toute question concernant votre réservation, n'hésitez pas à nous contacter :
            </Text>
            
            {hotelSettings?.phone && (
              <Text style={contactText}>
                📞 Téléphone : {hotelSettings.phone}
              </Text>
            )}
            
            {hotelSettings?.email && (
              <Text style={contactText}>
                ✉️ Email : <Link href={`mailto:${hotelSettings.email}`} style={link}>
                  {hotelSettings.email}
                </Link>
              </Text>
            )}
            
            {hotelSettings?.website && (
              <Text style={contactText}>
                🌐 Site web : <Link href={hotelSettings.website} style={link} target="_blank">
                  {hotelSettings.website}
                </Link>
              </Text>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Merci de votre confiance,<br />
              L'équipe {hotelSettings?.name || 'AfricaSuite Hotel'}
            </Text>
            <Hr style={separator} />
            <Text style={disclaimerText}>
              Cet email a été généré automatiquement. Veuillez ne pas répondre directement à cet email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReservationConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
  borderBottom: '1px solid #e2e8f0',
};

const logo = {
  margin: '0 auto 16px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const headerText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
};

const actionBanner = {
  padding: '16px',
  textAlign: 'center' as const,
  margin: '0 24px 32px',
  borderRadius: '8px',
};

const actionText = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const section = {
  padding: '0 24px 24px',
};

const detailsSection = {
  padding: '0 24px 32px',
  backgroundColor: '#f8fafc',
  margin: '0 24px 24px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const contactSection = {
  padding: '24px',
  backgroundColor: '#f1f5f9',
  margin: '0 24px 24px',
  borderRadius: '8px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const customMessageStyle = {
  backgroundColor: '#fef3c7',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #f59e0b',
  borderLeft: '4px solid #f59e0b',
};

const detailRow = {
  marginBottom: '12px',
};

const detailLabel = {
  width: '40%',
  verticalAlign: 'top' as const,
};

const detailValue = {
  width: '60%',
};

const labelText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
};

const valueText = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
};

const contactText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const separator = {
  borderTop: '1px solid #e5e7eb',
  margin: '16px 0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const disclaimerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};