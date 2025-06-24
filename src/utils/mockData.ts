import { User, DeviceInfo, LocationInfo, AccessAttempt } from '../types';

export const mockUsers: User[] = [
  {
    id: 'admin_user',
    username: 'admin_user',
    email: 'admin@trustsense.com',
    role: 'admin',
    department: 'IT Security',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365), // 1 year ago
    lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    trustScore: 92,
    status: 'active',
    riskLevel: 'low'
  },
  {
    id: 'worker_user',
    username: 'worker_user',
    email: 'worker@trustsense.com',
    role: 'worker',
    department: 'Operations',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), // 6 months ago
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    trustScore: 76,
    status: 'active',
    riskLevel: 'medium'
  }
];

export const mockDevices: DeviceInfo[] = [
  {
    id: 'device-1',
    fingerprint: 'fp_chrome_win11_12345',
    name: 'Work Laptop - Windows 11',
    type: 'laptop',
    os: 'Windows 11 Pro',
    browser: 'Chrome 119.0.6045.105',
    trusted: true,
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    lastSeen: new Date(),
    riskScore: 5
  },
  {
    id: 'device-2',
    fingerprint: 'fp_safari_ios17_67890',
    name: 'iPhone 15 Pro',
    type: 'mobile',
    os: 'iOS 17.1.1',
    browser: 'Safari 17.1',
    trusted: true,
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    riskScore: 10
  },
  {
    id: 'device-3',
    fingerprint: 'fp_firefox_ubuntu_11111',
    name: 'Unknown Linux Device',
    type: 'desktop',
    os: 'Ubuntu 22.04',
    browser: 'Firefox 119.0',
    trusted: false,
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
    riskScore: 75
  }
];

export const mockLocations: LocationInfo[] = [
  {
    city: 'New York',
    country: 'United States',
    region: 'NY',
    coordinates: [40.7128, -74.0060],
    timezone: 'America/New_York',
    ipAddress: '192.168.1.100',
    suspicious: false,
    riskScore: 5
  },
  {
    city: 'San Francisco',
    country: 'United States',
    region: 'CA',
    coordinates: [37.7749, -122.4194],
    timezone: 'America/Los_Angeles',
    ipAddress: '10.0.0.50',
    suspicious: false,
    riskScore: 10
  },
  {
    city: 'Moscow',
    country: 'Russia',
    region: 'MOW',
    coordinates: [55.7558, 37.6176],
    timezone: 'Europe/Moscow',
    ipAddress: '185.220.101.42',
    suspicious: true,
    riskScore: 85
  },
  {
    city: 'Lagos',
    country: 'Nigeria',
    region: 'LA',
    coordinates: [6.5244, 3.3792],
    timezone: 'Africa/Lagos',
    ipAddress: '41.203.72.15',
    suspicious: true,
    riskScore: 90
  }
];

export function generateMockAccessAttempts(): AccessAttempt[] {
  const attempts: AccessAttempt[] = [];
  const now = Date.now();
  const resources = [
    'Employee Portal',
    'Admin Dashboard', 
    'Payroll System',
    'Customer Database',
    'Financial Reports',
    'HR Management',
    'Inventory System',
    'Analytics Platform'
  ];

  for (let i = 0; i < 100; i++) {
    const userId = Math.random() > 0.3 ? 'admin_user' : 'worker_user';
    const trustScore = Math.floor(Math.random() * 100);
    const accessLevel = trustScore >= 80 ? 'full' : trustScore >= 50 ? 'limited' : 'blocked';
    const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
    
    attempts.push({
      id: `attempt-${i}`,
      userId,
      timestamp: new Date(now - Math.random() * 1000 * 60 * 60 * 24 * 30), // Last 30 days
      location,
      device,
      ipAddress: location.ipAddress,
      trustScore,
      accessGranted: accessLevel !== 'blocked',
      accessLevel,
      resource: resources[Math.floor(Math.random() * resources.length)],
      reason: accessLevel === 'blocked' ? 'Trust score below threshold' : undefined,
      mfaRequired: trustScore < 80 && trustScore >= 50,
      adminOverride: Math.random() < 0.05 // 5% chance of admin override
    });
  }

  return attempts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const mockSecurityAlerts = [
  {
    id: 'alert-1',
    userId: 'worker_user',
    type: 'location_anomaly' as const,
    severity: 'medium' as const,
    message: 'Login detected from unusual location: Moscow, Russia',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    resolved: false
  },
  {
    id: 'alert-2',
    userId: 'admin_user',
    type: 'device_anomaly' as const,
    severity: 'high' as const,
    message: 'Access attempt from unrecognized device',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    resolved: true,
    resolvedBy: 'admin_user',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  },
  {
    id: 'alert-3',
    userId: 'worker_user',
    type: 'behavior_anomaly' as const,
    severity: 'critical' as const,
    message: 'ML model detected anomalous behavior pattern (confidence: 94.2%)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    resolved: false
  }
];