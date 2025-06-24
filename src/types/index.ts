export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'worker';
  department: string;
  createdAt: Date;
  lastLogin: Date;
  trustScore: number;
  status: 'active' | 'suspended' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TrustMetrics {
  userId: string;
  geoScore: number;
  deviceScore: number;
  behaviorScore: number;
  timeScore: number;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  factors: {
    locationRisk: boolean;
    deviceRisk: boolean;
    timeRisk: boolean;
    behaviorRisk: boolean;
  };
}

export interface AccessAttempt {
  id: string;
  userId: string;
  timestamp: Date;
  location: LocationInfo;
  device: DeviceInfo;
  ipAddress: string;
  trustScore: number;
  accessGranted: boolean;
  accessLevel: 'full' | 'limited' | 'blocked';
  resource: string;
  reason?: string;
  mfaRequired?: boolean;
  adminOverride?: boolean;
}

export interface DeviceInfo {
  id: string;
  fingerprint: string;
  name: string;
  type: 'desktop' | 'laptop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  trusted: boolean;
  firstSeen: Date;
  lastSeen: Date;
  riskScore: number;
}

export interface LocationInfo {
  city: string;
  country: string;
  region: string;
  coordinates: [number, number];
  timezone: string;
  ipAddress: string;
  suspicious: boolean;
  riskScore: number;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  type: 'location_anomaly' | 'device_anomaly' | 'behavior_anomaly' | 'access_blocked' | 'mfa_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface MLPrediction {
  anomalyScore: number;
  isAnomaly: boolean;
  confidence: number;
  features: {
    geoDeviation: number;
    deviceVariance: number;
    timeAnomaly: number;
    accessPattern: number;
  };
}

export interface FirebaseUserProfile {
  uid: string;
  profile: User;
  trustMetrics: TrustMetrics;
  devices: DeviceInfo[];
  locations: LocationInfo[];
  accessHistory: AccessAttempt[];
  securityAlerts: SecurityAlert[];
}