import React from 'react';
import { Shield, LogOut, User, Bell, Wifi, RefreshCw, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout, trustMetrics, isLoading, refreshTrustScore } = useAuth();

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TrustSense</h1>
              <p className="text-sm text-gray-600">Real-Time Trust Scoring</p>
            </div>
          </div>

          {/* Real-time Status Indicators */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span>Live Sync</span>
            </div>
            <div className="flex items-center space-x-1 text-purple-600">
              <Brain className="w-4 h-4" />
              <span>ML Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Trust Score Display */}
          {trustMetrics && (
            <div className="hidden sm:flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trustMetrics.overallScore)}`}>
                Trust: {trustMetrics.overallScore}
              </div>
              <button
                onClick={refreshTrustScore}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Trust Score"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{user?.username}</div>
              <div className="text-xs text-gray-600 capitalize flex items-center space-x-1">
                <span>{user?.role}</span>
                {user?.role === 'admin' && (
                  <span className="bg-purple-100 text-purple-700 px-1 rounded text-xs">ADMIN</span>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}