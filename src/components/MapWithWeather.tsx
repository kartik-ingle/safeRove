import { Droplets, MapPin, Thermometer, Wind } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SimpleMap } from './SimpleMap';

interface Position {
  lat: number;
  lng: number;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

interface MapWithWeatherProps {
  center?: Position;
  zoom?: number;
  markers?: Array<{
    position: Position;
    title?: string;
    type?: 'user' | 'police' | 'tourism' | 'poi';
  }>;
}

const WEATHER_CODE_MAP: Record<number, { main: string; description: string; icon: string }> = {
  0: { main: 'Clear', description: 'clear sky', icon: '01d' },
  1: { main: 'Mainly clear', description: 'mainly clear', icon: '01d' },
  2: { main: 'Partly cloudy', description: 'partly cloudy', icon: '02d' },
  3: { main: 'Overcast', description: 'overcast', icon: '04d' },
  45: { main: 'Fog', description: 'fog', icon: '50d' },
  48: { main: 'Depositing rime fog', description: 'rime fog', icon: '50d' },
  51: { main: 'Drizzle', description: 'light drizzle', icon: '09d' },
  53: { main: 'Drizzle', description: 'drizzle', icon: '09d' },
  55: { main: 'Drizzle', description: 'heavy drizzle', icon: '09d' },
  56: { main: 'Freezing drizzle', description: 'freezing drizzle', icon: '13d' },
  57: { main: 'Freezing drizzle', description: 'freezing drizzle', icon: '13d' },
  61: { main: 'Rain', description: 'light rain', icon: '10d' },
  63: { main: 'Rain', description: 'rain', icon: '10d' },
  65: { main: 'Rain', description: 'heavy rain', icon: '10d' },
  66: { main: 'Freezing rain', description: 'freezing rain', icon: '13d' },
  67: { main: 'Freezing rain', description: 'freezing rain', icon: '13d' },
  71: { main: 'Snow', description: 'light snow', icon: '13d' },
  73: { main: 'Snow', description: 'snow', icon: '13d' },
  75: { main: 'Snow', description: 'heavy snow', icon: '13d' },
  77: { main: 'Snow grains', description: 'snow grains', icon: '13d' },
  80: { main: 'Rain showers', description: 'light rain showers', icon: '09d' },
  81: { main: 'Rain showers', description: 'rain showers', icon: '09d' },
  82: { main: 'Rain showers', description: 'violent rain showers', icon: '09d' },
  85: { main: 'Snow showers', description: 'snow showers', icon: '13d' },
  86: { main: 'Snow showers', description: 'heavy snow showers', icon: '13d' },
  95: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
  96: { main: 'Thunderstorm', description: 'thunderstorm with hail', icon: '11d' },
  99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' },
};

const MapWithWeather: React.FC<MapWithWeatherProps> = ({ center, zoom, markers }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKeyRaw = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;
  const apiKey = useMemo(() => (apiKeyRaw || '').replace(/^\"|\"$/g, '').trim(), [apiKeyRaw]);
  const apiAvailable = useMemo(() => !!apiKey && apiKey !== 'your_openweather_api_key_here', [apiKey]);

  const fetchFromOpenWeather = useCallback(async (lat: number, lng: number) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    return data as WeatherData;
  }, [apiKey]);

  const fetchFromOpenMeteo = useCallback(async (lat: number, lng: number) => {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,pressure_msl',
      timezone: 'auto',
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    const code: number = data?.current?.weather_code ?? 0;
    const map = WEATHER_CODE_MAP[code] || WEATHER_CODE_MAP[0];

    const mapped: WeatherData = {
      main: {
        temp: Number(data?.current?.temperature_2m ?? 0),
        feels_like: Number(data?.current?.apparent_temperature ?? data?.current?.temperature_2m ?? 0),
        humidity: Number(data?.current?.relative_humidity_2m ?? 0),
        pressure: Number(data?.current?.pressure_msl ?? 0),
      },
      weather: [
        {
          description: map.description,
          icon: map.icon,
          main: map.main,
        },
      ],
      wind: {
        speed: Number(data?.current?.wind_speed_10m ?? 0),
      },
      name: 'Current location',
      sys: { country: '' },
    };

    return mapped;
  }, []);

  const fetchWeatherData = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = apiAvailable
        ? await fetchFromOpenWeather(lat, lng)
        : await fetchFromOpenMeteo(lat, lng);

      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiAvailable, fetchFromOpenWeather, fetchFromOpenMeteo]);

  const handleMapClick = useCallback(async (position: Position) => {
    await fetchWeatherData(position.lat, position.lng);
  }, [fetchWeatherData]);

  // Load initial weather data for the provided center or New Delhi
  useEffect(() => {
    if (!weather && !loading && !error) {
      const initial = center || { lat: 28.6139, lng: 77.2090 };
      fetchWeatherData(initial.lat, initial.lng);
    }
  }, [weather, loading, error, fetchWeatherData, center]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-3 md:gap-4">
      <div className="w-full md:w-2/3 min-h-[300px] md:min-h-[440px]">
        <SimpleMap 
          center={center}
          zoom={zoom}
          markers={markers?.map(m => ({ position: m.position, title: m.title }))}
          onMapClick={handleMapClick}
          className="h-full w-full"
        />
      </div>
      
      <div className="w-full md:w-1/3 glass-card border-glass-border rounded-xl p-3 md:p-4 overflow-visible box-border">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded">
            {error}
          </div>
        ) : weather ? (
          <div className="space-y-3 md:space-y-4 break-words">
            {/* Summary header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-500 flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-semibold leading-tight truncate">
                    {weather.name}{weather.sys.country ? `, ${weather.sys.country}` : ''}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground capitalize truncate">
                    {weather.weather[0].description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                  alt={weather.weather[0].description}
                  className="w-8 h-8 md:w-10 md:h-10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;
                  }}
                />
                <div className="text-lg md:text-xl font-bold leading-none">
                  {weather.main.temp.toFixed(0)}°C
                </div>
              </div>
            </div>

            <div className="h-px bg-glass-border" />

            {/* Metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="rounded-2xl p-4 md:p-5 shadow-sm bg-[linear-gradient(180deg,#1e2a5a_0%,#2a3b80_100%)] text-white text-center">
                <div className="flex flex-col items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  <p className="text-sm opacity-90">Feels like</p>
                  <p className="text-2xl font-semibold">{weather.main.feels_like.toFixed(0)}°</p>
                </div>
              </div>
              <div className="rounded-2xl p-4 md:p-5 shadow-sm bg-[linear-gradient(180deg,#1e2a5a_0%,#2a3b80_100%)] text-white text-center">
                <div className="flex flex-col items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  <p className="text-sm opacity-90">Humidity</p>
                  <p className="text-2xl font-semibold">{weather.main.humidity}%</p>
                </div>
              </div>
              <div className="rounded-2xl p-4 md:p-5 shadow-sm bg-[linear-gradient(180deg,#1e2a5a_0%,#2a3b80_100%)] text-white text-center">
                <div className="flex flex-col items-center gap-2">
                  <Wind className="w-5 h-5" />
                  <p className="text-sm opacity-90">Wind</p>
                  <p className="text-2xl font-semibold">{weather.wind.speed} m/s</p>
                </div>
              </div>
              <div className="rounded-2xl p-4 md:p-5 shadow-sm bg-[linear-gradient(180deg,#1e2a5a_0%,#2a3b80_100%)] text-white text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 20V4h2v16H6zm10 0V4h2v16h-2z" fill="currentColor" />
                  </svg>
                  <p className="text-sm opacity-90">Pressure</p>
                  <p className="text-xl font-semibold">{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Loading weather data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapWithWeather;

