import React, { useState } from 'react';
import { Shield, User, Lock, AlertTriangle, Loader, Wifi, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid credentials. Try admin_user/password123 or worker_user/password123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const fillCredentials = (userType: 'admin' | 'worker') => {
    setUsername(`${userType}_user`);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TrustSense</h1>
            <p className="text-gray-600">Real-Time Employee Trust Score System</p>
            
            {/* Firebase Status Indicators */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span>Firebase Connected</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <Database className="w-4 h-4" />
                <span>Real-time Sync</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4 text-center">Demo Credentials:</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                disabled={isLoading}
                className="w-full text-left p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-lg transition-all duration-200 border border-purple-200 disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Admin User</div>
                    <div className="text-sm text-gray-600">Full system access & monitoring</div>
                  </div>
                  <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    admin_user
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => fillCredentials('worker')}
                disabled={isLoading}
                className="w-full text-left p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all duration-200 border border-green-200 disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Worker User</div>
                    <div className="text-sm text-gray-600">Standard employee access</div>
                  </div>
                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    worker_user
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Enterprise-grade behavioral trust scoring with ML-powered anomaly detection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}