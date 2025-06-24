import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  set, 
  push, 
  onValue, 
  off,
  serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';
import { db, realtimeDb } from '../config/firebase';
import { User, TrustMetrics, AccessAttempt, SecurityAlert, DeviceInfo, LocationInfo } from '../types';

export class FirebaseService {
  private static instance: FirebaseService;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // User Profile Management
  async createUserProfile(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Trust Metrics Management
  async updateTrustMetrics(userId: string, metrics: TrustMetrics): Promise<void> {
    try {
      // Update in Firestore for persistence
      await setDoc(doc(db, 'trustMetrics', userId), {
        ...metrics,
        lastUpdated: serverTimestamp()
      });

      // Update in Realtime Database for live sync
      await set(ref(realtimeDb, `trustScores/${userId}`), {
        ...metrics,
        lastUpdated: rtdbServerTimestamp()
      });
    } catch (error) {
      console.error('Error updating trust metrics:', error);
      throw error;
    }
  }

  // Real-time Trust Score Listener
  subscribeTrustScore(userId: string, callback: (metrics: TrustMetrics | null) => void): () => void {
    const trustRef = ref(realtimeDb, `trustScores/${userId}`);
    
    const unsubscribe = onValue(trustRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback({
          ...data,
          lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date()
        });
      } else {
        callback(null);
      }
    });

    this.listeners.set(`trust_${userId}`, () => off(trustRef));
    return unsubscribe;
  }

  // Access Attempt Logging
  async logAccessAttempt(attempt: AccessAttempt): Promise<void> {
    try {
      // Log to Firestore for persistence
      await addDoc(collection(db, 'accessAttempts'), {
        ...attempt,
        timestamp: serverTimestamp()
      });

      // Push to Realtime Database for live monitoring
      await push(ref(realtimeDb, `liveAccess/${attempt.userId}`), {
        ...attempt,
        timestamp: rtdbServerTimestamp()
      });

      // Update user's last login
      await this.updateUserProfile(attempt.userId, {
        lastLogin: new Date(),
        trustScore: attempt.trustScore
      } as Partial<User>);

    } catch (error) {
      console.error('Error logging access attempt:', error);
      throw error;
    }
  }

  // Security Alerts
  async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      await addDoc(collection(db, 'securityAlerts'), {
        ...alert,
        timestamp: serverTimestamp()
      });

      // Push to real-time alerts for immediate notification
      await push(ref(realtimeDb, 'liveAlerts'), {
        ...alert,
        timestamp: rtdbServerTimestamp()
      });
    } catch (error) {
      console.error('Error creating security alert:', error);
      throw error;
    }
  }

  // Live Access Monitoring for Admins
  subscribeToLiveAccess(callback: (attempts: AccessAttempt[]) => void): () => void {
    const accessRef = ref(realtimeDb, 'liveAccess');
    
    const unsubscribe = onValue(accessRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const attempts: AccessAttempt[] = [];
        
        Object.keys(data).forEach(userId => {
          Object.values(data[userId]).forEach((attempt: any) => {
            attempts.push({
              ...attempt,
              timestamp: new Date(attempt.timestamp)
            });
          });
        });
        
        // Sort by timestamp descending
        attempts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        callback(attempts.slice(0, 50)); // Latest 50 attempts
      } else {
        callback([]);
      }
    });

    this.listeners.set('live_access', () => off(accessRef));
    return unsubscribe;
  }

  // Live Security Alerts for Admins
  subscribeToSecurityAlerts(callback: (alerts: SecurityAlert[]) => void): () => void {
    const alertsRef = ref(realtimeDb, 'liveAlerts');
    
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const alerts: SecurityAlert[] = Object.values(data).map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        }));
        
        // Sort by timestamp descending
        alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        callback(alerts.slice(0, 20)); // Latest 20 alerts
      } else {
        callback([]);
      }
    });

    this.listeners.set('security_alerts', () => off(alertsRef));
    return unsubscribe;
  }

  // Device Management
  async updateDeviceInfo(userId: string, device: DeviceInfo): Promise<void> {
    try {
      await setDoc(doc(db, 'devices', `${userId}_${device.fingerprint}`), {
        ...device,
        userId,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating device info:', error);
      throw error;
    }
  }

  // Location Tracking
  async updateLocationInfo(userId: string, location: LocationInfo): Promise<void> {
    try {
      await addDoc(collection(db, 'locations'), {
        ...location,
        userId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating location info:', error);
      throw error;
    }
  }

  // Cleanup listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}