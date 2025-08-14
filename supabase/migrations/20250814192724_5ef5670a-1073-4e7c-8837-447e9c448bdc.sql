-- Create customer accounts table
CREATE TABLE public.pos_customer_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  customer_code TEXT NOT NULL,
  name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'blocked', 'suspended')),
  credit_limit_type TEXT NOT NULL DEFAULT 'unlimited' CHECK (credit_limit_type IN ('unlimited', 'limited', 'blocked')),
  credit_limit NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  loyalty_card_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(org_id, customer_code)
);

-- Create customer invoices table
CREATE TABLE public.pos_customer_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  customer_account_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'cancelled')),
  order_data JSONB NOT NULL DEFAULT '{}',
  table_number TEXT,
  server_id UUID,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, invoice_number)
);

-- Create customer payments table
CREATE TABLE public.pos_customer_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  customer_account_id UUID NOT NULL,
  invoice_id UUID,
  payment_reference TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  is_partial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create customer statements table for monthly compression
CREATE TABLE public.pos_customer_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  customer_account_id UUID NOT NULL,
  statement_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  closing_balance NUMERIC NOT NULL DEFAULT 0,
  total_invoices NUMERIC NOT NULL DEFAULT 0,
  total_payments NUMERIC NOT NULL DEFAULT 0,
  statement_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(org_id, customer_account_id, statement_date)
);

-- Enable RLS
ALTER TABLE public.pos_customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_customer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_customer_statements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage customer accounts for their org"
ON public.pos_customer_accounts FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage customer invoices for their org"
ON public.pos_customer_invoices FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage customer payments for their org"
ON public.pos_customer_payments FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage customer statements for their org"
ON public.pos_customer_statements FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Add foreign key constraints
ALTER TABLE public.pos_customer_invoices 
ADD CONSTRAINT fk_customer_invoices_account 
FOREIGN KEY (customer_account_id) REFERENCES public.pos_customer_accounts(id) ON DELETE CASCADE;

ALTER TABLE public.pos_customer_payments 
ADD CONSTRAINT fk_customer_payments_account 
FOREIGN KEY (customer_account_id) REFERENCES public.pos_customer_accounts(id) ON DELETE CASCADE;

ALTER TABLE public.pos_customer_payments 
ADD CONSTRAINT fk_customer_payments_invoice 
FOREIGN KEY (invoice_id) REFERENCES public.pos_customer_invoices(id) ON DELETE SET NULL;

ALTER TABLE public.pos_customer_statements 
ADD CONSTRAINT fk_customer_statements_account 
FOREIGN KEY (customer_account_id) REFERENCES public.pos_customer_accounts(id) ON DELETE CASCADE;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pos_customer_accounts_updated_at
  BEFORE UPDATE ON public.pos_customer_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_customer_invoices_updated_at
  BEFORE UPDATE ON public.pos_customer_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate customer codes
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  formatted_code TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM pos_customer_accounts
  WHERE org_id = NEW.org_id
  AND customer_code ~ '^CUST-[0-9]+$';
  
  formatted_code := 'CUST-' || LPAD(next_number::TEXT, 6, '0');
  NEW.customer_code := formatted_code;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_pos_customer_code
  BEFORE INSERT ON public.pos_customer_accounts
  FOR EACH ROW
  WHEN (NEW.customer_code IS NULL OR NEW.customer_code = '')
  EXECUTE FUNCTION public.generate_customer_code();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_customer_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM pos_customer_invoices
  WHERE org_id = NEW.org_id
  AND invoice_number ~ '^INV-[0-9]+$';
  
  formatted_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  NEW.invoice_number := formatted_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_pos_customer_invoice_number
  BEFORE INSERT ON public.pos_customer_invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION public.generate_customer_invoice_number();

-- Function to update customer balance
CREATE OR REPLACE FUNCTION public.update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - OLD.total_amount + NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + OLD.amount - NEW.amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - OLD.total_amount,
          updated_at = now()
      WHERE id = OLD.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + OLD.amount,
          updated_at = now()
      WHERE id = OLD.customer_account_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_balance_on_invoice
  AFTER INSERT OR UPDATE OR DELETE ON public.pos_customer_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_balance();

CREATE TRIGGER update_customer_balance_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON public.pos_customer_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_balance();