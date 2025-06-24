import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TrustMetrics, DeviceInfo, LocationInfo, AccessAttempt, SecurityAlert } from '../types';
import { mockUsers, mockDevices, mockLocations, generateMockAccessAttempts, mockSecurityAlerts } from '../utils/mockData';
import { TrustScoringEngine } from '../services/trustEngine';
import { FirebaseService } from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  trustMetrics: TrustMetrics | null;
  currentDevice: DeviceInfo | null;
  currentLocation: LocationInfo | null;
  accessAttempts: AccessAttempt[];
  securityAlerts: SecurityAlert[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshTrustScore: () => Promise<void>;
  simulateLocationChange: (location: LocationInfo) => void;
  simulateDeviceChange: (device: DeviceInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics | null>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [accessAttempts, setAccessAttempts] = useState<AccessAttempt[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  const [isLoading, setIsLoading] = useState(false);

  const trustEngine = TrustScoringEngine.getInstance();
  const firebaseService = FirebaseService.getInstance();

  useEffect(() => {
    // Initialize with mock data
    setCurrentDevice(mockDevices[0]);
    setCurrentLocation(mockLocations[0]);
    setAccessAttempts(generateMockAccessAttempts());

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (user) {
        // Simulate new access attempts
        const newAttempt = generateMockAccessAttempts()[0];
        setAccessAttempts(prev => [newAttempt, ...prev.slice(0, 49)]);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Set up Firebase real-time listeners
  useEffect(() => {
    if (user) {
      // Subscribe to trust score updates
      const unsubscribeTrust = firebaseService.subscribeTrustScore(
        user.id,
        (metrics) => {
          if (metrics) {
            setTrustMetrics(metrics);
            setUser(prev => prev ? { ...prev, trustScore: metrics.overallScore, riskLevel: metrics.riskLevel } : null);
          }
        }
      );

      // Subscribe to live access monitoring (admin only)
      let unsubscribeAccess: (() => void) | null = null;
      if (user.role === 'admin') {
        unsubscribeAccess = firebaseService.subscribeToLiveAccess((attempts) => {
          setAccessAttempts(attempts);
        });
      }

      // Subscribe to security alerts
      const unsubscribeAlerts = firebaseService.subscribeToSecurityAlerts((alerts) => {
        setSecurityAlerts(alerts);
      });

      return () => {
        unsubscribeTrust();
        unsubscribeAccess?.();
        unsubscribeAlerts();
      };
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(u => u.username === username);
      if (!foundUser || password !== 'password123') {
        return false;
      }

      setUser(foundUser);
      
      // Calculate initial trust score
      await refreshTrustScore();
      
      // Log access attempt to Firebase
      if (currentDevice && currentLocation) {
        const accessAttempt: AccessAttempt = {
          id: `login_${Date.now()}`,
          userId: foundUser.id,
          timestamp: new Date(),
          location: currentLocation,
          device: currentDevice,
          ipAddress: currentLocation.ipAddress,
          trustScore: foundUser.trustScore,
          accessGranted: true,
          accessLevel: trustEngine.determineAccessLevel(foundUser.trustScore),
          resource: 'Login Portal',
          mfaRequired: trustEngine.shouldRequireMFA(foundUser.trustScore, foundUser.riskLevel)
        };

        await firebaseService.logAccessAttempt(accessAttempt);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTrustMetrics(null);
    firebaseService.cleanup();
  };

  const refreshTrustScore = async () => {
    if (user && currentDevice && currentLocation) {
      setIsLoading(true);
      
      try {
        const behaviorContext = {
          rapidSuccessiveLogins: false,
          multipleFailedAttempts: false,
          unusualResourceAccess: false
        };

        const metrics = await trustEngine.calculateTrustScore(
          user,
          currentLocation,
          currentDevice,
          behaviorContext
        );

        setTrustMetrics(metrics);
        setUser(prev => prev ? { 
          ...prev, 
          trustScore: metrics.overallScore,
          riskLevel: metrics.riskLevel,
          lastLogin: new Date()
        } : null);

      } catch (error) {
        console.error('Error refreshing trust score:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const simulateLocationChange = (location: LocationInfo) => {
    setCurrentLocation(location);
    if (user) {
      // Trigger trust score recalculation
      setTimeout(refreshTrustScore, 500);
    }
  };

  const simulateDeviceChange = (device: DeviceInfo) => {
    setCurrentDevice(device);
    if (user) {
      // Trigger trust score recalculation
      setTimeout(refreshTrustScore, 500);
    }
  };

  // Auto-refresh trust score every 2 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshTrustScore, 120000);
      return () => clearInterval(interval);
    }
  }, [user, currentDevice, currentLocation]);

  return (
    <AuthContext.Provider value={{
      user,
      trustMetrics,
      currentDevice,
      currentLocation,
      accessAttempts,
      securityAlerts,
      isLoading,
      login,
      logout,
      refreshTrustScore,
      simulateLocationChange,
      simulateDeviceChange
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}