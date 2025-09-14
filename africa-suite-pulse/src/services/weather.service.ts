import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  date: string;
  temperature: number;
  precipitation: number;
  icon: "☀️" | "⛅" | "🌧️" | "⛈️";
}

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    precipitation_sum: number[];
  };
}

class WeatherService {
  private cache = new Map<string, { data: WeatherData[]; timestamp: number }>();
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 heures
  private readonly ABIDJAN_LAT = 5.3600;
  private readonly ABIDJAN_LON = -4.0083;

  /**
   * Récupère les prévisions météo pour Abidjan (7 jours)
   */
  async getWeatherForecast(): Promise<WeatherData[]> {
    const cacheKey = "abidjan-weather";
    const cached = this.cache.get(cacheKey);
    
    // Vérifier le cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.ABIDJAN_LAT}&longitude=${this.ABIDJAN_LON}&daily=temperature_2m_max,precipitation_sum&timezone=Africa/Abidjan&forecast_days=7`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenMeteoResponse = await response.json();
      
      const weatherData: WeatherData[] = data.daily.time.map((date, index) => ({
        date,
        temperature: Math.round(data.daily.temperature_2m_max[index]),
        precipitation: data.daily.precipitation_sum[index],
        icon: this.getWeatherIcon(data.daily.precipitation_sum[index], data.daily.temperature_2m_max[index])
      }));

      // Mettre en cache
      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      
      return weatherData;
    } catch (error) {
      console.error("Erreur météo:", error);
      
      // Fallback avec données par défaut
      return this.getFallbackWeatherData();
    }
  }

  /**
   * Détermine l'icône météo en fonction des conditions
   */
  private getWeatherIcon(precipitation: number, temperature: number): "☀️" | "⛅" | "🌧️" | "⛈️" {
    if (precipitation > 10) return "⛈️"; // Orage/pluie forte
    if (precipitation > 2) return "🌧️";  // Pluie modérée
    if (precipitation > 0) return "⛅";   // Nuageux avec pluie légère
    return "☀️"; // Ensoleillé
  }

  /**
   * Données de secours en cas d'erreur API
   */
  private getFallbackWeatherData(): WeatherData[] {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      return {
        date: date.toISOString().split('T')[0],
        temperature: 28 + Math.floor(Math.random() * 6), // 28-33°C
        precipitation: Math.random() * 5, // 0-5mm
        icon: "☀️" as const
      };
    });
  }

  /**
   * Efface le cache météo (utile pour forcer un refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const weatherService = new WeatherService();