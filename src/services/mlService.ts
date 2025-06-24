import { MLPrediction, TrustMetrics, User, DeviceInfo, LocationInfo } from '../types';

// Simulated ML Service that would interface with Python backend
export class MLService {
  private static instance: MLService;
  private modelLoaded = false;

  static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  // Simulate loading ML model (would be trust_model.pkl in real implementation)
  async loadModel(): Promise<void> {
    // Simulate model loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.modelLoaded = true;
    console.log('ML Trust Model loaded successfully');
  }

  // Anomaly detection using simulated ML model
  async detectAnomalies(
    user: User,
    currentLocation: LocationInfo,
    currentDevice: DeviceInfo,
    historicalData: {
      locations: LocationInfo[];
      devices: DeviceInfo[];
      accessPatterns: any[];
    }
  ): Promise<MLPrediction> {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    // Simulate feature extraction and ML prediction
    const features = this.extractFeatures(user, currentLocation, currentDevice, historicalData);
    
    // Simulate RandomForest/IsolationForest prediction
    const anomalyScore = this.calculateAnomalyScore(features);
    const isAnomaly = anomalyScore > 0.7;
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

    return {
      anomalyScore,
      isAnomaly,
      confidence,
      features
    };
  }

  private extractFeatures(
    user: User,
    currentLocation: LocationInfo,
    currentDevice: DeviceInfo,
    historicalData: any
  ) {
    // Geographic deviation
    const geoDeviation = this.calculateGeoDeviation(currentLocation, historicalData.locations);
    
    // Device variance
    const deviceVariance = this.calculateDeviceVariance(currentDevice, historicalData.devices);
    
    // Time anomaly
    const timeAnomaly = this.calculateTimeAnomaly();
    
    // Access pattern anomaly
    const accessPattern = this.calculateAccessPatternAnomaly(historicalData.accessPatterns);

    return {
      geoDeviation,
      deviceVariance,
      timeAnomaly,
      accessPattern
    };
  }

  private calculateGeoDeviation(current: LocationInfo, historical: LocationInfo[]): number {
    if (historical.length === 0) return 0.5;

    // Calculate average distance from historical locations
    const distances = historical.map(loc => 
      this.haversineDistance(current.coordinates, loc.coordinates)
    );
    
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    
    // Normalize to 0-1 scale (0 = normal, 1 = highly anomalous)
    return Math.min(avgDistance / 1000, 1); // 1000km as max normal distance
  }

  private calculateDeviceVariance(current: DeviceInfo, historical: DeviceInfo[]): number {
    if (historical.length === 0) return 0.8; // New device is suspicious

    const knownDevice = historical.find(d => d.fingerprint === current.fingerprint);
    if (knownDevice) return 0.1; // Known device, low variance

    // Check for similar devices (same OS, browser family)
    const similarDevices = historical.filter(d => 
      d.os === current.os || d.browser.split(' ')[0] === current.browser.split(' ')[0]
    );

    return similarDevices.length > 0 ? 0.4 : 0.8; // Partial match vs completely new
  }

  private calculateTimeAnomaly(): number {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Business hours: Mon-Fri 8AM-6PM
    if (day >= 1 && day <= 5 && hour >= 8 && hour <= 18) return 0.1;
    
    // Extended hours: Mon-Fri 6AM-8PM
    if (day >= 1 && day <= 5 && hour >= 6 && hour <= 20) return 0.3;
    
    // Weekend or night access
    return 0.7;
  }

  private calculateAccessPatternAnomaly(patterns: any[]): number {
    // Simulate access pattern analysis
    // In real implementation, this would analyze:
    // - Frequency of access
    // - Resources accessed
    // - Session duration
    // - Navigation patterns
    
    return Math.random() * 0.4; // Random value for simulation
  }

  private calculateAnomalyScore(features: any): number {
    // Simulate ensemble model prediction
    const weights = {
      geoDeviation: 0.3,
      deviceVariance: 0.25,
      timeAnomaly: 0.2,
      accessPattern: 0.25
    };

    return (
      features.geoDeviation * weights.geoDeviation +
      features.deviceVariance * weights.deviceVariance +
      features.timeAnomaly * weights.timeAnomaly +
      features.accessPattern * weights.accessPattern
    );
  }

  private haversineDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Batch prediction for multiple users (admin dashboard)
  async batchPredict(users: User[]): Promise<Map<string, MLPrediction>> {
    const predictions = new Map<string, MLPrediction>();
    
    for (const user of users) {
      // Simulate batch prediction
      const mockPrediction: MLPrediction = {
        anomalyScore: Math.random(),
        isAnomaly: Math.random() > 0.8,
        confidence: Math.random() * 0.3 + 0.7,
        features: {
          geoDeviation: Math.random(),
          deviceVariance: Math.random(),
          timeAnomaly: Math.random(),
          accessPattern: Math.random()
        }
      };
      
      predictions.set(user.id, mockPrediction);
    }
    
    return predictions;
  }
}