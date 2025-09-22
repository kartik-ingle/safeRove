"""
Test script for Enhanced Tourist Safety Score Model with NCRB Integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_safety_model import EnhancedTouristSafetyScoreModel
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_enhanced_safety_model():
    """Test the enhanced safety model with various scenarios"""
    
    # Initialize the enhanced model
    ncrb_api_key = "579b464db66ec23bdd00000103f3e5383cc74a3a52239069a8495b74"
    model = EnhancedTouristSafetyScoreModel(ncrb_api_key)
    
    # Test scenarios
    test_scenarios = [
        {
            "name": "Solo Beginner Tourist in Delhi",
            "tourist_data": {
                'age': 22,
                'group_size': 1,
                'experience_level': 'beginner',
                'has_itinerary': False,
                'health_score': 7,
                'transportation_mode': 'walking',
                'local_language_known': False
            },
            "location_data": {
                'latitude': 28.6139,  # Delhi
                'longitude': 77.2090,
                'weather_condition': 'clear',
                'crowd_density': 80
            }
        },
        {
            "name": "Experienced Group in Mumbai",
            "tourist_data": {
                'age': 35,
                'group_size': 4,
                'experience_level': 'expert',
                'has_itinerary': True,
                'health_score': 9,
                'transportation_mode': 'private',
                'local_language_known': True
            },
            "location_data": {
                'latitude': 19.0760,  # Mumbai
                'longitude': 72.8777,
                'weather_condition': 'cloudy',
                'crowd_density': 60
            }
        },
        {
            "name": "Family with Children in Bangalore",
            "tourist_data": {
                'age': 40,
                'group_size': 5,
                'experience_level': 'intermediate',
                'has_itinerary': True,
                'health_score': 8,
                'transportation_mode': 'ride_share',
                'local_language_known': False
            },
            "location_data": {
                'latitude': 12.9716,  # Bangalore
                'longitude': 77.5946,
                'weather_condition': 'rainy',
                'crowd_density': 50
            }
        },
        {
            "name": "Solo Female Tourist at Night",
            "tourist_data": {
                'age': 28,
                'group_size': 1,
                'experience_level': 'intermediate',
                'has_itinerary': False,
                'health_score': 8,
                'transportation_mode': 'public',
                'local_language_known': False
            },
            "location_data": {
                'latitude': 26.9124,  # Jaipur
                'longitude': 75.7873,
                'weather_condition': 'clear',
                'crowd_density': 30
            }
        }
    ]
    
    logger.info("Testing Enhanced Tourist Safety Score Model")
    logger.info("=" * 50)
    
    for i, scenario in enumerate(test_scenarios, 1):
        logger.info(f"\nTest Scenario {i}: {scenario['name']}")
        logger.info("-" * 40)
        
        try:
            result = model.predict_safety_score(
                scenario['tourist_data'], 
                scenario['location_data']
            )
            
            logger.info(f"Safety Score: {result['safety_score']}/10")
            logger.info(f"Risk Level: {result['risk_level']}")
            logger.info(f"Confidence: {result['confidence']}%")
            
            # Show top contributing factors
            logger.info("\nTop Contributing Factors:")
            contributions = result.get('feature_contributions', {})
            sorted_contributions = sorted(
                contributions.items(), 
                key=lambda x: x[1]['importance'], 
                reverse=True
            )[:5]
            
            for feature, data in sorted_contributions:
                logger.info(f"  {feature}: {data['value']} (importance: {data['importance']:.3f})")
            
            # Show safety recommendations
            recommendations = result.get('safety_recommendations', [])
            if recommendations:
                logger.info(f"\nSafety Recommendations ({len(recommendations)}):")
                for j, rec in enumerate(recommendations[:3], 1):  # Show top 3
                    logger.info(f"  {j}. {rec}")
            
            # Show NCRB data if available
            ncrb_data = result.get('ncrb_data')
            if ncrb_data and ncrb_data.get('data_source') != 'default':
                logger.info(f"\nNCRB Crime Data:")
                crime_stats = ncrb_data.get('crime_statistics', {})
                logger.info(f"  Total Crimes: {crime_stats.get('total_crimes', 0)}")
                logger.info(f"  Recent Crimes: {crime_stats.get('recent_crimes', 0)}")
                logger.info(f"  Crime Rate: {crime_stats.get('crime_rate_per_100k', 0):.2f} per 100k")
            
        except Exception as e:
            logger.error(f"Error testing scenario {i}: {e}")
    
    logger.info("\n" + "=" * 50)
    logger.info("Enhanced Safety Model Testing Completed!")

def test_ncrb_service():
    """Test NCRB service directly"""
    
    logger.info("\nTesting NCRB Service Directly")
    logger.info("=" * 30)
    
    ncrb_api_key = "579b464db66ec23bdd00000103f3e5383cc74a3a52239069a8495b74"
    model = EnhancedTouristSafetyScoreModel(ncrb_api_key)
    
    # Test locations
    test_locations = [
        {"name": "Delhi", "lat": 28.6139, "lon": 77.2090},
        {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
        {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946}
    ]
    
    for location in test_locations:
        logger.info(f"\nTesting NCRB data for {location['name']}:")
        try:
            crime_data = model.ncrb_service.get_crime_data_by_location(
                location['lat'], location['lon'], 10
            )
            
            logger.info(f"  State: {crime_data.get('state', 'Unknown')}")
            logger.info(f"  District: {crime_data.get('district', 'Unknown')}")
            logger.info(f"  Data Source: {crime_data.get('data_source', 'Unknown')}")
            
            crime_stats = crime_data.get('crime_statistics', {})
            logger.info(f"  Total Crimes: {crime_stats.get('total_crimes', 0)}")
            logger.info(f"  Recent Crimes: {crime_stats.get('recent_crimes', 0)}")
            
            risk_factors = crime_data.get('risk_factors', {})
            logger.info(f"  Overall Risk: {risk_factors.get('overall_risk', 5)}/10")
            logger.info(f"  Recent Activity Risk: {risk_factors.get('recent_activity_risk', 5)}/10")
            
        except Exception as e:
            logger.error(f"  Error fetching NCRB data: {e}")

if __name__ == "__main__":
    test_enhanced_safety_model()
    test_ncrb_service()
