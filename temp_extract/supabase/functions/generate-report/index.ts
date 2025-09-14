import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportGenerationRequest {
  templateId: string;
  orgId: string;
  manual?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ReportData {
  template: {
    name: string;
    type: string;
    sections: any[];
  };
  data: {
    period: { start: Date; end: Date };
    kpis: any;
    charts: any;
    tables: any;
  };
  metadata: {
    generatedAt: Date;
    generatedBy: string;
    orgId: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { templateId, orgId, manual = false, dateRange }: ReportGenerationRequest = await req.json();

    console.log(`Starting report generation for template ${templateId}, org ${orgId}`);

    // 1. Fetch template configuration
    const template = await fetchTemplate(templateId, orgId);
    if (!template) {
      throw new Error('Template not found');
    }

    // 2. Calculate date range
    const period = calculatePeriod(template.frequency, dateRange);

    // 3. Fetch analytics data
    const analyticsData = await fetchAnalyticsData(orgId, period);

    // 4. Generate report data structure
    const reportData: ReportData = {
      template,
      data: {
        period,
        ...analyticsData
      },
      metadata: {
        generatedAt: new Date(),
        generatedBy: manual ? 'manual' : 'scheduled',
        orgId
      }
    };

    // 5. Generate PDF
    const pdfBuffer = await generatePDF(reportData);

    // 6. Store PDF file (in a real implementation, this would save to storage)
    const fileName = `${template.name.replace(/\s+/g, '-').toLowerCase()}-${period.start.toISOString().split('T')[0]}.pdf`;
    const filePath = `/reports/${fileName}`;

    // 7. Send emails if recipients are configured
    let emailsSent = 0;
    if (template.recipients && template.recipients.length > 0) {
      emailsSent = await sendReportEmails(template, filePath, pdfBuffer, reportData);
    }

    // 8. Log generation record
    const generationRecord = {
      id: crypto.randomUUID(),
      templateId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      filePath,
      emailsSent,
      manual
    };

    console.log(`Report generation completed: ${fileName}, ${emailsSent} emails sent`);

    return new Response(JSON.stringify({
      success: true,
      generation: generationRecord,
      downloadUrl: filePath
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });
  }
});

async function fetchTemplate(templateId: string, orgId: string) {
  // Mock template for now - in real implementation, fetch from database
  return {
    id: templateId,
    name: 'Rapport d\'occupation quotidien',
    type: 'occupancy',
    frequency: 'daily',
    sections: [
      { type: 'kpis', title: 'Indicateurs clés', config: { metrics: ['occupancy', 'adr', 'revpar'] } },
      { type: 'chart', title: 'Évolution occupation', config: { chartType: 'line', dataSource: 'occupancy' } }
    ],
    recipients: ['manager@hotel.com', 'director@hotel.com']
  };
}

function calculatePeriod(frequency: string, customRange?: { start: string; end: string }) {
  if (customRange) {
    return {
      start: new Date(customRange.start),
      end: new Date(customRange.end)
    };
  }

  const end = new Date();
  let start: Date;

  switch (frequency) {
    case 'daily':
      start = new Date(end);
      start.setDate(start.getDate() - 1);
      break;
    case 'weekly':
      start = new Date(end);
      start.setDate(start.getDate() - 7);
      break;
    case 'monthly':
      start = new Date(end);
      start.setMonth(start.getMonth() - 1);
      break;
    default:
      start = new Date(end);
      start.setDate(start.getDate() - 1);
  }

  return { start, end };
}

async function fetchAnalyticsData(orgId: string, period: { start: Date; end: Date }) {
  // Mock analytics data - in real implementation, this would query the database
  return {
    kpis: {
      occupancyRate: 75.5,
      adr: 85000,
      revpar: 64125,
      totalRevenue: 1285000,
      totalReservations: 24
    },
    charts: {
      occupancy: [
        { date: period.start.toISOString().split('T')[0], rate: 72 },
        { date: period.end.toISOString().split('T')[0], rate: 79 }
      ],
      revenue: [
        { date: period.start.toISOString().split('T')[0], amount: 620000 },
        { date: period.end.toISOString().split('T')[0], amount: 665000 }
      ]
    },
    tables: {
      topRooms: [
        { room: '101', revenue: 125000, nights: 2 },
        { room: '205', revenue: 98000, nights: 1 }
      ]
    }
  };
}

async function generatePDF(reportData: ReportData): Promise<Uint8Array> {
  // Mock PDF generation - in real implementation, use a PDF library
  console.log('Generating PDF for report:', reportData.template.name);
  
  // Simple mock PDF content
  const pdfContent = `
    %PDF-1.4
    1 0 obj
    <<
    /Type /Catalog
    /Pages 2 0 R
    >>
    endobj
    
    2 0 obj
    <<
    /Type /Pages
    /Kids [3 0 R]
    /Count 1
    >>
    endobj
    
    3 0 obj
    <<
    /Type /Page
    /Parent 2 0 R
    /MediaBox [0 0 612 792]
    /Contents 4 0 R
    >>
    endobj
    
    4 0 obj
    <<
    /Length 55
    >>
    stream
    BT
    /F1 12 Tf
    72 720 Td
    (${reportData.template.name}) Tj
    ET
    endstream
    endobj
    
    xref
    0 5
    0000000000 65535 f 
    0000000009 00000 n 
    0000000058 00000 n 
    0000000115 00000 n 
    0000000203 00000 n 
    trailer
    <<
    /Size 5
    /Root 1 0 R
    >>
    startxref
    309
    %%EOF
  `;
  
  return new TextEncoder().encode(pdfContent);
}

async function sendReportEmails(template: any, filePath: string, pdfBuffer: Uint8Array, reportData: ReportData): Promise<number> {
  console.log(`Sending report emails to ${template.recipients.length} recipients`);
  
  // Mock email sending - in real implementation, use Resend API
  for (const recipient of template.recipients) {
    console.log(`Sending email to: ${recipient}`);
    // await resend.emails.send({...})
  }
  
  return template.recipients.length;
}