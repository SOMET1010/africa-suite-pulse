import { useState, useEffect } from "react";
import { weatherService, type WeatherData } from "@/services/weather.service";

/**
 * Hook pour récupérer les données météo avec cache automatique
 */
export function useWeatherData() {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const weatherData = await weatherService.getWeatherForecast();
        
        if (mounted) {
          setWeather(weatherData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Erreur météo inconnue");
          console.error("Erreur météo:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    // Rafraîchir toutes les 6 heures
    const interval = setInterval(fetchWeather, 6 * 60 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const refetch = () => {
    weatherService.clearCache();
    setLoading(true);
    weatherService.getWeatherForecast().then(setWeather).catch(setError).finally(() => setLoading(false));
  };

  return {
    weather,
    loading,
    error,
    refetch
  };
}