import React, { useState } from 'react';
import { 
  Shield, MapPin, Smartphone, Clock, CheckCircle, AlertCircle, XCircle, 
  Brain, Zap, RefreshCw, Globe, Wifi, Settings, TrendingUp 
} from 'lucide-react';
import { TrustScoreCard } from './TrustScoreCard';
import { useAuth } from '../context/AuthContext';
import { mockLocations, mockDevices } from '../utils/mockData';

export function WorkerDashboard() {
  const { 
    user, 
    trustMetrics, 
    currentLocation, 
    currentDevice, 
    refreshTrustScore, 
    isLoading,
    simulateLocationChange,
    simulateDeviceChange 
  } = useAuth();

  const [showSimulation, setShowSimulation] = useState(false);

  const getAccessLevel = () => {
    if (!trustMetrics) return 'unknown';
    if (trustMetrics.overallScore >= 80) return 'full';
    if (trustMetrics.overallScore >= 50) return 'limited';
    return 'blocked';
  };

  const getAccessLevelInfo = () => {
    const level = getAccessLevel();
    switch (level) {
      case 'full':
        return {
          icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
          title: 'Full Access Granted',
          description: 'You have access to all your assigned resources',
          color: 'text-emerald-600'
        };
      case 'limited':
        return {
          icon: <AlertCircle className="w-8 h-8 text-amber-600" />,
          title: 'Limited Access',
          description: 'Some features may require additional authentication',
          color: 'text-amber-600'
        };
      case 'blocked':
        return {
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          title: 'Access Restricted',
          description: 'Please contact your administrator for assistance',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Shield className="w-8 h-8 text-gray-600" />,
          title: 'Evaluating Access',
          description: 'Trust score is being calculated...',
          color: 'text-gray-600'
        };
    }
  };

  const accessInfo = getAccessLevelInfo();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username}!</h2>
              <p className="text-blue-100 mb-4">Your security status and access information</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Wifi className="w-4 h-4" />
                  <span>Real-time Monitoring</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Brain className="w-4 h-4" />
                  <span>ML-Enhanced Security</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{trustMetrics?.overallScore || '--'}</div>
              <div className="text-blue-200">Trust Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Score and Access Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {trustMetrics && (
            <TrustScoreCard
              score={trustMetrics.overallScore}
              riskLevel={trustMetrics.riskLevel}
              label="Your Trust Score"
              showTrend={true}
              mlEnhanced={true}
              factors={trustMetrics.factors}
            />
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Current Access Level
            </h3>
            <button
              onClick={refreshTrustScore}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          
          {trustMetrics && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {accessInfo.icon}
                <div>
                  <p className={`text-lg font-semibold ${accessInfo.color}`}>
                    {accessInfo.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {accessInfo.description}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Available Resources:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span>Employee Portal</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span>Time Tracking</span>
                  </div>
                  <div className="flex items-center">
                    {trustMetrics.overallScore >= 60 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span>Internal Documents</span>
                    {trustMetrics.overallScore < 60 && trustMetrics.overallScore >= 50 && (
                      <Zap className="w-4 h-4 text-amber-500 ml-1" title="MFA Required" />
                    )}
                  </div>
                  <div className="flex items-center">
                    {trustMetrics.overallScore >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span>Sensitive Data</span>
                    {trustMetrics.overallScore < 80 && trustMetrics.overallScore >= 50 && (
                      <Zap className="w-4 h-4 text-amber-500 ml-1" title="MFA Required" />
                    )}
                  </div>
                </div>
              </div>

              {trustMetrics.overallScore < 80 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-amber-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Multi-Factor Authentication Required
                      </p>
                      <p className="text-xs text-amber-700">
                        Additional verification needed for sensitive resources
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trust Score Breakdown */}
      {trustMetrics && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Score Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TrustScoreCard 
              score={trustMetrics.geoScore} 
              riskLevel={trustMetrics.factors.locationRisk ? 'high' : 'low'} 
              label="Location Trust" 
            />
            <TrustScoreCard 
              score={trustMetrics.deviceScore} 
              riskLevel={trustMetrics.factors.deviceRisk ? 'high' : 'low'} 
              label="Device Trust" 
            />
            <TrustScoreCard 
              score={trustMetrics.behaviorScore} 
              riskLevel={trustMetrics.factors.behaviorRisk ? 'high' : 'medium'} 
              label="Behavior Trust"
              mlEnhanced={true}
            />
            <TrustScoreCard 
              score={trustMetrics.timeScore} 
              riskLevel={trustMetrics.factors.timeRisk ? 'medium' : 'low'} 
              label="Time-based Trust" 
            />
          </div>
        </div>
      )}

      {/* Session Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Your Location
            </h3>
            <button
              onClick={() => setShowSimulation(!showSimulation)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          {currentLocation && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">City:</span>
                <span className="font-medium">{currentLocation.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium">{currentLocation.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timezone:</span>
                <span className="font-medium">{currentLocation.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IP Address:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {currentLocation.ipAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security Status:</span>
                <span className={`font-medium ${currentLocation.suspicious ? 'text-red-600' : 'text-emerald-600'}`}>
                  {currentLocation.suspicious ? 'Flagged' : 'Verified'}
                </span>
              </div>
            </div>
          )}

          {showSimulation && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Simulate location change:</p>
              <div className="space-y-2">
                {mockLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => simulateLocationChange(location)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="flex justify-between">
                      <span>{location.city}, {location.country}</span>
                      {location.suspicious && (
                        <span className="text-red-500 text-xs">⚠️ Suspicious</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
              Your Device
            </h3>
            <button
              onClick={() => setShowSimulation(!showSimulation)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          {currentDevice && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium">{currentDevice.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">OS:</span>
                <span className="font-medium">{currentDevice.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Browser:</span>
                <span className="font-medium">{currentDevice.browser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trust Status:</span>
                <span className={`font-medium ${currentDevice.trusted ? 'text-emerald-600' : 'text-red-600'}`}>
                  {currentDevice.trusted ? 'Trusted' : 'Unverified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">First Seen:</span>
                <span className="font-medium">{currentDevice.firstSeen.toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {showSimulation && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Simulate device change:</p>
              <div className="space-y-2">
                {mockDevices.map((device, index) => (
                  <button
                    key={index}
                    onClick={() => simulateDeviceChange(device)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="flex justify-between">
                      <span>{device.name}</span>
                      {!device.trusted && (
                        <span className="text-red-500 text-xs">⚠️ Untrusted</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Tips and ML Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Security Tips
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Use Trusted Devices</h4>
                <p className="text-sm text-gray-600">Access from recognized devices to maintain high trust scores.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Consistent Location</h4>
                <p className="text-sm text-gray-600">Regular access from familiar locations improves your security profile.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Regular Hours</h4>
                <p className="text-sm text-gray-600">Accessing during business hours helps maintain consistent patterns.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            ML Security Insights
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Behavioral Analysis</span>
                <span className="text-purple-600 text-sm">Active</span>
              </div>
              <p className="text-sm text-gray-600">AI monitors your access patterns for anomalies</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Risk Prediction</span>
                <span className="text-blue-600 text-sm">97.8%</span>
              </div>
              <p className="text-sm text-gray-600">Machine learning accuracy for threat detection</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Trust Optimization</span>
                <span className="text-green-600 text-sm">Enabled</span>
              </div>
              <p className="text-sm text-gray-600">Automatic adjustments based on your behavior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}