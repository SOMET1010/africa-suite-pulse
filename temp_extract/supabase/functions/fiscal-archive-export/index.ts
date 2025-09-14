import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  archiveId: string;
  exportType: 'usb' | 'cloud';
  format: 'json' | 'xml' | 'csv';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { archiveId, exportType, format }: ExportRequest = await req.json();

    // Get archive data
    const { data: archive, error: archiveError } = await supabaseClient
      .from('fiscal_archives')
      .select('*')
      .eq('id', archiveId)
      .single();

    if (archiveError) {
      throw new Error(`Failed to fetch archive: ${archiveError.message}`);
    }

    // Get archive entries
    const { data: entries, error: entriesError } = await supabaseClient
      .from('fiscal_archive_entries')
      .select('*')
      .eq('archive_id', archiveId)
      .order('transaction_timestamp');

    if (entriesError) {
      throw new Error(`Failed to fetch entries: ${entriesError.message}`);
    }

    // Prepare export data with NF525 compliance
    const exportData = {
      archive: {
        id: archive.id,
        certificate_number: archive.certificate_number,
        digital_signature: archive.digital_signature,
        period: {
          start: archive.period_start,
          end: archive.period_end
        },
        compliance: {
          software_version: archive.software_version,
          certification_number: archive.certification_number,
          hash_signature: archive.hash_signature
        }
      },
      entries: entries || [],
      metadata: {
        export_timestamp: new Date().toISOString(),
        export_type: exportType,
        format: format,
        total_entries: entries?.length || 0,
        integrity_check: generateIntegrityCheck(archive, entries || [])
      }
    };

    let responseData: string;
    let contentType: string;
    let fileName: string;

    // Format data based on requested format
    switch (format) {
      case 'xml':
        responseData = generateXMLExport(exportData);
        contentType = 'application/xml';
        fileName = `fiscal_archive_${archive.certificate_number}.xml`;
        break;
      case 'csv':
        responseData = generateCSVExport(exportData);
        contentType = 'text/csv';
        fileName = `fiscal_archive_${archive.certificate_number}.csv`;
        break;
      default:
        responseData = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        fileName = `fiscal_archive_${archive.certificate_number}.json`;
    }

    // Log export event
    await supabaseClient
      .from('fiscal_compliance_logs')
      .insert({
        org_id: archive.org_id,
        event_type: exportType === 'usb' ? 'export_usb' : 'export_cloud',
        event_description: `Fiscal archive exported in ${format.toUpperCase()} format`,
        archive_id: archiveId,
        event_data: {
          export_type: exportType,
          format: format,
          file_size: new Blob([responseData]).size
        }
      });

    // Update archive status
    await supabaseClient
      .from('fiscal_archives')
      .update({
        status: 'exported',
        file_size_bytes: new Blob([responseData]).size,
        [exportType === 'usb' ? 'usb_export_path' : 'cloud_backup_url']: fileName
      })
      .eq('id', archiveId);

    return new Response(responseData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Archive-ID': archiveId,
        'X-Digital-Signature': archive.digital_signature
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateIntegrityCheck(archive: any, entries: any[]): string {
  const data = JSON.stringify({
    certificate: archive.certificate_number,
    hash: archive.hash_signature,
    entries_count: entries.length,
    total_amount: entries.reduce((sum, entry) => sum + (entry.amount || 0), 0)
  });
  
  return btoa(data); // Base64 encoded integrity check
}

function generateXMLExport(data: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<FiscalArchive xmlns="http://nf525.gouv.fr/archive" version="1.0">
  <Archive>
    <ID>${data.archive.id}</ID>
    <CertificateNumber>${data.archive.certificate_number}</CertificateNumber>
    <DigitalSignature>${data.archive.digital_signature}</DigitalSignature>
    <Period>
      <Start>${data.archive.period.start}</Start>
      <End>${data.archive.period.end}</End>
    </Period>
    <Compliance>
      <SoftwareVersion>${data.archive.compliance.software_version}</SoftwareVersion>
      <CertificationNumber>${data.archive.compliance.certification_number}</CertificationNumber>
      <HashSignature>${data.archive.compliance.hash_signature}</HashSignature>
    </Compliance>
  </Archive>
  <Entries>
    ${data.entries.map((entry: any) => `
    <Entry>
      <ID>${entry.id}</ID>
      <Type>${entry.entry_type}</Type>
      <Amount>${entry.amount || 0}</Amount>
      <TaxAmount>${entry.tax_amount || 0}</TaxAmount>
      <Currency>${entry.currency_code}</Currency>
      <Timestamp>${entry.transaction_timestamp}</Timestamp>
      <Hash>${entry.entry_hash}</Hash>
    </Entry>`).join('')}
  </Entries>
  <Metadata>
    <ExportTimestamp>${data.metadata.export_timestamp}</ExportTimestamp>
    <TotalEntries>${data.metadata.total_entries}</TotalEntries>
    <IntegrityCheck>${data.metadata.integrity_check}</IntegrityCheck>
  </Metadata>
</FiscalArchive>`;
}

function generateCSVExport(data: any): string {
  const headers = [
    'ID', 'Type', 'Amount', 'TaxAmount', 'Currency', 'Timestamp', 'ReferenceNumber', 'Hash'
  ];
  
  const rows = data.entries.map((entry: any) => [
    entry.id,
    entry.entry_type,
    entry.amount || 0,
    entry.tax_amount || 0,
    entry.currency_code,
    entry.transaction_timestamp,
    entry.reference_number || '',
    entry.entry_hash
  ]);

  return [
    `# Fiscal Archive Export - Certificate: ${data.archive.certificate_number}`,
    `# Period: ${data.archive.period.start} to ${data.archive.period.end}`,
    `# Digital Signature: ${data.archive.digital_signature}`,
    `# Export Date: ${data.metadata.export_timestamp}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}