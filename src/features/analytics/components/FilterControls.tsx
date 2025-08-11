import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AnalyticsFilters } from "../types";
import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FilterControlsProps {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  isLoading: boolean;
}

export function FilterControls({ filters, onChange, isLoading }: FilterControlsProps) {
  const handleDateRangeChange = (dateRange: { from: Date; to: Date }) => {
    onChange({
      ...filters,
      dateRange
    });
  };

  const handleComparisonToggle = (compareWithPreviousPeriod: boolean) => {
    onChange({
      ...filters,
      compareWithPreviousPeriod
    });
  };

  const setPresetRange = (days: number) => {
    const to = new Date();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    handleDateRangeChange({ from, to });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange ? (
                    `${format(filters.dateRange.from, "dd MMM", { locale: fr })} - ${format(filters.dateRange.to, "dd MMM yyyy", { locale: fr })}`
                  ) : (
                    "Sélectionner la période"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      handleDateRangeChange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPresetRange(7)}
              className="text-xs"
            >
              7j
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPresetRange(30)}
              className="text-xs"
            >
              30j
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPresetRange(90)}
              className="text-xs"
            >
              90j
            </Button>
          </div>

          {/* Comparison Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="comparison"
              checked={filters.compareWithPreviousPeriod || false}
              onCheckedChange={handleComparisonToggle}
            />
            <Label htmlFor="comparison" className="text-sm">
              Comparer avec période précédente
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}