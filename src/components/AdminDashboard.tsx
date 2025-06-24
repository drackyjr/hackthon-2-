import React, { useState } from 'react';
import { 
  Users, Shield, Activity, AlertTriangle, Eye, MapPin, Smartphone, 
  Clock, Brain, Zap, Globe, Database, TrendingUp, Settings 
} from 'lucide-react';
import { TrustScoreCard } from './TrustScoreCard';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { mockLocations, mockDevices } from '../utils/mockData';

export function AdminDashboard() {
  const { user, trustMetrics, currentLocation, currentDevice, accessAttempts, securityAlerts } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const recentAttempts = accessAttempts.slice(0, 15);
  const blockedAttempts = accessAttempts.filter(a => a.accessLevel === 'blocked').length;
  const suspiciousAttempts = accessAttempts.filter(a => a.trustScore < 60).length;
  const mfaRequired = accessAttempts.filter(a => a.mfaRequired).length;
  const activeAlerts = securityAlerts.filter(a => !a.resolved).length;

  // Generate analytics data
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const attempts = accessAttempts.filter(a => {
      const attemptHour = a.timestamp.getHours();
      return attemptHour === hour;
    });
    
    return {
      hour: `${hour}:00`,
      attempts: attempts.length,
      blocked: attempts.filter(a => a.accessLevel === 'blocked').length,
      trustScore: Math.round(attempts.reduce((sum, a) => sum + a.trustScore, 0) / attempts.length) || 0,
      mfa: attempts.filter(a => a.mfaRequired).length
    };
  });

  const riskDistribution = [
    { name: 'Low Risk', value: accessAttempts.filter(a => a.trustScore >= 80).length, color: '#10b981' },
    { name: 'Medium Risk', value: accessAttempts.filter(a => a.trustScore >= 60 && a.trustScore < 80).length, color: '#f59e0b' },
    { name: 'High Risk', value: accessAttempts.filter(a => a.trustScore >= 40 && a.trustScore < 60).length, color: '#f97316' },
    { name: 'Critical Risk', value: accessAttempts.filter(a => a.trustScore < 40).length, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <p className="text-3xl font-bold">2,847</p>
              <p className="text-sm text-blue-200 mt-1">+12% this month</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Active Sessions</p>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm text-emerald-200 mt-1">Real-time</p>
            </div>
            <Activity className="w-12 h-12 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Blocked Access</p>
              <p className="text-3xl font-bold">{blockedAttempts}</p>
              <p className="text-sm text-red-200 mt-1">Last 24h</p>
            </div>
            <Shield className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">MFA Required</p>
              <p className="text-3xl font-bold">{mfaRequired}</p>
              <p className="text-sm text-amber-200 mt-1">Security triggers</p>
            </div>
            <Zap className="w-12 h-12 text-amber-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">ML Alerts</p>
              <p className="text-3xl font-bold">{activeAlerts}</p>
              <p className="text-sm text-purple-200 mt-1">AI-detected</p>
            </div>
            <Brain className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Trust Score and Real-time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          {trustMetrics && (
            <TrustScoreCard
              score={trustMetrics.overallScore}
              riskLevel={trustMetrics.riskLevel}
              label="My Trust Score"
              showTrend={true}
              mlEnhanced={true}
              factors={trustMetrics.factors}
            />
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Real-Time Security Analytics
            </h3>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={2} name="Total Attempts" />
              <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} name="Blocked" />
              <Line type="monotone" dataKey="mfa" stroke="#f59e0b" strokeWidth={2} name="MFA Required" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution and ML Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            ML Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Anomaly Detection</p>
                <p className="text-sm text-gray-600">RandomForest Model Active</p>
              </div>
              <div className="text-purple-600 font-bold">94.2%</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Behavioral Patterns</p>
                <p className="text-sm text-gray-600">Learning from 50K+ events</p>
              </div>
              <div className="text-blue-600 font-bold">Active</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Prediction Accuracy</p>
                <p className="text-sm text-gray-600">Last 30 days</p>
              </div>
              <div className="text-green-600 font-bold">97.8%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Session and Device Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Current Location
          </h3>
          {currentLocation && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">City:</span>
                <span className="font-medium">{currentLocation.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium">{currentLocation.country}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">IP Address:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{currentLocation.ipAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Score:</span>
                <span className={`font-medium ${currentLocation.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentLocation.riskScore}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentLocation.suspicious 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {currentLocation.suspicious ? 'Suspicious' : 'Trusted'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
            Current Device
          </h3>
          {currentDevice && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium">{currentDevice.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">OS:</span>
                <span className="font-medium">{currentDevice.os}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Browser:</span>
                <span className="font-medium">{currentDevice.browser}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Score:</span>
                <span className={`font-medium ${currentDevice.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentDevice.riskScore}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentDevice.trusted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentDevice.trusted ? 'Trusted' : 'Unverified'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Access Monitoring */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Live Access Monitoring
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <Database className="w-4 h-4" />
                <span>Firebase Sync</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAttempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{attempt.userId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {attempt.timestamp.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      {attempt.location.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`font-medium ${
                        attempt.trustScore >= 80 ? 'text-emerald-600' :
                        attempt.trustScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {attempt.trustScore}
                      </span>
                      {attempt.trustScore < 60 && (
                        <Brain className="w-4 h-4 ml-1 text-purple-500" title="ML Flagged" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      attempt.accessLevel === 'full' ? 'bg-emerald-100 text-emerald-800' :
                      attempt.accessLevel === 'limited' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {attempt.accessLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attempt.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attempt.mfaRequired && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        REQUIRED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}