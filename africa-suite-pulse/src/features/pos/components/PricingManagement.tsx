import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon,
  Percent,
  DollarSign,
  Settings,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePromotionalPeriods, usePricingShifts } from "../hooks/usePricing";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PricingManagementProps {
  outletId: string;
}

export function PricingManagement({ outletId }: PricingManagementProps) {
  const [activeTab, setActiveTab] = useState("shifts");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: promotions = [] } = usePromotionalPeriods();
  const { data: shifts = [] } = usePricingShifts(outletId);

  // Pricing Shift Form State
  const [shiftForm, setShiftForm] = useState({
    name: "",
    description: "",
    price_level: 1,
    start_time: "",
    end_time: "",
    applicable_days: [1, 2, 3, 4, 5, 6, 7] as number[],
    is_active: true,
    priority: 1
  });

  // Promotion Form State
  const [promotionForm, setPromotionForm] = useState({
    name: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
    start_time: "",
    end_time: "",
    discount_type: "percentage" as "percentage" | "fixed_amount",
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: 0,
    applicable_days: [1, 2, 3, 4, 5, 6, 7] as number[],
    priority: 1
  });

  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: typeof shiftForm) => {
      const { data, error } = await supabase
        .from("pricing_shifts")
        .insert({
          ...shiftData,
          org_id: (await supabase.rpc("get_current_user_org_id")).data,
          outlet_id: outletId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-shifts"] });
      toast({
        title: "Shift de prix créé",
        description: "Le nouveau shift de prix a été créé avec succès",
      });
      setIsCreating(false);
      resetShiftForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: typeof promotionForm) => {
      const { data, error } = await supabase
        .from("promotional_periods")
        .insert({
          ...promotionData,
          org_id: (await supabase.rpc("get_current_user_org_id")).data,
          start_date: format(promotionData.start_date, "yyyy-MM-dd"),
          end_date: format(promotionData.end_date, "yyyy-MM-dd")
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotional-periods"] });
      toast({
        title: "Promotion créée",
        description: "La nouvelle promotion a été créée avec succès",
      });
      setIsCreating(false);
      resetPromotionForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetShiftForm = () => {
    setShiftForm({
      name: "",
      description: "",
      price_level: 1,
      start_time: "",
      end_time: "",
      applicable_days: [1, 2, 3, 4, 5, 6, 7],
      is_active: true,
      priority: 1
    });
  };

  const resetPromotionForm = () => {
    setPromotionForm({
      name: "",
      description: "",
      start_date: new Date(),
      end_date: new Date(),
      start_time: "",
      end_time: "",
      discount_type: "percentage",
      discount_value: 0,
      min_purchase_amount: 0,
      max_discount_amount: 0,
      applicable_days: [1, 2, 3, 4, 5, 6, 7],
      priority: 1
    });
  };

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const renderShiftsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Shifts de Prix</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les niveaux de prix selon les horaires
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Shift
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Shift de Prix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shift-name">Nom du shift</Label>
                <Input
                  id="shift-name"
                  value={shiftForm.name}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Horaire de pointe"
                />
              </div>
              <div>
                <Label htmlFor="price-level">Niveau de prix</Label>
                <Select
                  value={shiftForm.price_level.toString()}
                  onValueChange={(value) => setShiftForm(prev => ({ ...prev, price_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Niveau 1 (Normal)</SelectItem>
                    <SelectItem value="2">Niveau 2 (Élevé)</SelectItem>
                    <SelectItem value="3">Niveau 3 (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Heure de début</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={shiftForm.start_time}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Heure de fin</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={shiftForm.end_time}
                  onChange={(e) => setShiftForm(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Jours applicables</Label>
              <div className="flex gap-2 mt-2">
                {dayNames.map((day, index) => (
                  <Button
                    key={index}
                    variant={shiftForm.applicable_days.includes(index + 1) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const dayNumber = index + 1;
                      setShiftForm(prev => ({
                        ...prev,
                        applicable_days: prev.applicable_days.includes(dayNumber)
                          ? prev.applicable_days.filter(d => d !== dayNumber)
                          : [...prev.applicable_days, dayNumber]
                      }));
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={shiftForm.description}
                onChange={(e) => setShiftForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du shift de prix..."
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => createShiftMutation.mutate(shiftForm)}
                disabled={createShiftMutation.isPending}
              >
                {createShiftMutation.isPending ? "Création..." : "Créer"}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {shifts.map((shift) => (
          <Card key={shift.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{shift.name}</h4>
                  {shift.description && (
                    <p className="text-sm text-muted-foreground mt-1">{shift.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <Badge>Niveau {shift.price_level}</Badge>
                    <span>{shift.start_time} - {shift.end_time}</span>
                    <div className="flex gap-1">
                      {shift.applicable_days.map(day => (
                        <span key={day} className="text-xs bg-muted px-1 rounded">
                          {dayNames[day - 1]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={shift.is_active} />
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPromotionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Promotions</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les promotions et happy hours
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Promotion
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une Promotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-name">Nom de la promotion</Label>
                <Input
                  id="promo-name"
                  value={promotionForm.name}
                  onChange={(e) => setPromotionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Happy Hour Cocktails"
                />
              </div>
              <div>
                <Label htmlFor="discount-type">Type de remise</Label>
                <Select
                  value={promotionForm.discount_type}
                  onValueChange={(value: "percentage" | "fixed_amount") => 
                    setPromotionForm(prev => ({ ...prev, discount_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(promotionForm.start_date, "PPP", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={promotionForm.start_date}
                      onSelect={(date) => date && setPromotionForm(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(promotionForm.end_date, "PPP", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={promotionForm.end_date}
                      onSelect={(date) => date && setPromotionForm(prev => ({ ...prev, end_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discount-value">
                  Valeur {promotionForm.discount_type === 'percentage' ? '(%)' : '(FCFA)'}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  value={promotionForm.discount_value}
                  onChange={(e) => setPromotionForm(prev => ({ 
                    ...prev, 
                    discount_value: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="start-time-promo">Heure de début</Label>
                <Input
                  id="start-time-promo"
                  type="time"
                  value={promotionForm.start_time}
                  onChange={(e) => setPromotionForm(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time-promo">Heure de fin</Label>
                <Input
                  id="end-time-promo"
                  type="time"
                  value={promotionForm.end_time}
                  onChange={(e) => setPromotionForm(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Jours applicables</Label>
              <div className="flex gap-2 mt-2">
                {dayNames.map((day, index) => (
                  <Button
                    key={index}
                    variant={promotionForm.applicable_days.includes(index + 1) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const dayNumber = index + 1;
                      setPromotionForm(prev => ({
                        ...prev,
                        applicable_days: prev.applicable_days.includes(dayNumber)
                          ? prev.applicable_days.filter(d => d !== dayNumber)
                          : [...prev.applicable_days, dayNumber]
                      }));
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => createPromotionMutation.mutate(promotionForm)}
                disabled={createPromotionMutation.isPending}
              >
                {createPromotionMutation.isPending ? "Création..." : "Créer"}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {promotions.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{promo.name}</h4>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <Badge className={cn(
                      promo.discount_type === 'percentage' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    )}>
                      {promo.discount_type === 'percentage' ? (
                        <><Percent className="w-3 h-3 mr-1" />{promo.discount_value}%</>
                      ) : (
                        <><DollarSign className="w-3 h-3 mr-1" />{promo.discount_value} FCFA</>
                      )}
                    </Badge>
                    <span>{promo.start_date} - {promo.end_date}</span>
                    {promo.start_time && promo.end_time && (
                      <span>{promo.start_time} - {promo.end_time}</span>
                    )}
                    <Badge variant="outline">
                      Utilisée {promo.usage_count} fois
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={promo.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {promo.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Gestion des Prix</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shifts">
            <Clock className="w-4 h-4 mr-2" />
            Shifts de Prix
          </TabsTrigger>
          <TabsTrigger value="promotions">
            <Zap className="w-4 h-4 mr-2" />
            Promotions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shifts">
          {renderShiftsTab()}
        </TabsContent>
        
        <TabsContent value="promotions">
          {renderPromotionsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}