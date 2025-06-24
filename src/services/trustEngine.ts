import { TrustMetrics, User, DeviceInfo, LocationInfo, SecurityAlert } from '../types';
import { MLService } from './mlService';
import { FirebaseService } from './firebaseService';

export class TrustScoringEngine {
  private static instance: TrustScoringEngine;
  private mlService: MLService;
  private firebaseService: FirebaseService;
  private userBaselines: Map<string, any> = new Map();

  private constructor() {
    this.mlService = MLService.getInstance();
    this.firebaseService = FirebaseService.getInstance();
  }

  static getInstance(): TrustScoringEngine {
    if (!TrustScoringEngine.instance) {
      TrustScoringEngine.instance = new TrustScoringEngine();
    }
    return TrustScoringEngine.instance;
  }

  async calculateTrustScore(
    user: User,
    location: LocationInfo,
    device: DeviceInfo,
    behaviorContext: any = {}
  ): Promise<TrustMetrics> {
    try {
      // Get ML-based anomaly detection
      const historicalData = await this.getHistoricalData(user.id);
      const mlPrediction = await this.mlService.detectAnomalies(
        user, location, device, historicalData
      );

      // Calculate individual component scores
      const geoScore = await this.calculateGeoScore(user.id, location, mlPrediction.features.geoDeviation);
      const deviceScore = await this.calculateDeviceScore(user.id, device, mlPrediction.features.deviceVariance);
      const behaviorScore = await this.calculateBehaviorScore(user.id, behaviorContext, mlPrediction.features.accessPattern);
      const timeScore = this.calculateTimeScore(mlPrediction.features.timeAnomaly);

      // ML-enhanced weighted scoring
      const mlWeight = mlPrediction.confidence;
      const baseWeight = 1 - mlWeight;

      // Base scoring weights
      const baseScore = Math.round(
        geoScore * 0.3 + 
        deviceScore * 0.25 + 
        behaviorScore * 0.35 + 
        timeScore * 0.1
      );

      // ML-adjusted score
      const mlAdjustment = mlPrediction.isAnomaly ? -30 : 10;
      const overallScore = Math.max(0, Math.min(100, 
        baseScore * baseWeight + (baseScore + mlAdjustment) * mlWeight
      ));

      const riskLevel = this.determineRiskLevel(overallScore, mlPrediction.isAnomaly);

      const trustMetrics: TrustMetrics = {
        userId: user.id,
        geoScore,
        deviceScore,
        behaviorScore,
        timeScore,
        overallScore: Math.round(overallScore),
        riskLevel,
        lastUpdated: new Date(),
        factors: {
          locationRisk: mlPrediction.features.geoDeviation > 0.6,
          deviceRisk: mlPrediction.features.deviceVariance > 0.6,
          timeRisk: mlPrediction.features.timeAnomaly > 0.6,
          behaviorRisk: mlPrediction.isAnomaly
        }
      };

      // Update Firebase with new trust metrics
      await this.firebaseService.updateTrustMetrics(user.id, trustMetrics);

      // Generate security alerts if needed
      await this.checkAndGenerateAlerts(user, trustMetrics, mlPrediction);

      return trustMetrics;

    } catch (error) {
      console.error('Error calculating trust score:', error);
      // Return default safe score on error
      return this.getDefaultTrustMetrics(user.id);
    }
  }

  private async calculateGeoScore(userId: string, location: LocationInfo, mlGeoDeviation: number): Promise<number> {
    if (location.suspicious) return 20;

    // Use ML-enhanced geo scoring
    const baseScore = location.riskScore ? (100 - location.riskScore) : 85;
    const mlAdjustment = mlGeoDeviation * 40; // 0-40 point reduction based on ML
    
    return Math.max(20, Math.round(baseScore - mlAdjustment));
  }

  private async calculateDeviceScore(userId: string, device: DeviceInfo, mlDeviceVariance: number): Promise<number> {
    if (!device.trusted) return 30;

    const baseScore = device.riskScore ? (100 - device.riskScore) : 90;
    const mlAdjustment = mlDeviceVariance * 35; // 0-35 point reduction
    
    // Device age factor
    const daysSinceFirstSeen = Math.floor(
      (Date.now() - device.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let ageBonus = 0;
    if (daysSinceFirstSeen > 90) ageBonus = 10;
    else if (daysSinceFirstSeen > 30) ageBonus = 5;

    return Math.max(30, Math.round(baseScore - mlAdjustment + ageBonus));
  }

  private async calculateBehaviorScore(userId: string, context: any, mlAccessPattern: number): Promise<number> {
    let score = 85;

    // Traditional behavior checks
    if (context.rapidSuccessiveLogins) score -= 25;
    if (context.multipleFailedAttempts) score -= 35;
    if (context.unusualResourceAccess) score -= 20;

    // ML-enhanced behavior scoring
    const mlAdjustment = mlAccessPattern * 30; // 0-30 point reduction
    score -= mlAdjustment;

    return Math.max(10, Math.round(score));
  }

  private calculateTimeScore(mlTimeAnomaly: number): number {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const day = currentTime.getDay();

    let baseScore = 60;

    // Business hours scoring
    if (day >= 1 && day <= 5 && hour >= 8 && hour <= 18) baseScore = 95;
    else if (day >= 1 && day <= 5 && ((hour >= 6 && hour < 8) || (hour > 18 && hour <= 20))) baseScore = 80;
    else if (day === 0 || day === 6) baseScore = 65;

    // ML adjustment
    const mlAdjustment = mlTimeAnomaly * 25;
    
    return Math.max(20, Math.round(baseScore - mlAdjustment));
  }

  private determineRiskLevel(score: number, mlAnomaly: boolean): 'low' | 'medium' | 'high' | 'critical' {
    if (mlAnomaly && score < 70) return 'critical';
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  private async checkAndGenerateAlerts(user: User, metrics: TrustMetrics, mlPrediction: any): Promise<void> {
    const alerts: SecurityAlert[] = [];

    // ML-based anomaly alert
    if (mlPrediction.isAnomaly && mlPrediction.confidence > 0.8) {
      alerts.push({
        id: `ml_anomaly_${Date.now()}`,
        userId: user.id,
        type: 'behavior_anomaly',
        severity: metrics.riskLevel === 'critical' ? 'critical' : 'high',
        message: `ML model detected anomalous behavior (confidence: ${(mlPrediction.confidence * 100).toFixed(1)}%)`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Location-based alerts
    if (metrics.factors.locationRisk) {
      alerts.push({
        id: `location_${Date.now()}`,
        userId: user.id,
        type: 'location_anomaly',
        severity: 'medium',
        message: 'Access from unusual location detected',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Device-based alerts
    if (metrics.factors.deviceRisk) {
      alerts.push({
        id: `device_${Date.now()}`,
        userId: user.id,
        type: 'device_anomaly',
        severity: 'medium',
        message: 'Access from unrecognized or suspicious device',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Access blocked alert
    if (metrics.overallScore < 50) {
      alerts.push({
        id: `blocked_${Date.now()}`,
        userId: user.id,
        type: 'access_blocked',
        severity: 'high',
        message: `Access blocked due to low trust score (${metrics.overallScore})`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Send alerts to Firebase
    for (const alert of alerts) {
      await this.firebaseService.createSecurityAlert(alert);
    }
  }

  private async getHistoricalData(userId: string) {
    // In real implementation, this would fetch from Firebase
    return {
      locations: [],
      devices: [],
      accessPatterns: []
    };
  }

  private getDefaultTrustMetrics(userId: string): TrustMetrics {
    return {
      userId,
      geoScore: 50,
      deviceScore: 50,
      behaviorScore: 50,
      timeScore: 50,
      overallScore: 50,
      riskLevel: 'medium',
      lastUpdated: new Date(),
      factors: {
        locationRisk: false,
        deviceRisk: false,
        timeRisk: false,
        behaviorRisk: false
      }
    };
  }

  determineAccessLevel(trustScore: number): 'full' | 'limited' | 'blocked' {
    if (trustScore >= 80) return 'full';
    if (trustScore >= 50) return 'limited';
    return 'blocked';
  }

  shouldRequireMFA(trustScore: number, riskLevel: string): boolean {
    return trustScore < 80 || riskLevel === 'high' || riskLevel === 'critical';
  }
}