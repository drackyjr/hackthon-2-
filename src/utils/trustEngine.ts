import { TrustMetrics, User, AccessAttempt, DeviceInfo, LocationInfo } from '../types';

// Simulated ML-based trust scoring engine
export class TrustScoringEngine {
  private static instance: TrustScoringEngine;
  private userBaselines: Map<string, any> = new Map();

  static getInstance(): TrustScoringEngine {
    if (!TrustScoringEngine.instance) {
      TrustScoringEngine.instance = new TrustScoringEngine();
    }
    return TrustScoringEngine.instance;
  }

  calculateTrustScore(
    user: User,
    location: LocationInfo,
    device: DeviceInfo,
    behaviorContext: any
  ): TrustMetrics {
    const geoScore = this.calculateGeoScore(user.id, location);
    const deviceScore = this.calculateDeviceScore(user.id, device);
    const behaviorScore = this.calculateBehaviorScore(user.id, behaviorContext);
    const timeScore = this.calculateTimeScore(user.id);

    // Weighted average with ML-like feature importance
    const overallScore = Math.round(
      geoScore * 0.3 + 
      deviceScore * 0.25 + 
      behaviorScore * 0.35 + 
      timeScore * 0.1
    );

    const riskLevel = this.determineRiskLevel(overallScore);

    return {
      geoScore,
      deviceScore,
      behaviorScore,
      timeScore,
      overallScore,
      riskLevel
    };
  }

  private calculateGeoScore(userId: string, location: LocationInfo): number {
    // Simulate geolocation risk assessment
    const baseline = this.getUserBaseline(userId);
    
    if (location.suspicious) return 20;
    
    // Calculate distance from usual locations
    const distanceFromBaseline = this.calculateDistance(
      location.coordinates,
      baseline.usualLocation
    );
    
    if (distanceFromBaseline > 1000) return 40; // Long distance
    if (distanceFromBaseline > 100) return 70;  // Medium distance
    return 95; // Normal location
  }

  private calculateDeviceScore(userId: string, device: DeviceInfo): number {
    const baseline = this.getUserBaseline(userId);
    
    if (!device.trusted) return 30;
    if (!baseline.knownDevices.includes(device.fingerprint)) return 50;
    
    // Device age and consistency
    const daysSinceFirstSeen = Math.floor(
      (Date.now() - device.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceFirstSeen > 30) return 95; // Well-established device
    if (daysSinceFirstSeen > 7) return 80;  // Recent but known
    return 60; // New device
  }

  private calculateBehaviorScore(userId: string, context: any): number {
    // Simulate behavioral analysis
    const baseline = this.getUserBaseline(userId);
    let score = 85;

    // Login time patterns
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) score -= 20; // Unusual hours

    // Access patterns
    if (context.rapidSuccessiveLogins) score -= 30;
    if (context.multipleFailedAttempts) score -= 40;
    if (context.unusualResourceAccess) score -= 25;

    return Math.max(score, 10);
  }

  private calculateTimeScore(userId: string): number {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const day = currentTime.getDay();

    // Business hours (Mon-Fri, 8AM-6PM) get higher scores
    if (day >= 1 && day <= 5 && hour >= 8 && hour <= 18) return 95;
    if (day >= 1 && day <= 5 && (hour >= 6 && hour < 8) || (hour > 18 && hour <= 20)) return 80;
    if (day === 0 || day === 6) return 60; // Weekends
    return 40; // Night hours
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  private getUserBaseline(userId: string): any {
    if (!this.userBaselines.has(userId)) {
      // Initialize baseline data
      this.userBaselines.set(userId, {
        usualLocation: [40.7128, -74.0060], // Default to NYC
        knownDevices: ['device-fp-1', 'device-fp-2'],
        usualHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        accessPatterns: []
      });
    }
    return this.userBaselines.get(userId);
  }

  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  determineAccessLevel(trustScore: number): 'full' | 'limited' | 'blocked' {
    if (trustScore >= 80) return 'full';
    if (trustScore >= 50) return 'limited';
    return 'blocked';
  }
}