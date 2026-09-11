// State Centroids & Bounding for dynamic recentering across Indian States & UTs
export const STATE_CENTROIDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, zoom: 7 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139, zoom: 7 },
  'Bihar': { lat: 25.0961, lng: 85.3131, zoom: 7 },
  'West Bengal': { lat: 22.9868, lng: 87.8550, zoom: 7 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569, zoom: 6 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569, zoom: 7 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179, zoom: 6 },
  'Karnataka': { lat: 15.3173, lng: 75.7139, zoom: 7 },
  'Gujarat': { lat: 22.2587, lng: 71.1924, zoom: 7 },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400, zoom: 7 },
  'Odisha': { lat: 20.9517, lng: 85.0985, zoom: 7 },
  'Kerala': { lat: 10.8505, lng: 76.2711, zoom: 8 },
  'Telangana': { lat: 18.1124, lng: 79.0193, zoom: 7 },
  'Assam': { lat: 26.2006, lng: 92.9376, zoom: 7 },
  'Punjab': { lat: 31.1471, lng: 75.3412, zoom: 8 },
  'Haryana': { lat: 29.0588, lng: 76.0856, zoom: 8 },
  'Jharkhand': { lat: 23.6102, lng: 85.2799, zoom: 7 },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661, zoom: 7 },
  'Uttarakhand': { lat: 30.0668, lng: 79.0193, zoom: 8 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734, zoom: 8 },
  'Tripura': { lat: 23.9408, lng: 91.9882, zoom: 8 },
  'Meghalaya': { lat: 25.4670, lng: 91.3662, zoom: 8 },
  'Manipur': { lat: 24.6637, lng: 93.9063, zoom: 8 },
  'Nagaland': { lat: 26.1584, lng: 94.5624, zoom: 8 },
  'Goa': { lat: 15.2993, lng: 74.1240, zoom: 10 },
  'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278, zoom: 7 },
  'Mizoram': { lat: 23.1645, lng: 92.9376, zoom: 8 },
  'Sikkim': { lat: 27.5330, lng: 88.5122, zoom: 9 },
  'Delhi': { lat: 28.7041, lng: 77.1025, zoom: 11 },
  'Jammu & Kashmir': { lat: 33.7782, lng: 76.5762, zoom: 7 },
  'Ladakh': { lat: 34.1526, lng: 77.5771, zoom: 7 },
  'Puducherry': { lat: 11.9416, lng: 79.8083, zoom: 11 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794, zoom: 12 },
  'Andaman & Nicobar Islands': { lat: 11.7401, lng: 92.6586, zoom: 8 },
  'Dadra & Nagar Haveli and Daman & Diu': { lat: 20.4283, lng: 72.8397, zoom: 10 },
  'Lakshadweep': { lat: 10.5667, lng: 72.6417, zoom: 9 }
};

export const NATIONAL_INDIA_CENTER = {
  lat: 22.5937,
  lng: 78.9629,
  zoom: 4.8
};

export interface MapServiceConfig {
  hasKey: boolean;
  apiKey: string;
  mapId: string;
  attributionId: string;
}

let cachedConfig: MapServiceConfig | null = null;

export async function getGoogleMapsConfig(): Promise<MapServiceConfig> {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch('/api/config/maps');
    if (res.ok) {
      const data = await res.json();
      cachedConfig = {
        hasKey: Boolean(data.hasKey && data.apiKey),
        apiKey: data.apiKey || '',
        mapId: data.mapId || 'DEMO_MAP_ID',
        attributionId: 'gmp_mcp_codeassist_v1_aistudio'
      };
      return cachedConfig;
    }
  } catch (err) {
    console.warn('Unable to query server map config:', err);
  }

  // Fallback defaults
  cachedConfig = {
    hasKey: false,
    apiKey: '',
    mapId: 'DEMO_MAP_ID',
    attributionId: 'gmp_mcp_codeassist_v1_aistudio'
  };
  return cachedConfig;
}
