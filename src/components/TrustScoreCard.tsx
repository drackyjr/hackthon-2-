import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, TrendingUp, TrendingDown, Brain } from 'lucide-react';

interface TrustScoreCardProps {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  label?: string;
  showTrend?: boolean;
  mlEnhanced?: boolean;
  factors?: {
    locationRisk: boolean;
    deviceRisk: boolean;
    timeRisk: boolean;
    behaviorRisk: boolean;
  };
}

export function TrustScoreCard({ 
  score, 
  riskLevel, 
  label = 'Trust Score',
  showTrend = false,
  mlEnhanced = false,
  factors
}: TrustScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <ShieldCheck className="w-8 h-8 text-emerald-600" />;
      case 'medium':
        return <Shield className="w-8 h-8 text-amber-600" />;
      case 'high':
        return <ShieldAlert className="w-8 h-8 text-orange-600" />;
      case 'critical':
        return <ShieldX className="w-8 h-8 text-red-600" />;
      default:
        return <Shield className="w-8 h-8 text-gray-600" />;
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
            {mlEnhanced && (
              <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                <Brain className="w-3 h-3" />
                <span>ML</span>
              </div>
            )}
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(riskLevel)}`}>
            {riskLevel.toUpperCase()} RISK
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showTrend && (
            <div className="flex items-center">
              {Math.random() > 0.5 ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
          {getScoreIcon(riskLevel)}
        </div>
      </div>
      
      <div className="mb-4">
        <div className={`text-4xl font-bold ${getScoreColor(score)} mb-1`}>
          {score}
        </div>
        <div className="text-sm text-gray-500">out of 100</div>
      </div>

      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${getProgressColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0</span>
          <span>50</span>
          <span>80</span>
          <span>100</span>
        </div>
      </div>

      {factors && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center space-x-1 ${factors.locationRisk ? 'text-red-600' : 'text-green-600'}`}>
              <div className={`w-2 h-2 rounded-full ${factors.locationRisk ? 'bg-red-500' : 'bg-green-500'}`} />
              <span>Location</span>
            </div>
            <div className={`flex items-center space-x-1 ${factors.deviceRisk ? 'text-red-600' : 'text-green-600'}`}>
              <div className={`w-2 h-2 rounded-full ${factors.deviceRisk ? 'bg-red-500' : 'bg-green-500'}`} />
              <span>Device</span>
            </div>
            <div className={`flex items-center space-x-1 ${factors.timeRisk ? 'text-red-600' : 'text-green-600'}`}>
              <div className={`w-2 h-2 rounded-full ${factors.timeRisk ? 'bg-red-500' : 'bg-green-500'}`} />
              <span>Time</span>
            </div>
            <div className={`flex items-center space-x-1 ${factors.behaviorRisk ? 'text-red-600' : 'text-green-600'}`}>
              <div className={`w-2 h-2 rounded-full ${factors.behaviorRisk ? 'bg-red-500' : 'bg-green-500'}`} />
              <span>Behavior</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}