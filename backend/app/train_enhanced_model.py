"""
Training script for Enhanced Tourist Safety Score Model with NCRB Integration
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

def main():
    """Train the enhanced safety model with NCRB data integration"""
    
    # Initialize the enhanced model with NCRB API key
    ncrb_api_key = "579b464db66ec23bdd00000103f3e5383cc74a3a52239069a8495b74"
    model = EnhancedTouristSafetyScoreModel(ncrb_api_key)
    
    logger.info("Generating training data...")
    
    # Generate synthetic training data
    training_data = model.generate_training_data(num_samples=2000)
    
    logger.info(f"Generated {len(training_data)} training samples")
    
    # Train the model
    logger.info("Training enhanced safety model...")
    
    try:
        metrics = model.train_model(training_data)
        
        logger.info("Training completed successfully!")
        logger.info(f"Model Accuracy: {metrics['accuracy']:.3f}")
        logger.info(f"Training Samples: {metrics['training_samples']}")
        logger.info(f"Test Samples: {metrics['test_samples']}")
        
        # Print feature importance
        logger.info("\nFeature Importance:")
        for feature, importance in sorted(metrics['feature_importance'].items(), 
                                        key=lambda x: x[1], reverse=True):
            logger.info(f"  {feature}: {importance:.4f}")
        
        # Test the model with sample data
        logger.info("\nTesting model with sample data...")
        
        test_tourist_data = {
            'age': 25,
            'group_size': 1,
            'experience_level': 'beginner',
            'has_itinerary': False,
            'health_score': 8,
            'transportation_mode': 'walking',
            'local_language_known': False
        }
        
        test_location_data = {
            'latitude': 28.6139,  # Delhi
            'longitude': 77.2090,
            'weather_condition': 'clear',
            'crowd_density': 70
        }
        
        result = model.predict_safety_score(test_tourist_data, test_location_data)
        
        logger.info(f"\nSample Prediction:")
        logger.info(f"  Safety Score: {result['safety_score']}/10")
        logger.info(f"  Risk Level: {result['risk_level']}")
        logger.info(f"  Confidence: {result['confidence']}%")
        logger.info(f"  Recommendations: {len(result['safety_recommendations'])}")
        
        # Save training data for future use
        with open('enhanced_training_data.json', 'w') as f:
            json.dump(training_data, f, indent=2)
        
        logger.info(f"\nTraining data saved to enhanced_training_data.json")
        logger.info("Enhanced model training completed successfully!")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

if __name__ == "__main__":
    main()
