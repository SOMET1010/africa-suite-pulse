import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentScanRequest {
  imageData: string; // base64 encoded image
  documentType?: 'passport' | 'id_card' | 'driving_license';
}

interface ExtractedData {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  document_expiry?: string;
  document_issuing_country?: string;
  confidence?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, documentType = 'passport' }: DocumentScanRequest = await req.json();

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to binary
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Google Cloud Vision API request
    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')}`;
    
    const visionRequest = {
      requests: [
        {
          image: {
            content: base64Data
          },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 10 },
            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
          ]
        }
      ]
    };

    console.log('Calling Google Cloud Vision API...');
    const visionResponse = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visionRequest)
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Vision API error:', errorText);
      throw new Error(`Vision API error: ${visionResponse.status} - ${errorText}`);
    }

    const visionData = await visionResponse.json();
    console.log('Vision API response received');

    if (!visionData.responses || !visionData.responses[0]) {
      throw new Error('No response from Vision API');
    }

    const response = visionData.responses[0];
    
    if (response.error) {
      throw new Error(`Vision API error: ${response.error.message}`);
    }

    // Extract text from the document
    const fullTextAnnotation = response.fullTextAnnotation;
    const detectedText = fullTextAnnotation?.text || '';
    
    console.log('Detected text:', detectedText);

    // Parse the detected text based on document type
    const extractedData = parseDocumentText(detectedText, documentType);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        rawText: detectedText,
        confidence: fullTextAnnotation?.pages?.[0]?.confidence || 0.5
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in scan-document function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to process document scan"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

function parseDocumentText(text: string, documentType: string): ExtractedData {
  const extractedData: ExtractedData = {
    document_type: documentType,
    confidence: 0.7
  };

  // Clean and normalize text
  const normalizedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (documentType === 'passport') {
    return parsePassport(normalizedText, extractedData);
  } else if (documentType === 'id_card') {
    return parseIdCard(normalizedText, extractedData);
  } else {
    return parseGenericDocument(normalizedText, extractedData);
  }
}

function parsePassport(text: string, data: ExtractedData): ExtractedData {
  // Common passport patterns
  
  // MRZ line pattern (Machine Readable Zone)
  const mrzPattern = /P<([A-Z]{3})([A-Z<]+)<<([A-Z<]+)/;
  const mrzMatch = text.match(mrzPattern);
  
  if (mrzMatch) {
    data.document_issuing_country = mrzMatch[1];
    data.last_name = mrzMatch[2].replace(/</g, '');
    data.first_name = mrzMatch[3].replace(/</g, '');
  }

  // Document number patterns
  const passportNumPattern = /(?:Passport\s*N[o°]?\s*|N[o°]\s*|Numéro\s*)\s*:?\s*([A-Z0-9]{6,9})/i;
  const passportNumMatch = text.match(passportNumPattern);
  if (passportNumMatch) {
    data.document_number = passportNumMatch[1];
  }

  // Date patterns
  const birthDatePattern = /(?:Date\s*of\s*birth|Né\s*le|Naissance)\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i;
  const birthMatch = text.match(birthDatePattern);
  if (birthMatch) {
    const day = birthMatch[1].padStart(2, '0');
    const month = birthMatch[2].padStart(2, '0');
    const year = birthMatch[3].length === 2 ? '20' + birthMatch[3] : birthMatch[3];
    data.date_of_birth = `${year}-${month}-${day}`;
  }

  // Expiry date
  const expiryPattern = /(?:Date\s*of\s*expiry|Valable\s*jusqu|Expire)\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i;
  const expiryMatch = text.match(expiryPattern);
  if (expiryMatch) {
    const day = expiryMatch[1].padStart(2, '0');
    const month = expiryMatch[2].padStart(2, '0');
    const year = expiryMatch[3].length === 2 ? '20' + expiryMatch[3] : expiryMatch[3];
    data.document_expiry = `${year}-${month}-${day}`;
  }

  // Nationality
  const nationalityPattern = /(?:Nationality|Nationalité)\s*:?\s*([A-Z\s]+)/i;
  const nationalityMatch = text.match(nationalityPattern);
  if (nationalityMatch) {
    data.nationality = nationalityMatch[1].trim();
  }

  return data;
}

function parseIdCard(text: string, data: ExtractedData): ExtractedData {
  // Name patterns for ID cards
  const namePattern = /(?:Nom|Name)\s*:?\s*([A-Z\s]+)/i;
  const nameMatch = text.match(namePattern);
  if (nameMatch) {
    const fullName = nameMatch[1].trim();
    const nameParts = fullName.split(/\s+/);
    if (nameParts.length >= 2) {
      data.last_name = nameParts[0];
      data.first_name = nameParts.slice(1).join(' ');
    }
  }

  // ID number
  const idPattern = /(?:ID|Carte|N[o°])\s*:?\s*([A-Z0-9]{8,15})/i;
  const idMatch = text.match(idPattern);
  if (idMatch) {
    data.document_number = idMatch[1];
  }

  // Birth date
  const birthPattern = /(?:Né\s*le|Date\s*de\s*naissance)\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i;
  const birthMatch = text.match(birthPattern);
  if (birthMatch) {
    const day = birthMatch[1].padStart(2, '0');
    const month = birthMatch[2].padStart(2, '0');
    const year = birthMatch[3].length === 2 ? '19' + birthMatch[3] : birthMatch[3];
    data.date_of_birth = `${year}-${month}-${day}`;
  }

  return data;
}

function parseGenericDocument(text: string, data: ExtractedData): ExtractedData {
  // Try to extract any names and dates from generic text
  
  // Look for capitalized words that might be names
  const capitalizedWords = text.match(/\b[A-Z][A-Z\s]*\b/g) || [];
  if (capitalizedWords.length >= 2) {
    data.first_name = capitalizedWords[0];
    data.last_name = capitalizedWords[1];
  }

  // Look for any date patterns
  const datePattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
  const dates = [...text.matchAll(datePattern)];
  
  if (dates.length > 0) {
    const firstDate = dates[0];
    const day = firstDate[1].padStart(2, '0');
    const month = firstDate[2].padStart(2, '0');
    const year = firstDate[3].length === 2 ? '19' + firstDate[3] : firstDate[3];
    data.date_of_birth = `${year}-${month}-${day}`;
  }

  // Look for any alphanumeric sequences that might be document numbers
  const docNumPattern = /\b[A-Z0-9]{6,12}\b/g;
  const docNumbers = text.match(docNumPattern);
  if (docNumbers && docNumbers.length > 0) {
    data.document_number = docNumbers[0];
  }

  return data;
}

serve(handler);