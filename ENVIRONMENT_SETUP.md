# Environment Setup Guide

## 1. Fix Safari Backdrop Filter Issue ✅
The `-webkit-backdrop-filter` prefixes have been added to support Safari 9+.

## 2. Supabase Database Setup

### Step 1: Run the SQL Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase_schema.sql`
4. Click "Run" to create all tables and functions

### Step 2: Environment Variables
Create a `.env.local` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
VITE_WEATHER_API_KEY=ERBNWFCSPDFBZPP97S7QFGCS9
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Backend API
VITE_BACKEND_API_URL=http://localhost:8000
```

### Step 3: Backend Environment
Create a `.env` file in the `backend/` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# API Keys
NCRB_API_KEY=579b464db66ec23bdd00000103f3e5383cc74a3a52239069a8495b74
WEATHER_API_KEY=ERBNWFCSPDFBZPP97S7QFGCS9

# Model Paths
ENHANCED_SAFETY_MODEL_PATH=./models/enhanced_safety_model.pkl
ENHANCED_SAFETY_SCALER_PATH=./models/enhanced_safety_scaler.pkl
```

## 3. Database Tables Created

The schema creates these main tables:

- **users** - User profiles and authentication
- **tourist_profiles** - Tourist preferences and experience levels
- **locations** - Tourist spots, monuments, hotels, etc.
- **trips** - User trip planning
- **safety_incidents** - Reported safety issues
- **emergency_contacts** - Local emergency services
- **safety_alerts** - Real-time safety warnings
- **tourist_checkins** - Real-time location tracking
- **chat_messages** - Chatbot conversation history
- **weather_data** - Weather information
- **crime_data** - NCRB crime statistics

## 4. Key Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Geospatial Support** - PostGIS for location-based queries
- **Real-time Updates** - Supabase real-time subscriptions
- **Automatic Timestamps** - Created/updated timestamps
- **Sample Data** - Pre-populated with major tourist locations

## 5. Next Steps

1. Run the SQL schema in Supabase
2. Update your environment variables
3. Restart your development servers
4. Test the database connections

The console errors should be resolved once the backend is running and environment variables are set.
