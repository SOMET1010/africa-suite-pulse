-- Create subscription plans and pricing tiers
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  currency_code TEXT NOT NULL DEFAULT 'EUR',
  max_rooms INTEGER,
  max_users INTEGER,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization subscriptions
CREATE TABLE public.organization_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_end TIMESTAMP WITH TIME ZONE,
  setup_fee_paid BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- Create subscription usage tracking
CREATE TABLE public.subscription_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  subscription_id UUID NOT NULL REFERENCES public.organization_subscriptions(id),
  metric_name TEXT NOT NULL, -- 'rooms', 'users', 'transactions', 'api_calls'
  metric_value INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, max_rooms, max_users, features) VALUES
('Starter', 'starter', 'Parfait pour les petits hôtels et guesthouses', 49.00, 490.00, 50, 5, '{"pms": true, "basic_reports": true, "email_support": true}'),
('Business', 'business', 'Solution complète pour hôtels moyens avec POS intégré', 149.00, 1490.00, 300, 15, '{"pms": true, "pos": true, "advanced_reports": true, "phone_support": true, "inventory": true}'),
('Enterprise', 'enterprise', 'Solution premium pour chaînes et grands hôtels', 299.00, 2990.00, null, null, '{"pms": true, "pos": true, "advanced_reports": true, "priority_support": true, "inventory": true, "api_access": true, "multi_property": true, "custom_integrations": true}');

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Subscription plans are publicly viewable" 
ON public.subscription_plans FOR SELECT 
USING (is_active = true);

-- RLS Policies for organization_subscriptions
CREATE POLICY "Users can view their org subscription" 
ON public.organization_subscriptions FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Managers can update org subscription" 
ON public.organization_subscriptions FOR UPDATE 
USING (org_id = get_current_user_org_id() AND has_role(auth.uid(), 'manager'));

-- RLS Policies for subscription_usage
CREATE POLICY "Users can view their org usage" 
ON public.subscription_usage FOR SELECT 
USING (org_id = get_current_user_org_id());

-- Create indexes
CREATE INDEX idx_org_subscriptions_org_id ON public.organization_subscriptions(org_id);
CREATE INDEX idx_subscription_usage_org_id ON public.subscription_usage(org_id);
CREATE INDEX idx_subscription_usage_period ON public.subscription_usage(period_start, period_end);

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_subscriptions_updated_at
  BEFORE UPDATE ON public.organization_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at
  BEFORE UPDATE ON public.subscription_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();