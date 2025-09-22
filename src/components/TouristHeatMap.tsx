import { Loader } from '@googlemaps/js-api-loader';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Type definitions
interface Position {
  lat: number;
  lng: number;
}

interface TouristLocation {
  id: string;
  position: Position;
  touristCount: number;
  safetyScore: number;
  lastUpdated: string;
  touristType: 'domestic' | 'foreign' | 'group' | 'solo';
}

interface SafetyZone {
  id: string;
  name: string;
  bounds: google.maps.LatLngBounds;
  safetyLevel: 'low' | 'medium' | 'high';
  color: string;
  touristCount: number;
}

interface TouristHeatMapProps {
  center?: Position;
  zoom?: number;
  selectedCity?: string;
  onZoneClick?: (zone: SafetyZone) => void;
  onTouristLocationClick?: (location: TouristLocation) => void;
}

const DEFAULT_CENTER: Position = { lat: 28.6139, lng: 77.2090 }; // New Delhi
const DEFAULT_ZOOM = 12;

// City configurations with their centers and tourist locations
const CITY_CONFIGS = {
  'Delhi': {
    center: { lat: 28.6139, lng: 77.2090 },
    zoom: 12,
    safetyZones: [
      {
        id: 'delhi_red_fort',
        name: 'Red Fort Area',
        bounds: { north: 28.6580, south: 28.6480, east: 77.2450, west: 77.2350 },
        safetyLevel: 'medium' as const,
        color: '#fbbf24',
        touristCount: 45
      },
      {
        id: 'delhi_connaught',
        name: 'Connaught Place',
        bounds: { north: 28.6320, south: 28.6220, east: 77.2200, west: 77.2100 },
        safetyLevel: 'high' as const,
        color: '#ef4444',
        touristCount: 78
      },
      {
        id: 'delhi_karol_bagh',
        name: 'Karol Bagh',
        bounds: { north: 28.6520, south: 28.6420, east: 77.1950, west: 77.1850 },
        safetyLevel: 'low' as const,
        color: '#10b981',
        touristCount: 23
      }
    ],
    touristLocations: [
      {
        id: 't1',
        position: { lat: 28.6560, lng: 77.2400 },
        touristCount: 12,
        safetyScore: 6,
        lastUpdated: '2024-01-15T10:30:00Z',
        touristType: 'group' as const
      },
      {
        id: 't2',
        position: { lat: 28.6280, lng: 77.2150 },
        touristCount: 8,
        safetyScore: 8,
        lastUpdated: '2024-01-15T10:25:00Z',
        touristType: 'domestic' as const
      },
      {
        id: 't3',
        position: { lat: 28.6470, lng: 77.1900 },
        touristCount: 5,
        safetyScore: 4,
        lastUpdated: '2024-01-15T10:20:00Z',
        touristType: 'foreign' as const
      }
    ]
  },
  'Mumbai': {
    center: { lat: 19.0760, lng: 72.8777 },
    zoom: 12,
    safetyZones: [
      {
        id: 'mumbai_gateway',
        name: 'Gateway of India',
        bounds: { north: 19.0820, south: 19.0720, east: 72.8850, west: 72.8750 },
        safetyLevel: 'medium' as const,
        color: '#fbbf24',
        touristCount: 65
      },
      {
        id: 'mumbai_marine',
        name: 'Marine Drive',
        bounds: { north: 19.0700, south: 19.0600, east: 72.8200, west: 72.8100 },
        safetyLevel: 'low' as const,
        color: '#10b981',
        touristCount: 34
      }
    ],
    touristLocations: [
      {
        id: 't4',
        position: { lat: 19.0770, lng: 72.8800 },
        touristCount: 15,
        safetyScore: 5,
        lastUpdated: '2024-01-15T10:30:00Z',
        touristType: 'group' as const
      }
    ]
  },
  'Agra': {
    center: { lat: 27.1767, lng: 78.0081 },
    zoom: 13,
    safetyZones: [
      {
        id: 'agra_taj_mahal',
        name: 'Taj Mahal Area',
        bounds: { north: 27.1800, south: 27.1700, east: 78.0150, west: 78.0050 },
        safetyLevel: 'low' as const,
        color: '#10b981',
        touristCount: 120
      },
      {
        id: 'agra_fort',
        name: 'Agra Fort',
        bounds: { north: 27.1900, south: 27.1800, east: 78.0200, west: 78.0100 },
        safetyLevel: 'medium' as const,
        color: '#fbbf24',
        touristCount: 45
      }
    ],
    touristLocations: [
      {
        id: 't6',
        position: { lat: 27.1750, lng: 78.0100 },
        touristCount: 25,
        safetyScore: 4,
        lastUpdated: '2024-01-15T10:30:00Z',
        touristType: 'group' as const
      },
      {
        id: 't7',
        position: { lat: 27.1850, lng: 78.0150 },
        touristCount: 12,
        safetyScore: 6,
        lastUpdated: '2024-01-15T10:25:00Z',
        touristType: 'foreign' as const
      }
    ]
  },
  'Jaipur': {
    center: { lat: 26.9124, lng: 75.7873 },
    zoom: 12,
    safetyZones: [
      {
        id: 'jaipur_city_palace',
        name: 'City Palace',
        bounds: { north: 26.9200, south: 26.9100, east: 75.7950, west: 75.7850 },
        safetyLevel: 'low' as const,
        color: '#10b981',
        touristCount: 65
      },
      {
        id: 'jaipur_hawa_mahal',
        name: 'Hawa Mahal',
        bounds: { north: 26.9250, south: 26.9150, east: 75.8000, west: 75.7900 },
        safetyLevel: 'medium' as const,
        color: '#fbbf24',
        touristCount: 38
      },
      {
        id: 'jaipur_amber_fort',
        name: 'Amber Fort',
        bounds: { north: 26.9850, south: 26.9750, east: 75.8500, west: 75.8400 },
        safetyLevel: 'low' as const,
        color: '#10b981',
        touristCount: 52
      }
    ],
    touristLocations: [
      {
        id: 't8',
        position: { lat: 26.9150, lng: 75.7900 },
        touristCount: 18,
        safetyScore: 5,
        lastUpdated: '2024-01-15T10:30:00Z',
        touristType: 'domestic' as const
      },
      {
        id: 't9',
        position: { lat: 26.9800, lng: 75.8450 },
        touristCount: 8,
        safetyScore: 4,
        lastUpdated: '2024-01-15T10:28:00Z',
        touristType: 'solo' as const
      }
    ]
  }
};

const TouristHeatMap: React.FC<TouristHeatMapProps> = ({ 
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  selectedCity = 'Delhi',
  onZoneClick,
  onTouristLocationClick
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useLeaflet, setUseLeaflet] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [Leaflet, setLeaflet] = useState<any>(null);
  const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);
  const [touristLocations, setTouristLocations] = useState<TouristLocation[]>([]);
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<TouristLocation | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const zonesRef = useRef<google.maps.Rectangle[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Get city configuration
  const cityConfig = CITY_CONFIGS[selectedCity as keyof typeof CITY_CONFIGS] || CITY_CONFIGS.Delhi;

  const getSafetyZoneColor = (level: string, opacity: number = 0.3) => {
    const colors = {
      low: `rgba(16, 185, 129, ${opacity})`, // green
      medium: `rgba(251, 191, 36, ${opacity})`, // yellow
      high: `rgba(239, 68, 68, ${opacity})` // red
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  const getTouristMarkerIcon = (touristType: string, count: number) => {
    const baseColors = {
      domestic: '#3b82f6', // blue
      foreign: '#8b5cf6', // purple
      group: '#f59e0b', // amber
      solo: '#ef4444' // red
    };
    
    const color = baseColors[touristType as keyof typeof baseColors] || '#6b7280';
    const size = Math.min(40, Math.max(20, count * 2));
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: size / 10
    };
  };

  const createSafetyZones = useCallback((map: google.maps.Map) => {
    // Clear existing zones
    zonesRef.current.forEach(zone => zone.setMap(null));
    zonesRef.current = [];

    cityConfig.safetyZones.forEach(zoneConfig => {
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(zoneConfig.bounds.south, zoneConfig.bounds.west),
        new google.maps.LatLng(zoneConfig.bounds.north, zoneConfig.bounds.east)
      );

      const rectangle = new google.maps.Rectangle({
        bounds: bounds,
        fillColor: getSafetyZoneColor(zoneConfig.safetyLevel, 0.3),
        fillOpacity: 0.6,
        strokeColor: getSafetyZoneColor(zoneConfig.safetyLevel, 1),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        clickable: true
      });

      rectangle.setMap(map);

      // Add click listener
      rectangle.addListener('click', () => {
        const zone: SafetyZone = {
          id: zoneConfig.id,
          name: zoneConfig.name,
          bounds: bounds,
          safetyLevel: zoneConfig.safetyLevel,
          color: zoneConfig.color,
          touristCount: zoneConfig.touristCount
        };
        setSelectedZone(zone);
        onZoneClick?.(zone);
      });

      zonesRef.current.push(rectangle);
    });
  }, [cityConfig.safetyZones, onZoneClick]);

  const createTouristMarkers = useCallback((map: google.maps.Map) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    cityConfig.touristLocations.forEach(location => {
      const marker = new google.maps.Marker({
        position: location.position,
        map: map,
        icon: getTouristMarkerIcon(location.touristType, location.touristCount),
        title: `${location.touristCount} tourists (${location.touristType})`,
        clickable: true
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-sm">Tourist Location</h3>
            <p class="text-xs text-gray-600">Count: ${location.touristCount}</p>
            <p class="text-xs text-gray-600">Type: ${location.touristType}</p>
            <p class="text-xs text-gray-600">Safety Score: ${location.safetyScore}/10</p>
            <p class="text-xs text-gray-500">Updated: ${new Date(location.lastUpdated).toLocaleTimeString()}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedLocation(location);
        onTouristLocationClick?.(location);
      });

      markersRef.current.push(marker);
    });
  }, [cityConfig.touristLocations, onTouristLocationClick]);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
      if (!apiKey) {
        setUseLeaflet(true);
        return;
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      const google = await loader.load();
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: cityConfig.center,
        zoom: cityConfig.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      
      // Create safety zones and tourist markers
      createSafetyZones(mapInstance);
      createTouristMarkers(mapInstance);

      setSafetyZones(cityConfig.safetyZones);
      setTouristLocations(cityConfig.touristLocations);

    } catch (err) {
      console.error('Error initializing map:', err);
      setUseLeaflet(true);
    } finally {
      setLoading(false);
    }
  }, [cityConfig, createSafetyZones, createTouristMarkers]);

  // Initialize map when component mounts or city changes
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Lazy-load react-leaflet only when needed and in browser
  useEffect(() => {
    if (useLeaflet && !leafletLoaded && typeof window !== 'undefined') {
      (async () => {
        const mod = await import('react-leaflet');
        setLeaflet(mod);
        setLeafletLoaded(true);
      })().catch(() => setError('Failed to load Leaflet'));
    }
  }, [useLeaflet, leafletLoaded]);

  // Update map when city changes
  useEffect(() => {
    if (map) {
      const newConfig = CITY_CONFIGS[selectedCity as keyof typeof CITY_CONFIGS] || CITY_CONFIGS.Delhi;
      map.setCenter(newConfig.center);
      map.setZoom(newConfig.zoom);
      
      createSafetyZones(map);
      createTouristMarkers(map);
      
      setSafetyZones(newConfig.safetyZones);
      setTouristLocations(newConfig.touristLocations);
    }
  }, [selectedCity, map, createSafetyZones, createTouristMarkers]);

  const getTotalTourists = () => {
    return touristLocations.reduce((sum, location) => sum + location.touristCount, 0);
  };

  const getAverageSafetyScore = () => {
    if (touristLocations.length === 0) return 0;
    const total = touristLocations.reduce((sum, location) => sum + location.safetyScore, 0);
    return (total / touristLocations.length).toFixed(1);
  };

  if (error && !useLeaflet) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {!useLeaflet ? (
        <>
          <div ref={mapRef} className="h-96 w-full rounded-lg" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading tourist heat map...</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-96 w-full rounded-lg overflow-hidden">
          {!leafletLoaded || !Leaflet ? (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Leaflet.MapContainer center={[cityConfig.center.lat, cityConfig.center.lng]} zoom={cityConfig.zoom} style={{ height: '100%', width: '100%' }}>
              <Leaflet.TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {cityConfig.safetyZones.map((z) => (
                <Leaflet.Rectangle key={z.id} bounds={[[z.bounds.south, z.bounds.west],[z.bounds.north, z.bounds.east]] as any} pathOptions={{ color: z.color, fillOpacity: 0.3 }} eventHandlers={{ click: () => onZoneClick?.({ id: z.id, name: z.name, bounds: {} as any, safetyLevel: z.safetyLevel, color: z.color, touristCount: z.touristCount }) }} />
              ))}
              {cityConfig.touristLocations.map((l) => (
                <Leaflet.Marker key={l.id} position={[l.position.lat, l.position.lng] as any} eventHandlers={{ click: () => onTouristLocationClick?.(l) }}>
                  <Leaflet.Popup>
                    <div>
                      <div><strong>Tourists:</strong> {l.touristCount}</div>
                      <div><strong>Type:</strong> {l.touristType}</div>
                      <div><strong>Safety:</strong> {l.safetyScore}/10</div>
                    </div>
                  </Leaflet.Popup>
                </Leaflet.Marker>
              ))}
            </Leaflet.MapContainer>
          )}
        </div>
      )}
      
      {/* Map Legend and Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Safety Zones Legend */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-sm mb-2">Safety Zones</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-xs">Low Risk (Safe)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-xs">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-xs">High Risk</span>
            </div>
          </div>
        </div>

        {/* Tourist Statistics */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-sm mb-2">Tourist Statistics</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Total Tourists:</span>
              <span className="font-medium">{getTotalTourists()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Active Locations:</span>
              <span className="font-medium">{touristLocations.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Avg Safety Score:</span>
              <span className="font-medium">{getAverageSafetyScore()}/10</span>
            </div>
          </div>
        </div>

        {/* Tourist Types Legend */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-sm mb-2">Tourist Types</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Domestic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs">Foreign</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs">Group</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Solo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Zone/Location Info */}
      {(selectedZone || selectedLocation) && (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          {selectedZone && (
            <div>
              <h4 className="font-semibold text-sm text-blue-800 mb-1">
                Selected Zone: {selectedZone.name}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                <div>Safety Level: <span className="font-medium capitalize">{selectedZone.safetyLevel}</span></div>
                <div>Tourists: <span className="font-medium">{selectedZone.touristCount}</span></div>
              </div>
            </div>
          )}
          {selectedLocation && (
            <div>
              <h4 className="font-semibold text-sm text-blue-800 mb-1">
                Tourist Location ({selectedLocation.touristType})
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                <div>Count: <span className="font-medium">{selectedLocation.touristCount}</span></div>
                <div>Safety Score: <span className="font-medium">{selectedLocation.safetyScore}/10</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TouristHeatMap;
