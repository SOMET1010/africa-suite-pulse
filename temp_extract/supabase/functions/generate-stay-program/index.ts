import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StayProgramRequest {
  reservationId: string;
  includeServices?: boolean;
  template?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reservationId, includeServices = true, template = 'default' }: StayProgramRequest = await req.json();

    console.log('Generating stay program for reservation:', reservationId);

    // Fetch reservation details
    const { data: reservation, error: resError } = await supabase
      .from('reservations_with_details')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (resError || !reservation) {
      throw new Error(`Reservation not found: ${resError?.message}`);
    }

    // Fetch hotel settings
    const { data: hotelSettings, error: hotelError } = await supabase
      .from('hotel_settings')
      .select('*')
      .eq('org_id', reservation.org_id)
      .single();

    if (hotelError) {
      console.warn('Hotel settings not found, using defaults');
    }

    // Fetch available services if requested
    let services = [];
    if (includeServices) {
      const { data: servicesData } = await supabase
        .from('services_with_family')
        .select('*')
        .eq('org_id', reservation.org_id)
        .eq('is_active', true)
        .order('family_label', { ascending: true })
        .order('label', { ascending: true });
      
      services = servicesData || [];
    }

    // Generate stay program HTML
    const programHTML = generateStayProgramHTML(reservation, hotelSettings, services);

    // Convert to base64 (simulating PDF generation)
    const pdfData = btoa(programHTML);

    // Log the generation
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: reservationId,
        org_id: reservation.org_id,
        action_type: 'stay_program_generated',
        action_description: `Stay program generated (template: ${template}, services: ${includeServices})`,
        new_values: { 
          template, 
          include_services: includeServices,
          services_count: services.length,
          generated_at: new Date().toISOString() 
        }
      });

    console.log('Stay program generated successfully');

    return new Response(JSON.stringify({
      success: true,
      pdf_data: pdfData,
      filename: `programme_sejour_${reservation.reference || reservationId}.pdf`,
      reservation_id: reservationId,
      services_included: includeServices,
      services_count: services.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating stay program:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

function generateStayProgramHTML(reservation: any, hotelSettings: any, services: any[]): string {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: hotelSettings?.currency || 'XOF'
    }).format(amount);
  };

  const hotelName = hotelSettings?.name || 'AfricaSuite Hotel';
  const hotelAddress = hotelSettings?.address || '';
  const hotelCity = hotelSettings?.city || '';
  const hotelPhone = hotelSettings?.phone || '';
  const hotelEmail = hotelSettings?.email || '';

  // Group services by family
  const servicesByFamily = services.reduce((acc, service) => {
    const family = service.family_label || 'Autres';
    if (!acc[family]) acc[family] = [];
    acc[family].push(service);
    return acc;
  }, {} as Record<string, any[]>);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Programme de Séjour - ${reservation.guest_name}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .hotel-name {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .welcome-message {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 5px;
        }
        .content {
          padding: 40px 30px;
        }
        .guest-info {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 30px;
          border-left: 5px solid #667eea;
        }
        .section-title {
          font-size: 22px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: 600;
          color: #555;
        }
        .info-value {
          color: #333;
          font-weight: 500;
        }
        .services-section {
          margin: 30px 0;
        }
        .service-family {
          margin-bottom: 25px;
          background: #fafbfc;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }
        .family-title {
          font-size: 18px;
          font-weight: bold;
          color: #495057;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #dee2e6;
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 12px;
        }
        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }
        .service-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        .service-name {
          font-weight: 500;
          flex: 1;
        }
        .service-price {
          font-weight: bold;
          color: #667eea;
          margin-left: 10px;
        }
        .hotel-info {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .contact-item {
          text-align: center;
        }
        .contact-label {
          font-weight: bold;
          color: #667eea;
          display: block;
          margin-bottom: 5px;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #dee2e6;
        }
        .highlight {
          background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .qr-placeholder {
          width: 80px;
          height: 80px;
          background: #667eea;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-weight: bold;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="hotel-name">${hotelName}</div>
          <div class="welcome-message">Bienvenue ${reservation.guest_name}</div>
          <div>Programme de votre séjour</div>
        </div>

        <div class="content">
          <div class="guest-info">
            <div class="section-title">📋 Informations de votre séjour</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Client :</span>
                <span class="info-value">${reservation.guest_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Référence :</span>
                <span class="info-value">${reservation.reference || 'Non spécifiée'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Chambre :</span>
                <span class="info-value">${reservation.room_number || 'À assigner'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Type :</span>
                <span class="info-value">${reservation.room_type || 'Standard'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Arrivée :</span>
                <span class="info-value">${formatDate(reservation.date_arrival)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Départ :</span>
                <span class="info-value">${formatDate(reservation.date_departure)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Occupants :</span>
                <span class="info-value">${reservation.adults || 0} adulte(s), ${reservation.children || 0} enfant(s)</span>
              </div>
              <div class="info-item">
                <span class="info-label">Montant :</span>
                <span class="info-value">${reservation.rate_total ? formatCurrency(reservation.rate_total) : 'À définir'}</span>
              </div>
            </div>
          </div>

          ${Object.keys(servicesByFamily).length > 0 ? `
            <div class="services-section">
              <div class="section-title">🎯 Services disponibles</div>
              ${Object.entries(servicesByFamily).map(([family, familyServices]) => `
                <div class="service-family">
                  <div class="family-title">${family}</div>
                  <div class="service-grid">
                    ${familyServices.map(service => `
                      <div class="service-item">
                        <span class="service-name">${service.label}</span>
                        <span class="service-price">${formatCurrency(service.price)}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="highlight">
            <div class="qr-placeholder">QR</div>
            <strong>Accès rapide aux services</strong><br>
            Scannez ce QR code avec votre smartphone pour accéder<br>
            à tous nos services et informations pratiques
          </div>

          <div class="hotel-info">
            <div class="section-title">🏨 Informations de contact</div>
            <div class="contact-grid">
              ${hotelAddress ? `
                <div class="contact-item">
                  <span class="contact-label">Adresse</span>
                  <div>${hotelAddress}</div>
                  <div>${hotelCity}</div>
                </div>
              ` : ''}
              ${hotelPhone ? `
                <div class="contact-item">
                  <span class="contact-label">Téléphone</span>
                  <div>${hotelPhone}</div>
                </div>
              ` : ''}
              ${hotelEmail ? `
                <div class="contact-item">
                  <span class="contact-label">Email</span>
                  <div>${hotelEmail}</div>
                </div>
              ` : ''}
              <div class="contact-item">
                <span class="contact-label">Réception</span>
                <div>Ouverte 24h/24</div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Nous vous souhaitons un excellent séjour !</strong></p>
          <p>Document généré automatiquement par AfricaSuite PMS - ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);