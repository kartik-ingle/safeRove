"""
NCRB (National Crime Records Bureau) API Service
Integrates real-time crime data for safety score predictions
"""

import requests
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class NCRBService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://data.gov.in/api/rest/dataset"
        self.cache = {}
        self.cache_duration = 3600  # 1 hour cache
        
    def get_crime_data_by_location(self, latitude: float, longitude: float, radius_km: int = 10) -> Dict:
        """
        Get crime data for a specific location within radius
        
        Args:
            latitude: Location latitude
            longitude: Location longitude  
            radius_km: Search radius in kilometers
            
        Returns:
            Dict containing crime statistics and risk factors
        """
        try:
            # Check cache first
            cache_key = f"crime_{latitude}_{longitude}_{radius_km}"
            if self._is_cache_valid(cache_key):
                return self.cache[cache_key]['data']
            
            # Get state and district from coordinates
            state, district = self._get_location_details(latitude, longitude)
            
            if not state or not district:
                return self._get_default_crime_data()
            
            # Fetch crime data from NCRB API
            crime_data = self._fetch_crime_data(state, district)
            
            # Calculate location-specific risk factors
            risk_factors = self._calculate_risk_factors(crime_data, latitude, longitude)
            
            result = {
                'state': state,
                'district': district,
                'crime_statistics': crime_data,
                'risk_factors': risk_factors,
                'last_updated': datetime.now().isoformat(),
                'data_source': 'NCRB'
            }
            
            # Cache the result
            self.cache[cache_key] = {
                'data': result,
                'timestamp': datetime.now()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching NCRB crime data: {e}")
            return self._get_default_crime_data()
    
    def _get_location_details(self, latitude: float, longitude: float) -> Tuple[Optional[str], Optional[str]]:
        """
        Get state and district from coordinates using reverse geocoding
        """
        try:
            # Using a simple reverse geocoding service
            # In production, you might want to use Google Maps API or similar
            response = requests.get(
                f"https://api.bigdatacloud.net/data/reverse-geocode-client",
                params={
                    'latitude': latitude,
                    'longitude': longitude,
                    'localityLanguage': 'en'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                state = data.get('principalSubdivision', '')
                district = data.get('locality', '')
                return state, district
                
        except Exception as e:
            logger.error(f"Error in reverse geocoding: {e}")
            
        return None, None
    
    def _fetch_crime_data(self, state: str, district: str) -> Dict:
        """
        Fetch crime data from NCRB API for specific state and district
        """
        try:
            # NCRB API endpoint for crime data
            # Note: This is a placeholder - actual NCRB API endpoints may vary
            params = {
                'api-key': self.api_key,
                'format': 'json',
                'filters[state]': state,
                'filters[district]': district,
                'limit': 100
            }
            
            response = requests.get(
                f"{self.base_url}/crime-data",
                params=params,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_crime_data(data)
            else:
                logger.warning(f"NCRB API returned status {response.status_code}")
                return self._get_default_crime_data()
                
        except Exception as e:
            logger.error(f"Error fetching from NCRB API: {e}")
            return self._get_default_crime_data()
    
    def _parse_crime_data(self, api_data: Dict) -> Dict:
        """
        Parse and structure crime data from NCRB API response
        """
        try:
            records = api_data.get('records', [])
            
            # Categorize crimes by type
            crime_categories = {
                'theft': 0,
                'robbery': 0,
                'assault': 0,
                'fraud': 0,
                'cyber_crime': 0,
                'domestic_violence': 0,
                'sexual_offenses': 0,
                'other': 0
            }
            
            total_crimes = 0
            recent_crimes = 0
            current_date = datetime.now()
            
            for record in records:
                # Count by category (simplified mapping)
                crime_type = record.get('crime_type', '').lower()
                crime_date = record.get('date', '')
                
                # Categorize crime
                if any(word in crime_type for word in ['theft', 'burglary', 'larceny']):
                    crime_categories['theft'] += 1
                elif any(word in crime_type for word in ['robbery', 'mugging']):
                    crime_categories['robbery'] += 1
                elif any(word in crime_type for word in ['assault', 'battery', 'violence']):
                    crime_categories['assault'] += 1
                elif any(word in crime_type for word in ['fraud', 'scam', 'cheating']):
                    crime_categories['fraud'] += 1
                elif any(word in crime_type for word in ['cyber', 'online', 'digital']):
                    crime_categories['cyber_crime'] += 1
                elif any(word in crime_type for word in ['domestic', 'family']):
                    crime_categories['domestic_violence'] += 1
                elif any(word in crime_type for word in ['rape', 'sexual', 'molestation']):
                    crime_categories['sexual_offenses'] += 1
                else:
                    crime_categories['other'] += 1
                
                total_crimes += 1
                
                # Check if crime is recent (last 30 days)
                try:
                    if crime_date:
                        crime_datetime = datetime.fromisoformat(crime_date.replace('Z', '+00:00'))
                        if (current_date - crime_datetime).days <= 30:
                            recent_crimes += 1
                except:
                    pass
            
            return {
                'total_crimes': total_crimes,
                'recent_crimes': recent_crimes,
                'crime_categories': crime_categories,
                'crime_rate_per_100k': (total_crimes / 100000) * 100 if total_crimes > 0 else 0,
                'recent_crime_rate': (recent_crimes / 30) if recent_crimes > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Error parsing crime data: {e}")
            return self._get_default_crime_data()
    
    def _calculate_risk_factors(self, crime_data: Dict, latitude: float, longitude: float) -> Dict:
        """
        Calculate risk factors based on crime data
        """
        total_crimes = crime_data.get('total_crimes', 0)
        recent_crimes = crime_data.get('recent_crimes', 0)
        crime_categories = crime_data.get('crime_categories', {})
        
        # Calculate risk scores (1-10 scale)
        risk_factors = {
            'overall_risk': min(10, max(1, (total_crimes / 100) + 1)),
            'recent_activity_risk': min(10, max(1, (recent_crimes / 5) + 1)),
            'theft_risk': min(10, max(1, (crime_categories.get('theft', 0) / 20) + 1)),
            'violence_risk': min(10, max(1, (crime_categories.get('assault', 0) / 10) + 1)),
            'robbery_risk': min(10, max(1, (crime_categories.get('robbery', 0) / 5) + 1)),
            'sexual_crime_risk': min(10, max(1, (crime_categories.get('sexual_offenses', 0) / 3) + 1)),
            'cyber_crime_risk': min(10, max(1, (crime_categories.get('cyber_crime', 0) / 15) + 1))
        }
        
        # Time-based risk adjustments
        current_hour = datetime.now().hour
        if 22 <= current_hour or current_hour <= 6:  # Night time
            risk_factors['time_risk'] = 8
        elif 18 <= current_hour <= 22:  # Evening
            risk_factors['time_risk'] = 6
        else:  # Day time
            risk_factors['time_risk'] = 3
        
        # Seasonal risk adjustments (simplified)
        current_month = datetime.now().month
        if current_month in [12, 1, 2]:  # Winter months
            risk_factors['seasonal_risk'] = 7
        elif current_month in [6, 7, 8, 9]:  # Monsoon months
            risk_factors['seasonal_risk'] = 6
        else:
            risk_factors['seasonal_risk'] = 4
        
        return risk_factors
    
    def _get_default_crime_data(self) -> Dict:
        """
        Return default crime data when API is unavailable
        """
        return {
            'state': 'Unknown',
            'district': 'Unknown',
            'crime_statistics': {
                'total_crimes': 0,
                'recent_crimes': 0,
                'crime_categories': {
                    'theft': 0,
                    'robbery': 0,
                    'assault': 0,
                    'fraud': 0,
                    'cyber_crime': 0,
                    'domestic_violence': 0,
                    'sexual_offenses': 0,
                    'other': 0
                },
                'crime_rate_per_100k': 0,
                'recent_crime_rate': 0
            },
            'risk_factors': {
                'overall_risk': 5,
                'recent_activity_risk': 5,
                'theft_risk': 5,
                'violence_risk': 5,
                'robbery_risk': 5,
                'sexual_crime_risk': 5,
                'cyber_crime_risk': 5,
                'time_risk': 5,
                'seasonal_risk': 5
            },
            'last_updated': datetime.now().isoformat(),
            'data_source': 'default'
        }
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """
        Check if cached data is still valid
        """
        if cache_key not in self.cache:
            return False
        
        cache_time = self.cache[cache_key]['timestamp']
        return (datetime.now() - cache_time).seconds < self.cache_duration
    
    def get_safety_recommendations(self, risk_factors: Dict) -> List[str]:
        """
        Generate safety recommendations based on risk factors
        """
        recommendations = []
        
        if risk_factors.get('overall_risk', 5) > 7:
            recommendations.append("High crime area detected. Consider alternative routes or times.")
        
        if risk_factors.get('recent_activity_risk', 5) > 6:
            recommendations.append("Recent criminal activity reported. Exercise extra caution.")
        
        if risk_factors.get('theft_risk', 5) > 6:
            recommendations.append("High theft risk. Keep valuables secure and avoid displaying expensive items.")
        
        if risk_factors.get('violence_risk', 5) > 6:
            recommendations.append("Violence risk elevated. Avoid isolated areas and travel in groups if possible.")
        
        if risk_factors.get('robbery_risk', 5) > 6:
            recommendations.append("Robbery risk high. Avoid carrying large amounts of cash or valuables.")
        
        if risk_factors.get('sexual_crime_risk', 5) > 6:
            recommendations.append("Sexual crime risk present. Stay in well-lit, populated areas.")
        
        if risk_factors.get('cyber_crime_risk', 5) > 6:
            recommendations.append("High cyber crime area. Be cautious with public WiFi and online transactions.")
        
        if risk_factors.get('time_risk', 5) > 6:
            recommendations.append("Night time travel risk. Consider daytime alternatives or use trusted transportation.")
        
        if not recommendations:
            recommendations.append("Area appears relatively safe. Maintain normal safety precautions.")
        
        return recommendations
