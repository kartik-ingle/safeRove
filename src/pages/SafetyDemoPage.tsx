import React from 'react';
import EnhancedSafetyScore from '@/components/EnhancedSafetyScore';
import Navbar from '@/components/Navbar';

const SafetyDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Tourist Safety Score
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced safety prediction using real-time NCRB crime data, machine learning, 
            and comprehensive risk analysis for tourists in India.
          </p>
        </div>
        <EnhancedSafetyScore />
      </div>
    </div>
  );
};

export default SafetyDemoPage;
