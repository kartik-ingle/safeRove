"""
Enhanced Tourist Safety Score Model with NCRB Crime Data Integration
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import logging

from .services.ncrb_service import NCRBService
from .services.weather_service import WeatherService
from .config import settings

logger = logging.getLogger(__name__)

class EnhancedTouristSafetyScoreModel:
    def __init__(self, ncrb_api_key: str, weather_api_key: str = None):
        self.model = RandomForestClassifier(
            n_estimators=200, 
            random_state=42,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.ncrb_service = NCRBService(ncrb_api_key)
        self.weather_service = WeatherService(weather_api_key) if weather_api_key else None
        
        # Feature importance tracking
        self.feature_names = [
            'location_risk', 'time_risk', 'group_risk', 'exp_risk', 'planning_risk',
            'age', 'health_score', 'ncrb_overall_risk', 'ncrb_recent_activity_risk',
            'ncrb_theft_risk', 'ncrb_violence_risk', 'ncrb_robbery_risk',
            'ncrb_sexual_crime_risk', 'ncrb_cyber_crime_risk', 'ncrb_time_risk',
            'ncrb_seasonal_risk', 'weather_overall_risk', 'weather_temperature_risk',
            'weather_visibility_risk', 'weather_condition_risk', 'crowd_density_risk',
            'transportation_risk', 'language_barrier_risk'
        ]
    
    def prepare_features(self, tourist_data: Dict, location_data: Dict = None) -> np.ndarray:
        """
        Prepare enhanced features for safety score prediction including NCRB data
        
        Args:
            tourist_data: Tourist profile and behavior data
            location_data: Location coordinates and context
            
        Returns:
            Normalized feature array
        """
        features = []
        
        # Original features
        location_risk = tourist_data.get('location_risk', 5)
        time_risk = self._calculate_time_risk()
        group_risk = self._calculate_group_risk(tourist_data.get('group_size', 1))
        exp_risk = self._calculate_experience_risk(tourist_data.get('experience_level', 'beginner'))
        planning_risk = self._calculate_planning_risk(tourist_data.get('has_itinerary', False))
        age = tourist_data.get('age', 30)
        health_score = tourist_data.get('health_score', 8)
        
        features.extend([location_risk, time_risk, group_risk, exp_risk, planning_risk, age, health_score])
        
        # NCRB crime data features
        ncrb_features = self._get_ncrb_features(location_data, tourist_data)
        features.extend(ncrb_features)
        
        # Weather features
        weather_features = self._get_weather_features(location_data)
        features.extend(weather_features)
        
        # Additional contextual features
        crowd_density_risk = self._calculate_crowd_density_risk(location_data)
        transportation_risk = self._calculate_transportation_risk(tourist_data)
        language_barrier_risk = self._calculate_language_barrier_risk(tourist_data)
        
        features.extend([crowd_density_risk, transportation_risk, language_barrier_risk])
        
        return np.array(features).reshape(1, -1)
    
    def _get_ncrb_features(self, location_data: Dict, tourist_data: Dict) -> List[float]:
        """
        Get NCRB crime data features for the location
        """
        try:
            if location_data and 'latitude' in location_data and 'longitude' in location_data:
                crime_data = self.ncrb_service.get_crime_data_by_location(
                    location_data['latitude'],
                    location_data['longitude'],
                    location_data.get('radius_km', 10)
                )
                
                risk_factors = crime_data.get('risk_factors', {})
                
                return [
                    risk_factors.get('overall_risk', 5),
                    risk_factors.get('recent_activity_risk', 5),
                    risk_factors.get('theft_risk', 5),
                    risk_factors.get('violence_risk', 5),
                    risk_factors.get('robbery_risk', 5),
                    risk_factors.get('sexual_crime_risk', 5),
                    risk_factors.get('cyber_crime_risk', 5),
                    risk_factors.get('time_risk', 5),
                    risk_factors.get('seasonal_risk', 5)
                ]
            else:
                # Return default values if no location data
                return [5.0] * 9
                
        except Exception as e:
            logger.error(f"Error getting NCRB features: {e}")
            return [5.0] * 9
    
    def _calculate_time_risk(self) -> float:
        """Calculate time-based risk factor"""
        hour = datetime.now().hour
        if 22 <= hour or hour <= 6:  # Night time
            return 8.0
        elif 18 <= hour <= 22:  # Evening
            return 6.0
        else:  # Day time
            return 3.0
    
    def _calculate_group_risk(self, group_size: int) -> float:
        """Calculate group size risk factor"""
        if group_size == 1:
            return 8.0
        elif group_size <= 3:
            return 4.0
        else:
            return 2.0
    
    def _calculate_experience_risk(self, experience_level: str) -> float:
        """Calculate experience level risk factor"""
        risk_map = {
            'expert': 2.0,
            'intermediate': 5.0,
            'beginner': 8.0
        }
        return risk_map.get(experience_level, 5.0)
    
    def _calculate_planning_risk(self, has_itinerary: bool) -> float:
        """Calculate planning risk factor"""
        return 3.0 if has_itinerary else 7.0
    
    def _get_weather_features(self, location_data: Dict) -> List[float]:
        """Get weather-based risk features"""
        try:
            if not self.weather_service or not location_data:
                return [5.0, 5.0, 5.0, 5.0]  # Default values
            
            if 'latitude' in location_data and 'longitude' in location_data:
                weather_data = self.weather_service.get_weather_data(
                    location_data['latitude'],
                    location_data['longitude']
                )
                
                risk_factors = weather_data.get('risk_factors', {})
                
                return [
                    risk_factors.get('overall_weather_risk', 5.0),
                    risk_factors.get('temperature_risk', 5.0),
                    risk_factors.get('visibility_risk', 5.0),
                    risk_factors.get('condition_risk', 5.0)
                ]
            else:
                return [5.0, 5.0, 5.0, 5.0]
                
        except Exception as e:
            logger.error(f"Error getting weather features: {e}")
            return [5.0, 5.0, 5.0, 5.0]
    
    def _calculate_crowd_density_risk(self, location_data: Dict) -> float:
        """Calculate crowd density risk factor"""
        if not location_data:
            return 5.0
        
        crowd_density = location_data.get('crowd_density', 50)
        if crowd_density > 80:
            return 8.0
        elif crowd_density > 60:
            return 6.0
        elif crowd_density < 20:
            return 7.0
        else:
            return 4.0
    
    def _calculate_transportation_risk(self, tourist_data: Dict) -> float:
        """Calculate transportation risk factor"""
        transport_mode = tourist_data.get('transportation_mode', 'public')
        transport_risk_map = {
            'walking': 8.0,
            'public': 6.0,
            'private': 3.0,
            'ride_share': 4.0
        }
        return transport_risk_map.get(transport_mode, 5.0)
    
    def _calculate_language_barrier_risk(self, tourist_data: Dict) -> float:
        """Calculate language barrier risk factor"""
        local_language_known = tourist_data.get('local_language_known', False)
        return 7.0 if not local_language_known else 3.0
    
    def train_model(self, training_data: List[Dict]) -> Dict:
        """
        Train the enhanced safety score model
        
        Args:
            training_data: List of training examples with features and labels
            
        Returns:
            Training metrics and model performance
        """
        try:
            X = []
            y = []
            
            for data in training_data:
                features = self.prepare_features(
                    data.get('tourist_data', {}),
                    data.get('location_data', {})
                )
                X.append(features.flatten())
                y.append(data['safety_score'])
            
            X = np.array(X)
            y = np.array(y)
            
            # Split data for validation
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            self.is_trained = True
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Get feature importance
            feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
            
            # Save model
            joblib.dump(self.model, settings.SAFETY_MODEL_PATH)
            joblib.dump(self.scaler, settings.SAFETY_SCALER_PATH)
            
            training_metrics = {
                'accuracy': accuracy,
                'feature_importance': feature_importance,
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'model_type': 'Enhanced Random Forest with NCRB Data'
            }
            
            logger.info(f"Model trained successfully. Accuracy: {accuracy:.3f}")
            return training_metrics
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            raise
    
    def predict_safety_score(self, tourist_data: Dict, location_data: Dict = None) -> Dict:
        """
        Predict safety score with detailed breakdown
        
        Args:
            tourist_data: Tourist profile and behavior data
            location_data: Location coordinates and context
            
        Returns:
            Dictionary containing safety score and detailed analysis
        """
        try:
            if not self.is_trained:
                self._load_model()
            
            features = self.prepare_features(tourist_data, location_data)
            features_scaled = self.scaler.transform(features)
            
            # Get prediction
            score = self.model.predict(features_scaled)[0]
            score = max(1, min(10, int(score)))
            
            # Get prediction probabilities for confidence
            probabilities = self.model.predict_proba(features_scaled)[0]
            confidence = max(probabilities) * 100
            
            # Get feature contributions
            feature_contributions = self._get_feature_contributions(features[0])
            
            # Get NCRB data for recommendations
            ncrb_data = None
            safety_recommendations = []
            
            if location_data and 'latitude' in location_data and 'longitude' in location_data:
                ncrb_data = self.ncrb_service.get_crime_data_by_location(
                    location_data['latitude'],
                    location_data['longitude'],
                    location_data.get('radius_km', 10)
                )
                
                risk_factors = ncrb_data.get('risk_factors', {})
                safety_recommendations = self.ncrb_service.get_safety_recommendations(risk_factors)
            
            # Generate general safety recommendations based on score
            if score <= 3:
                safety_recommendations.extend([
                    "Area is very safe. Normal precautions sufficient.",
                    "Good location for solo travelers and families."
                ])
            elif score <= 6:
                safety_recommendations.extend([
                    "Moderate safety level. Stay alert and aware.",
                    "Consider traveling in groups during evening hours."
                ])
            else:
                safety_recommendations.extend([
                    "High risk area. Exercise extreme caution.",
                    "Avoid solo travel, especially at night.",
                    "Consider alternative locations or routes."
                ])
            
            return {
                'safety_score': score,
                'confidence': round(confidence, 2),
                'risk_level': self._get_risk_level(score),
                'feature_contributions': feature_contributions,
                'ncrb_data': ncrb_data,
                'safety_recommendations': safety_recommendations,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'enhanced_v1.0'
            }
            
        except Exception as e:
            logger.error(f"Error predicting safety score: {e}")
            return {
                'safety_score': 5,
                'confidence': 0,
                'risk_level': 'unknown',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _load_model(self):
        """Load pre-trained model"""
        try:
            self.model = joblib.load(settings.SAFETY_MODEL_PATH)
            self.scaler = joblib.load(settings.SAFETY_SCALER_PATH)
            self.is_trained = True
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.is_trained = False
    
    def _get_feature_contributions(self, features: np.ndarray) -> Dict:
        """Get individual feature contributions to the prediction"""
        contributions = {}
        for i, (name, value) in enumerate(zip(self.feature_names, features)):
            contributions[name] = {
                'value': round(float(value), 2),
                'importance': round(float(self.model.feature_importances_[i]), 4)
            }
        return contributions
    
    def _get_risk_level(self, score: int) -> str:
        """Convert numeric score to risk level"""
        if score <= 3:
            return 'low'
        elif score <= 6:
            return 'medium'
        else:
            return 'high'
    
    def generate_training_data(self, num_samples: int = 1000) -> List[Dict]:
        """
        Generate synthetic training data for model training
        """
        training_data = []
        
        for i in range(num_samples):
            # Generate random tourist data
            tourist_data = {
                'age': np.random.randint(18, 70),
                'group_size': np.random.randint(1, 8),
                'experience_level': np.random.choice(['beginner', 'intermediate', 'expert']),
                'has_itinerary': np.random.choice([True, False]),
                'health_score': np.random.randint(5, 10),
                'transportation_mode': np.random.choice(['walking', 'public', 'private', 'ride_share']),
                'local_language_known': np.random.choice([True, False])
            }
            
            # Generate random location data
            location_data = {
                'latitude': np.random.uniform(12.0, 35.0),  # India latitude range
                'longitude': np.random.uniform(68.0, 97.0),  # India longitude range
                'weather_condition': np.random.choice(['clear', 'cloudy', 'rainy', 'stormy', 'foggy']),
                'crowd_density': np.random.randint(10, 100)
            }
            
            # Generate realistic safety score based on features
            base_score = 5
            
            # Adjust based on tourist factors
            if tourist_data['group_size'] == 1:
                base_score += 2
            if tourist_data['experience_level'] == 'beginner':
                base_score += 1
            if not tourist_data['has_itinerary']:
                base_score += 1
            if tourist_data['transportation_mode'] == 'walking':
                base_score += 1
            if not tourist_data['local_language_known']:
                base_score += 1
            
            # Add some randomness
            safety_score = max(1, min(10, base_score + np.random.randint(-2, 3)))
            
            training_data.append({
                'tourist_data': tourist_data,
                'location_data': location_data,
                'safety_score': safety_score
            })
        
        return training_data
