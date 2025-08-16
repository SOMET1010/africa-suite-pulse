import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

function getSecureCorsHeaders(request: Request): Record<string, string> {
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://app.africasuite.com').split(',');
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.africasuite.com';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

interface TariffCalculationRequest {
  orgId: string;
  roomType: string;
  dateArrival: string;
  dateDeparture: string;
  adults: number;
  children: number;
  promotionCode?: string;
  guestType?: 'individual' | 'corporate' | 'group';
  allotmentId?: string;
  specialRates?: {
    isWeekend?: boolean;
    isHoliday?: boolean;
    seasonCode?: string;
  };
}

interface TariffCalculationResponse {
  success: boolean;
  calculation: {
    baseRate: number;
    totalRate: number;
    nights: number;
    averagePerNight: number;
    breakdown: Array<{
      date: string;
      rate: number;
      rateType: string;
      specialRate?: boolean;
      reason?: string;
    }>;
    discounts?: Array<{
      type: string;
      code?: string;
      amount: number;
      percentage?: number;
      reason: string;
    }>;
    taxes?: Array<{
      type: string;
      rate: number;
      amount: number;
    }>;
    appliedTariff?: {
      id: string;
      code: string;
      label: string;
      baseRate: number;
    };
    appliedPromotion?: {
      id: string;
      code: string;
      label: string;
      discountType: string;
      discountValue: number;
    };
  };
  recommendations?: Array<{
    type: 'upgrade' | 'package' | 'addon';
    title: string;
    description: string;
    additionalCost: number;
  }>;
  warnings?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: TariffCalculationRequest = await req.json();
    const { 
      orgId, 
      roomType, 
      dateArrival, 
      dateDeparture, 
      adults, 
      children, 
      promotionCode,
      guestType = 'individual',
      allotmentId,
      specialRates = {}
    } = request;

    // Calculate number of nights
    const arrivalDate = new Date(dateArrival);
    const departureDate = new Date(dateDeparture);
    const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid date range - departure must be after arrival" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let baseRate = 50000; // Default base rate in F CFA
    let appliedTariff = null;
    let appliedPromotion = null;
    let discounts: any[] = [];
    let warnings: string[] = [];

    // 1. Find applicable tariffs
    const { data: tariffs } = await supabase
      .from('tariffs')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .contains('room_types', [roomType])
      .lte('valid_from', dateArrival)
      .gte('valid_until', dateDeparture)
      .order('base_rate', { ascending: false });

    // Apply best matching tariff
    if (tariffs && tariffs.length > 0) {
      let selectedTariff = tariffs[0];

      // Filter by guest type if specified
      if (guestType) {
        const guestTypeTariffs = tariffs.filter(t => 
          !t.client_type || t.client_type === guestType
        );
        if (guestTypeTariffs.length > 0) {
          selectedTariff = guestTypeTariffs[0];
        }
      }

      // Check min/max nights constraints
      if (selectedTariff.min_nights && nights < selectedTariff.min_nights) {
        warnings.push(`Séjour minimum requis: ${selectedTariff.min_nights} nuits`);
      }
      if (selectedTariff.max_nights && nights > selectedTariff.max_nights) {
        warnings.push(`Séjour maximum autorisé: ${selectedTariff.max_nights} nuits`);
      }

      baseRate = selectedTariff.base_rate;
      appliedTariff = {
        id: selectedTariff.id,
        code: selectedTariff.code,
        label: selectedTariff.label,
        baseRate: selectedTariff.base_rate
      };
    }

    // 2. Apply allotment pricing if specified
    if (allotmentId) {
      const { data: allotment } = await supabase
        .from('allotments')
        .select('*')
        .eq('id', allotmentId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .single();

      if (allotment && allotment.rate_per_night) {
        if (allotment.remaining_units > 0) {
          baseRate = allotment.rate_per_night;
          appliedTariff = {
            id: allotment.id,
            code: allotment.code,
            label: `Allotement ${allotment.partner_name}`,
            baseRate: allotment.rate_per_night
          };
        } else {
          warnings.push("Allotement épuisé - tarif standard appliqué");
        }
      }
    }

    // 3. Generate daily breakdown with special rates
    const breakdown = [];
    let totalBeforeDiscounts = 0;

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(arrivalDate);
      currentDate.setDate(arrivalDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      let dailyRate = baseRate;
      let rateType = 'standard';
      let specialRate = false;
      let reason = '';

      // Weekend premium (Friday/Saturday = +20%)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        dailyRate = Math.round(baseRate * 1.2);
        rateType = 'weekend';
        specialRate = true;
        reason = 'Tarif week-end (+20%)';
      }

      // Holiday premium (holidays = +30%)
      if (specialRates.isHoliday) {
        dailyRate = Math.round(baseRate * 1.3);
        rateType = 'holiday';
        specialRate = true;
        reason = 'Tarif jour férié (+30%)';
      }

      // Seasonal adjustments
      if (specialRates.seasonCode) {
        switch (specialRates.seasonCode) {
          case 'high':
            dailyRate = Math.round(dailyRate * 1.5);
            rateType = 'high_season';
            specialRate = true;
            reason = 'Haute saison (+50%)';
            break;
          case 'low':
            dailyRate = Math.round(dailyRate * 0.8);
            rateType = 'low_season';
            specialRate = true;
            reason = 'Basse saison (-20%)';
            break;
        }
      }

      breakdown.push({
        date: dateStr,
        rate: dailyRate,
        rateType,
        specialRate,
        reason: reason || undefined
      });

      totalBeforeDiscounts += dailyRate;
    }

    // 4. Apply promotion if provided
    if (promotionCode) {
      const { data: promotion } = await supabase
        .from('promotions')
        .select('*')
        .eq('org_id', orgId)
        .eq('code', promotionCode.toUpperCase())
        .eq('is_active', true)
        .lte('valid_from', dateArrival)
        .gte('valid_until', dateDeparture)
        .single();

      if (promotion) {
        // Check usage limit
        if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
          warnings.push("Code promo épuisé");
        } else {
          let discountAmount = 0;

          if (promotion.discount_type === 'percentage') {
            discountAmount = Math.round(totalBeforeDiscounts * (promotion.discount_value / 100));
          } else if (promotion.discount_type === 'fixed') {
            discountAmount = promotion.discount_value;
          }

          // Apply max discount limit
          if (promotion.max_discount && discountAmount > promotion.max_discount) {
            discountAmount = promotion.max_discount;
          }

          // Apply minimum amount requirement
          if (promotion.min_amount && totalBeforeDiscounts < promotion.min_amount) {
            warnings.push(`Montant minimum requis pour cette promotion: ${promotion.min_amount.toLocaleString()} F CFA`);
          } else {
            discounts.push({
              type: 'promotion',
              code: promotionCode,
              amount: discountAmount,
              percentage: promotion.discount_type === 'percentage' ? promotion.discount_value : undefined,
              reason: promotion.label
            });

            appliedPromotion = {
              id: promotion.id,
              code: promotion.code,
              label: promotion.label,
              discountType: promotion.discount_type,
              discountValue: promotion.discount_value
            };
          }
        }
      } else {
        warnings.push("Code promo invalide ou expiré");
      }
    }

    // 5. Apply automatic discounts
    // Long stay discount (7+ nights = -10%)
    if (nights >= 7) {
      const longStayDiscount = Math.round(totalBeforeDiscounts * 0.1);
      discounts.push({
        type: 'long_stay',
        amount: longStayDiscount,
        percentage: 10,
        reason: 'Remise séjour long (7+ nuits)'
      });
    }

    // Group discount (4+ adults = -5%)
    if (adults >= 4) {
      const groupDiscount = Math.round(totalBeforeDiscounts * 0.05);
      discounts.push({
        type: 'group',
        amount: groupDiscount,
        percentage: 5,
        reason: 'Remise groupe (4+ adultes)'
      });
    }

    // 6. Calculate taxes (18% VAT)
    const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const subtotal = totalBeforeDiscounts - totalDiscounts;
    const vatAmount = Math.round(subtotal * 0.18);
    
    const taxes = [{
      type: 'VAT',
      rate: 18,
      amount: vatAmount
    }];

    // 7. Final calculation
    const totalRate = subtotal + vatAmount;
    const averagePerNight = Math.round(totalRate / nights);

    // 8. Generate recommendations
    const recommendations = [];
    
    // Upgrade recommendation
    if (roomType === 'STD') {
      recommendations.push({
        type: 'upgrade' as const,
        title: 'Surclassement Supérieure',
        description: 'Profitez d\'une chambre plus spacieuse avec vue',
        additionalCost: 15000
      });
    }

    // Package recommendations
    if (!specialRates.seasonCode) {
      recommendations.push({
        type: 'package' as const,
        title: 'Forfait Petit-déjeuner',
        description: 'Petit-déjeuner continental inclus',
        additionalCost: 5000 * nights
      });
    }

    const result: TariffCalculationResponse = {
      success: true,
      calculation: {
        baseRate,
        totalRate,
        nights,
        averagePerNight,
        breakdown,
        discounts: discounts.length > 0 ? discounts : undefined,
        taxes,
        appliedTariff: appliedTariff || undefined,
        appliedPromotion: appliedPromotion || undefined
      },
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };

    console.log("Tariff calculation completed:", {
      orgId,
      roomType,
      nights,
      baseRate,
      totalRate,
      discountsApplied: discounts.length,
      warningsCount: warnings.length
    });

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in calculate-tariff function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);