"""
Weather API Service for Enhanced Safety Model
Integrates weather data to improve safety score predictions
"""

import requests
import json
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'
        self.cache = {}
        self.cache_duration = 1800  # 30 minutes cache
        
    def get_weather_data(self, latitude: float, longitude: float) -> Dict:
        """
        Get weather data for a specific location
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            
        Returns:
            Dict containing weather data and risk factors
        """
        try:
            # Check cache first
            cache_key = f"weather_{latitude}_{longitude}"
            if self._is_cache_valid(cache_key):
                return self.cache[cache_key]['data']
            
            # Construct API URL
            location = f"{latitude},{longitude}"
            url = f"{self.base_url}{location}?unitGroup=metric&contentType=json&key={self.api_key}"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            weather_data = response.json()
            
            # Process weather data for safety analysis
            processed_data = self._process_weather_data(weather_data)
            
            # Cache the result
            self.cache[cache_key] = {
                'data': processed_data,
                'timestamp': datetime.now()
            }
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {e}")
            return self._get_default_weather_data()
    
    def _process_weather_data(self, raw_data: Dict) -> Dict:
        """
        Process raw weather data into safety-relevant information
        """
        try:
            # Get current conditions
            current = raw_data.get('currentConditions', {})
            
            # Extract key weather parameters
            temperature = current.get('temp', 20)
            humidity = current.get('humidity', 50)
            wind_speed = current.get('windspeed', 0)
            visibility = current.get('visibility', 10)
            uv_index = current.get('uvindex', 5)
            conditions = current.get('conditions', 'Clear')
            pressure = current.get('pressure', 1013)
            
            # Calculate weather risk factors
            risk_factors = self._calculate_weather_risk_factors(
                temperature, humidity, wind_speed, visibility, 
                uv_index, conditions, pressure
            )
            
            # Get forecast data for next 24 hours
            forecast_data = raw_data.get('days', [])
            next_24h_forecast = forecast_data[0] if forecast_data else {}
            
            return {
                'current_conditions': {
                    'temperature': temperature,
                    'humidity': humidity,
                    'wind_speed': wind_speed,
                    'visibility': visibility,
                    'uv_index': uv_index,
                    'conditions': conditions,
                    'pressure': pressure,
                    'feels_like': current.get('feelslike', temperature)
                },
                'risk_factors': risk_factors,
                'forecast_24h': {
                    'max_temp': next_24h_forecast.get('tempmax', temperature),
                    'min_temp': next_24h_forecast.get('tempmin', temperature),
                    'precipitation_prob': next_24h_forecast.get('precipprob', 0),
                    'precipitation': next_24h_forecast.get('precip', 0),
                    'conditions': next_24h_forecast.get('conditions', conditions)
                },
                'safety_recommendations': self._generate_weather_safety_recommendations(risk_factors),
                'last_updated': datetime.now().isoformat(),
                'data_source': 'VisualCrossing'
            }
            
        except Exception as e:
            logger.error(f"Error processing weather data: {e}")
            return self._get_default_weather_data()
    
    def _calculate_weather_risk_factors(self, temp: float, humidity: float, 
                                      wind_speed: float, visibility: float,
                                      uv_index: float, conditions: str, 
                                      pressure: float) -> Dict:
        """
        Calculate weather-based risk factors for safety assessment
        """
        risk_factors = {}
        
        # Temperature risk (1-10 scale)
        if temp < 0 or temp > 40:
            risk_factors['temperature_risk'] = 9
        elif temp < 5 or temp > 35:
            risk_factors['temperature_risk'] = 7
        elif temp < 10 or temp > 30:
            risk_factors['temperature_risk'] = 5
        else:
            risk_factors['temperature_risk'] = 3
        
        # Humidity risk
        if humidity > 90:
            risk_factors['humidity_risk'] = 8
        elif humidity > 80:
            risk_factors['humidity_risk'] = 6
        elif humidity < 20:
            risk_factors['humidity_risk'] = 5
        else:
            risk_factors['humidity_risk'] = 3
        
        # Wind risk
        if wind_speed > 30:
            risk_factors['wind_risk'] = 9
        elif wind_speed > 20:
            risk_factors['wind_risk'] = 7
        elif wind_speed > 10:
            risk_factors['wind_risk'] = 5
        else:
            risk_factors['wind_risk'] = 2
        
        # Visibility risk
        if visibility < 1:
            risk_factors['visibility_risk'] = 9
        elif visibility < 3:
            risk_factors['visibility_risk'] = 7
        elif visibility < 5:
            risk_factors['visibility_risk'] = 5
        else:
            risk_factors['visibility_risk'] = 2
        
        # UV risk
        if uv_index > 10:
            risk_factors['uv_risk'] = 8
        elif uv_index > 7:
            risk_factors['uv_risk'] = 6
        elif uv_index > 5:
            risk_factors['uv_risk'] = 4
        else:
            risk_factors['uv_risk'] = 2
        
        # Weather condition risk
        condition_risk_map = {
            'Clear': 2,
            'Partly Cloudy': 3,
            'Cloudy': 4,
            'Overcast': 5,
            'Rain': 7,
            'Heavy Rain': 9,
            'Thunderstorm': 9,
            'Snow': 8,
            'Fog': 8,
            'Haze': 6,
            'Dust': 7
        }
        risk_factors['condition_risk'] = condition_risk_map.get(conditions, 5)
        
        # Overall weather risk (weighted average)
        weights = {
            'temperature_risk': 0.2,
            'humidity_risk': 0.15,
            'wind_risk': 0.2,
            'visibility_risk': 0.25,
            'uv_risk': 0.1,
            'condition_risk': 0.1
        }
        
        overall_risk = sum(risk_factors[key] * weights[key] for key in weights.keys())
        risk_factors['overall_weather_risk'] = round(overall_risk, 1)
        
        return risk_factors
    
    def _generate_weather_safety_recommendations(self, risk_factors: Dict) -> list:
        """
        Generate weather-based safety recommendations
        """
        recommendations = []
        
        if risk_factors.get('temperature_risk', 5) > 7:
            if risk_factors.get('temperature_risk', 5) > 8:
                recommendations.append("Extreme temperature conditions. Avoid outdoor activities.")
            else:
                recommendations.append("High temperature risk. Stay hydrated and seek shade.")
        
        if risk_factors.get('wind_risk', 5) > 7:
            recommendations.append("High wind conditions. Be cautious of falling objects and debris.")
        
        if risk_factors.get('visibility_risk', 5) > 7:
            recommendations.append("Poor visibility conditions. Use extra caution when traveling.")
        
        if risk_factors.get('uv_risk', 5) > 6:
            recommendations.append("High UV exposure. Use sunscreen and protective clothing.")
        
        if risk_factors.get('condition_risk', 5) > 7:
            recommendations.append("Severe weather conditions. Consider postponing outdoor activities.")
        
        if risk_factors.get('overall_weather_risk', 5) > 7:
            recommendations.append("Overall weather conditions pose safety risks. Exercise caution.")
        elif risk_factors.get('overall_weather_risk', 5) < 4:
            recommendations.append("Favorable weather conditions for outdoor activities.")
        
        return recommendations
    
    def _get_default_weather_data(self) -> Dict:
        """
        Return default weather data when API is unavailable
        """
        return {
            'current_conditions': {
                'temperature': 25,
                'humidity': 60,
                'wind_speed': 5,
                'visibility': 10,
                'uv_index': 5,
                'conditions': 'Clear',
                'pressure': 1013,
                'feels_like': 25
            },
            'risk_factors': {
                'temperature_risk': 3,
                'humidity_risk': 3,
                'wind_risk': 2,
                'visibility_risk': 2,
                'uv_risk': 4,
                'condition_risk': 2,
                'overall_weather_risk': 3.0
            },
            'forecast_24h': {
                'max_temp': 28,
                'min_temp': 22,
                'precipitation_prob': 20,
                'precipitation': 0,
                'conditions': 'Clear'
            },
            'safety_recommendations': [
                "Favorable weather conditions for outdoor activities."
            ],
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
    
    def get_weather_risk_score(self, latitude: float, longitude: float) -> float:
        """
        Get a single weather risk score (1-10) for the location
        """
        weather_data = self.get_weather_data(latitude, longitude)
        return weather_data.get('risk_factors', {}).get('overall_weather_risk', 5.0)
    
    def get_weather_condition(self, latitude: float, longitude: float) -> str:
        """
        Get current weather condition string
        """
        weather_data = self.get_weather_data(latitude, longitude)
        return weather_data.get('current_conditions', {}).get('conditions', 'Clear')
