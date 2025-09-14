-- Create fiscal archives table for NF525 compliance
CREATE TABLE public.fiscal_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  archive_date DATE NOT NULL,
  archive_type TEXT NOT NULL CHECK (archive_type IN ('daily', 'monthly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Archive content and metadata
  archive_data JSONB NOT NULL DEFAULT '{}',
  hash_signature TEXT NOT NULL,
  certificate_number TEXT NOT NULL,
  
  -- NF525 specific fields
  software_version TEXT NOT NULL,
  certification_number TEXT NOT NULL DEFAULT 'NF525-2024',
  digital_signature TEXT NOT NULL,
  
  -- Archive file info
  file_size_bytes BIGINT,
  file_path TEXT,
  cloud_backup_url TEXT,
  usb_export_path TEXT,
  
  -- Status and validation
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'archived', 'exported', 'error')),
  validation_errors JSONB DEFAULT '[]',
  is_sealed BOOLEAN NOT NULL DEFAULT false,
  
  -- Audit trail
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sealed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(org_id, archive_date, archive_type)
);

-- Create fiscal archive entries table for detailed records
CREATE TABLE public.fiscal_archive_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archive_id UUID NOT NULL REFERENCES public.fiscal_archives(id) ON DELETE CASCADE,
  
  -- Entry identification
  entry_type TEXT NOT NULL CHECK (entry_type IN ('sale', 'payment', 'refund', 'cancellation', 'discount', 'tax')),
  reference_id UUID, -- Links to original transaction
  reference_number TEXT,
  
  -- Transaction data
  transaction_data JSONB NOT NULL DEFAULT '{}',
  amount NUMERIC(15,2),
  tax_amount NUMERIC(15,2),
  currency_code TEXT NOT NULL DEFAULT 'XOF',
  
  -- Timestamps
  transaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Hash chain for integrity
  entry_hash TEXT NOT NULL,
  previous_hash TEXT
);

-- Create fiscal compliance logs table
CREATE TABLE public.fiscal_compliance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  
  -- Compliance event details
  event_type TEXT NOT NULL CHECK (event_type IN ('archive_created', 'export_usb', 'export_cloud', 'certification_renewed', 'audit_trail', 'integrity_check')),
  event_description TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  -- Related archive
  archive_id UUID REFERENCES public.fiscal_archives(id),
  
  -- Compliance status
  compliance_status TEXT NOT NULL DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'warning', 'non_compliant')),
  compliance_notes TEXT,
  
  -- Audit information
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_fiscal_archive_entries_archive_id ON public.fiscal_archive_entries(archive_id);
CREATE INDEX idx_fiscal_archive_entries_type ON public.fiscal_archive_entries(entry_type);
CREATE INDEX idx_fiscal_archive_entries_timestamp ON public.fiscal_archive_entries(transaction_timestamp);
CREATE INDEX idx_fiscal_compliance_logs_org_id ON public.fiscal_compliance_logs(org_id);
CREATE INDEX idx_fiscal_compliance_logs_event_type ON public.fiscal_compliance_logs(event_type);

-- Enable RLS
ALTER TABLE public.fiscal_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_archive_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_compliance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fiscal_archives
CREATE POLICY "Users can manage fiscal archives for their org"
ON public.fiscal_archives
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for fiscal_archive_entries
CREATE POLICY "Users can manage fiscal archive entries for their org"
ON public.fiscal_archive_entries
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.fiscal_archives fa 
  WHERE fa.id = fiscal_archive_entries.archive_id 
  AND fa.org_id = get_current_user_org_id()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.fiscal_archives fa 
  WHERE fa.id = fiscal_archive_entries.archive_id 
  AND fa.org_id = get_current_user_org_id()
));

-- RLS Policies for fiscal_compliance_logs
CREATE POLICY "Users can manage fiscal compliance logs for their org"
ON public.fiscal_compliance_logs
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Function to generate fiscal archive
CREATE OR REPLACE FUNCTION public.generate_fiscal_archive(
  p_org_id UUID,
  p_archive_type TEXT,
  p_period_start DATE,
  p_period_end DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_archive_id UUID;
  v_certificate_number TEXT;
  v_hash_signature TEXT;
  v_digital_signature TEXT;
  v_archive_data JSONB;
BEGIN
  -- Generate certificate number
  v_certificate_number := 'NF525-' || to_char(now(), 'YYYY') || '-' || p_org_id || '-' || extract(epoch from now());
  
  -- Collect archive data
  SELECT jsonb_build_object(
    'orders', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', po.id,
          'order_number', po.order_number,
          'total_amount', po.total_amount,
          'tax_amount', po.tax_amount,
          'status', po.status,
          'created_at', po.created_at
        )
      ), '[]'::jsonb)
      FROM public.pos_orders po
      WHERE po.org_id = p_org_id
      AND DATE(po.created_at) BETWEEN p_period_start AND p_period_end
    ),
    'payments', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', pt.id,
          'amount', pt.amount,
          'payment_method', pt.payment_method,
          'created_at', pt.created_at
        )
      ), '[]'::jsonb)
      FROM public.payment_transactions pt
      WHERE pt.org_id = p_org_id
      AND DATE(pt.created_at) BETWEEN p_period_start AND p_period_end
    )
  ) INTO v_archive_data;
  
  -- Generate hash signature
  v_hash_signature := encode(sha256(v_archive_data::text::bytea), 'hex');
  
  -- Generate digital signature (simplified for demo)
  v_digital_signature := encode(sha256((v_hash_signature || v_certificate_number)::bytea), 'hex');
  
  -- Create archive record
  INSERT INTO public.fiscal_archives (
    org_id,
    archive_date,
    archive_type,
    period_start,
    period_end,
    archive_data,
    hash_signature,
    certificate_number,
    software_version,
    digital_signature,
    status,
    created_by
  ) VALUES (
    p_org_id,
    CURRENT_DATE,
    p_archive_type,
    p_period_start,
    p_period_end,
    v_archive_data,
    v_hash_signature,
    v_certificate_number,
    'POS-V1.0.0',
    v_digital_signature,
    'processed',
    auth.uid()
  ) RETURNING id INTO v_archive_id;
  
  -- Log compliance event
  INSERT INTO public.fiscal_compliance_logs (
    org_id,
    event_type,
    event_description,
    archive_id,
    performed_by
  ) VALUES (
    p_org_id,
    'archive_created',
    'Fiscal archive created for period ' || p_period_start || ' to ' || p_period_end,
    v_archive_id,
    auth.uid()
  );
  
  RETURN v_archive_id;
END;
$$;