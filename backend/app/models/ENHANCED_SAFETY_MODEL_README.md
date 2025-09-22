# Enhanced Tourist Safety Score Model with NCRB Integration

## Overview

The Enhanced Tourist Safety Score Model is an advanced machine learning system that predicts tourist safety scores using real-time crime data from the National Crime Records Bureau (NCRB) and comprehensive risk analysis. This model provides detailed safety assessments, risk factor analysis, and personalized safety recommendations for tourists.

## Features

### 🛡️ **Comprehensive Risk Analysis**
- **NCRB Crime Data Integration**: Real-time crime statistics from National Crime Records Bureau
- **Location-based Risk Assessment**: Geographic risk analysis with radius-based crime data
- **Temporal Risk Factors**: Time-of-day, seasonal, and weather-based risk calculations
- **Tourist Profile Analysis**: Experience level, group size, planning status, and health factors

### 🤖 **Advanced Machine Learning**
- **Random Forest Classifier**: 200 estimators with optimized hyperparameters
- **Feature Engineering**: 20+ risk factors including NCRB crime data
- **Real-time Predictions**: Live safety score calculation with confidence metrics
- **Feature Importance Analysis**: Detailed breakdown of contributing risk factors

### 📊 **Rich Data Integration**
- **NCRB API Integration**: Crime statistics by location and time
- **Weather Data**: Environmental risk factors
- **Crowd Density Analysis**: Population density risk assessment
- **Transportation Risk**: Mode-specific safety analysis

## API Endpoints

### Enhanced Safety Score Prediction
```http
POST /api/safety/enhanced-score
Content-Type: application/json

{
  "tourist_data": {
    "age": 25,
    "group_size": 1,
    "experience_level": "beginner",
    "has_itinerary": false,
    "health_score": 8,
    "transportation_mode": "walking",
    "local_language_known": false
  },
  "location_data": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "weather_condition": "clear",
    "crowd_density": 70
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "safety_score": 7,
    "confidence": 85.2,
    "risk_level": "high",
    "feature_contributions": {
      "ncrb_overall_risk": {"value": 8.5, "importance": 0.15},
      "group_risk": {"value": 8.0, "importance": 0.12},
      "time_risk": {"value": 8.0, "importance": 0.10}
    },
    "ncrb_data": {
      "state": "Delhi",
      "district": "New Delhi",
      "crime_statistics": {
        "total_crimes": 1250,
        "recent_crimes": 45,
        "crime_rate_per_100k": 125.5
      },
      "risk_factors": {
        "overall_risk": 8.5,
        "recent_activity_risk": 7.2,
        "theft_risk": 6.8
      }
    },
    "safety_recommendations": [
      "High crime area detected. Consider alternative routes or times.",
      "Solo travel risk elevated. Avoid isolated areas and travel in groups if possible.",
      "Night time travel risk. Consider daytime alternatives or use trusted transportation."
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "model_version": "enhanced_v1.0"
  }
}
```

### NCRB Crime Data
```http
GET /api/ncrb/crime-data?latitude=28.6139&longitude=77.2090&radius_km=10
```

### Model Training
```http
POST /api/safety/train-enhanced
Content-Type: application/json

{
  "training_data": [
    {
      "tourist_data": {...},
      "location_data": {...},
      "safety_score": 7
    }
  ]
}
```

## Model Architecture

### Feature Set (20 Features)

#### Traditional Risk Factors
1. **location_risk**: Geographic risk score (1-10)
2. **time_risk**: Time-of-day risk factor
3. **group_risk**: Group size risk assessment
4. **exp_risk**: Tourist experience level risk
5. **planning_risk**: Trip planning status risk
6. **age**: Tourist age factor
7. **health_score**: Health condition score

#### NCRB Crime Data Features
8. **ncrb_overall_risk**: Overall crime risk from NCRB
9. **ncrb_recent_activity_risk**: Recent crime activity risk
10. **ncrb_theft_risk**: Theft-specific risk
11. **ncrb_violence_risk**: Violence-related risk
12. **ncrb_robbery_risk**: Robbery risk assessment
13. **ncrb_sexual_crime_risk**: Sexual crime risk
14. **ncrb_cyber_crime_risk**: Cyber crime risk
15. **ncrb_time_risk**: Time-based crime risk
16. **ncrb_seasonal_risk**: Seasonal crime patterns

#### Contextual Features
17. **weather_risk**: Weather condition risk
18. **crowd_density_risk**: Population density risk
19. **transportation_risk**: Transportation mode risk
20. **language_barrier_risk**: Language barrier risk

### Model Performance
- **Algorithm**: Random Forest Classifier
- **Estimators**: 200 trees
- **Max Depth**: 15
- **Min Samples Split**: 5
- **Min Samples Leaf**: 2
- **Accuracy**: ~85-90% (varies by training data)

## Usage Examples

### Python Integration
```python
from enhanced_safety_model import EnhancedTouristSafetyScoreModel

# Initialize model with NCRB API key
model = EnhancedTouristSafetyScoreModel("your_ncrb_api_key")

# Predict safety score
tourist_data = {
    'age': 25,
    'group_size': 1,
    'experience_level': 'beginner',
    'has_itinerary': False,
    'health_score': 8,
    'transportation_mode': 'walking',
    'local_language_known': False
}

location_data = {
    'latitude': 28.6139,
    'longitude': 77.2090,
    'weather_condition': 'clear',
    'crowd_density': 70
}

result = model.predict_safety_score(tourist_data, location_data)
print(f"Safety Score: {result['safety_score']}/10")
print(f"Risk Level: {result['risk_level']}")
```

### Training the Model
```python
# Generate training data
training_data = model.generate_training_data(num_samples=2000)

# Train the model
metrics = model.train_model(training_data)
print(f"Model Accuracy: {metrics['accuracy']:.3f}")
```

## Safety Score Interpretation

### Score Ranges
- **1-3**: Very Safe (Low Risk)
  - Green indicators
  - Minimal safety concerns
  - Suitable for all tourist types

- **4-6**: Moderately Safe (Medium Risk)
  - Yellow indicators
  - Some safety considerations
  - Basic precautions recommended

- **7-10**: High Risk (High Risk)
  - Red indicators
  - Significant safety concerns
  - Enhanced precautions required

### Risk Levels
- **Low**: Score 1-3, minimal risk factors
- **Medium**: Score 4-6, moderate risk factors
- **High**: Score 7-10, significant risk factors

## NCRB Data Integration

### Crime Categories Tracked
- Theft and Burglary
- Robbery and Mugging
- Assault and Violence
- Fraud and Scams
- Cyber Crimes
- Domestic Violence
- Sexual Offenses
- Other Criminal Activities

### Risk Factor Calculations
- **Overall Risk**: Based on total crime count
- **Recent Activity Risk**: Crimes in last 30 days
- **Category-specific Risks**: Individual crime type analysis
- **Temporal Patterns**: Time and seasonal adjustments

## Safety Recommendations

The model generates personalized safety recommendations based on:
- Risk level assessment
- Specific crime patterns
- Tourist profile factors
- Environmental conditions
- Time and location context

### Example Recommendations
- "High crime area detected. Consider alternative routes or times."
- "Solo travel risk elevated. Avoid isolated areas and travel in groups if possible."
- "Night time travel risk. Consider daytime alternatives or use trusted transportation."
- "High theft risk. Keep valuables secure and avoid displaying expensive items."

## Installation and Setup

### Backend Dependencies
```bash
pip install scikit-learn numpy pandas requests
```

### Environment Variables
```env
NCRB_API_KEY=your_ncrb_api_key_here
```

### Model Files
- `enhanced_safety_model.py`: Main model implementation
- `ncrb_service.py`: NCRB API integration service
- `safety_score_model.pkl`: Trained model file
- `safety_score_scaler.pkl`: Feature scaler file

## Testing

### Run Model Tests
```bash
python test_enhanced_model.py
```

### Run Training
```bash
python train_enhanced_model.py
```

### API Testing
```bash
# Test enhanced safety score
curl -X POST http://localhost:8000/api/safety/enhanced-score \
  -H "Content-Type: application/json" \
  -d '{"tourist_data": {...}, "location_data": {...}}'

# Test NCRB data
curl "http://localhost:8000/api/ncrb/crime-data?latitude=28.6139&longitude=77.2090"
```

## Frontend Integration

The model includes a React component (`EnhancedSafetyScore.tsx`) that provides:
- Interactive safety score prediction
- Real-time risk factor analysis
- NCRB crime data visualization
- Personalized safety recommendations
- Feature contribution breakdown

## Future Enhancements

- **Real-time Data Streaming**: Live crime data updates
- **Mobile App Integration**: GPS-based safety alerts
- **Multi-language Support**: Localized recommendations
- **Social Media Integration**: Crowd-sourced safety data
- **Predictive Analytics**: Incident probability forecasting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please contact the development team or create an issue in the repository.
