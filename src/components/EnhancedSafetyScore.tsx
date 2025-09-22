import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, MapPin, Clock, Users, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import axios from 'axios';

interface SafetyScoreResult {
  safety_score: number;
  confidence: number;
  risk_level: string;
  feature_contributions: Record<string, { value: number; importance: number }>;
  ncrb_data?: any;
  safety_recommendations: string[];
  timestamp: string;
  model_version: string;
}

interface TouristData {
  age: number;
  group_size: number;
  experience_level: string;
  has_itinerary: boolean;
  health_score: number;
  transportation_mode: string;
  local_language_known: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  weather_condition: string;
  crowd_density: number;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

const EnhancedSafetyScore: React.FC = () => {
  const [touristData, setTouristData] = useState<TouristData>({
    age: 25,
    group_size: 1,
    experience_level: 'beginner',
    has_itinerary: false,
    health_score: 8,
    transportation_mode: 'public',
    local_language_known: false
  });

  const [locationData, setLocationData] = useState<LocationData>({
    latitude: 28.6139,
    longitude: 77.2090,
    weather_condition: 'clear',
    crowd_density: 50
  });

  const [result, setResult] = useState<SafetyScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictSafetyScore = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/safety/enhanced-score`, {
        tourist_data: touristData,
        location_data: locationData,
      });
      
      if (response.data.status === 'ok') {
        setResult(response.data.result);
      } else {
        setError('Failed to get safety score');
      }
    } catch (err: any) {
      console.error('Error predicting safety score:', err);
      setError(err.response?.data?.message || err.message || 'Failed to predict safety score');
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First generate training data
      const generateResponse = await axios.post(`${API_BASE_URL}/api/safety/generate-training-data`, {
        num_samples: 1000,
      });
      
      if (generateResponse.data.status === 'ok') {
        // Then train the model
        const trainResponse = await axios.post(`${API_BASE_URL}/api/safety/train-enhanced`, {
          training_data: generateResponse.data.training_data,
        });
        
        if (trainResponse.data.status === 'ok') {
          setError(null);
          // Show success message
          console.log('Model trained successfully:', trainResponse.data.message);
        } else {
          setError('Failed to train model');
        }
      } else {
        setError('Failed to generate training data');
      }
    } catch (err: any) {
      console.error('Error training model:', err);
      setError(err.response?.data?.message || err.message || 'Failed to train model');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/safety/enhanced-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourist_data: touristData,
          location_data: locationData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get safety score');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Enhanced Tourist Safety Score with NCRB Data
          </CardTitle>
          <CardDescription>
            Get comprehensive safety predictions using real-time crime data from NCRB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tourist Data Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={touristData.age}
                onChange={(e) => setTouristData({...touristData, age: parseInt(e.target.value) || 25})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="group_size">Group Size</Label>
              <Input
                id="group_size"
                type="number"
                min="1"
                value={touristData.group_size}
                onChange={(e) => setTouristData({...touristData, group_size: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={touristData.experience_level}
                onValueChange={(value) => setTouristData({...touristData, experience_level: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transportation">Transportation Mode</Label>
              <Select
                value={touristData.transportation_mode}
                onValueChange={(value) => setTouristData({...touristData, transportation_mode: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="public">Public Transport</SelectItem>
                  <SelectItem value="private">Private Vehicle</SelectItem>
                  <SelectItem value="ride_share">Ride Share</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Data Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={locationData.latitude}
                onChange={(e) => setLocationData({...locationData, latitude: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={locationData.longitude}
                onChange={(e) => setLocationData({...locationData, longitude: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weather">Weather Condition</Label>
              <Select
                value={locationData.weather_condition}
                onValueChange={(value) => setLocationData({...locationData, weather_condition: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rainy">Rainy</SelectItem>
                  <SelectItem value="stormy">Stormy</SelectItem>
                  <SelectItem value="foggy">Foggy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="crowd_density">Crowd Density (%)</Label>
              <Input
                id="crowd_density"
                type="number"
                min="0"
                max="100"
                value={locationData.crowd_density}
                onChange={(e) => setLocationData({...locationData, crowd_density: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={predictSafetyScore} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Get Enhanced Safety Score'
              )}
            </Button>
            <Button onClick={trainModel} disabled={loading} variant="outline">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Train Model'
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Safety Score Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold">{result.safety_score}/10</div>
                  <Badge className={`${getRiskLevelColor(result.risk_level)} text-white`}>
                    {getRiskLevelIcon(result.risk_level)}
                    <span className="ml-1 capitalize">{result.risk_level} Risk</span>
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Confidence: {result.confidence}%
                </div>
              </div>
              
              <Progress value={result.safety_score * 10} className="h-2" />
              
              <div className="text-sm text-muted-foreground">
                Model Version: {result.model_version} | 
                Generated: {new Date(result.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Feature Contributions */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Factor Analysis</CardTitle>
              <CardDescription>Contributing factors to the safety score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.feature_contributions)
                  .sort(([,a], [,b]) => b.importance - a.importance)
                  .slice(0, 8)
                  .map(([feature, data]) => (
                    <div key={feature} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm font-medium capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                      <div className="text-right">
                        <div className="text-sm">{data.value.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">
                          {data.importance.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* NCRB Crime Data */}
          {result.ncrb_data && result.ncrb_data.data_source !== 'default' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  NCRB Crime Data
                </CardTitle>
                <CardDescription>
                  Real-time crime statistics from National Crime Records Bureau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{result.ncrb_data.crime_statistics.total_crimes}</div>
                    <div className="text-sm text-muted-foreground">Total Crimes</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{result.ncrb_data.crime_statistics.recent_crimes}</div>
                    <div className="text-sm text-muted-foreground">Recent (30 days)</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">
                      {result.ncrb_data.crime_statistics.crime_rate_per_100k.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Rate per 100k</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{result.ncrb_data.risk_factors.overall_risk.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Overall Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.safety_recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedSafetyScore;
