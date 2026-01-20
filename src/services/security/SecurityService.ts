import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionService, EncryptionService } from './EncryptionService';
import { authService, AuthenticationService } from './AuthenticationService';

// Secure storage keys for sensitive data
const SECURE_STORAGE_KEYS = {
  USER_CREDENTIALS: '@secure_user_credentials',
  PERSONAL_DATA: '@secure_personal_data',
  HEALTH_DATA: '@secure_health_data',
  API_TOKENS: '@secure_api_tokens',
  SENSITIVE_PREFERENCES: '@secure_preferences',
};

// Sensitive data that should be encrypted
export interface SensitiveUserData {
  email?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  insuranceInfo?: string;
}

export interface SensitiveHealthData {
  heartRate?: number;
  bloodPressure?: string;
  bloodSugar?: number;
  cholesterol?: number;
  otherMetrics?: Record<string, any>;
}

// Security service that combines encryption and secure storage
export class SecurityService {
  private static instance: SecurityService;
  private encryptionService: EncryptionService;
  private authService: AuthenticationService;

  private constructor() {
    this.encryptionService = encryptionService;
    this.authService = authService;
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Initialize security services
  async initialize(): Promise<boolean> {
    try {
      // Initialize authentication session
      const hasSession = await this.authService.initializeSession();
      console.log('Security initialized, session active:', hasSession);
      return true;
    } catch (error) {
      console.error('Security initialization failed:', error);
      return false;
    }
  }

  // Securely store user credentials
  async storeCredentials(email: string, password: string): Promise<boolean> {
    try {
      if (!this.authService.isAuthenticated()) {
        throw new Error('User must be authenticated to store credentials');
      }

      // Encrypt sensitive data
      const encryptedCredentials = this.encryptionService.encryptObject({
        email,
        password,
      });
      await AsyncStorage.setItem(
        SECURE_STORAGE_KEYS.USER_CREDENTIALS,
        encryptedCredentials
      );
      return true;
    } catch (error) {
      console.error('Failed to store credentials:', error);
      return false;
    }
  }

  // Retrieve and decrypt user credentials
  async getCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      if (!this.authService.isAuthenticated()) {
        return null;
      }

      const stored = await AsyncStorage.getItem(
        SECURE_STORAGE_KEYS.USER_CREDENTIALS
      );
      if (!stored) return null;

      return this.encryptionService.decryptObject(stored);
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return null;
    }
  }

  // Securely store personal data
  async storePersonalData(data: SensitiveUserData): Promise<boolean> {
    try {
      if (!this.authService.isAuthenticated()) {
        throw new Error('User must be authenticated to store personal data');
      }

      const encryptedData = this.encryptionService.encryptObject(data);
      await AsyncStorage.setItem(
        SECURE_STORAGE_KEYS.PERSONAL_DATA,
        encryptedData
      );
      return true;
    } catch (error) {
      console.error('Failed to store personal data:', error);
      return false;
    }
  }

  // Retrieve and decrypt personal data
  async getPersonalData(): Promise<SensitiveUserData | null> {
    try {
      if (!this.authService.isAuthenticated()) {
        return null;
      }

      const stored = await AsyncStorage.getItem(
        SECURE_STORAGE_KEYS.PERSONAL_DATA
      );
      if (!stored) return null;

      return this.encryptionService.decryptObject(stored);
    } catch (error) {
      console.error('Failed to get personal data:', error);
      return null;
    }
  }

  // Securely store health data
  async storeHealthData(data: SensitiveHealthData): Promise<boolean> {
    try {
      if (!this.authService.isAuthenticated()) {
        throw new Error('User must be authenticated to store health data');
      }

      const encryptedData = this.encryptionService.encryptObject(data);
      await AsyncStorage.setItem(
        SECURE_STORAGE_KEYS.HEALTH_DATA,
        encryptedData
      );
      return true;
    } catch (error) {
      console.error('Failed to store health data:', error);
      return false;
    }
  }

  // Retrieve and decrypt health data
  async getHealthData(): Promise<SensitiveHealthData | null> {
    try {
      if (!this.authService.isAuthenticated()) {
        return null;
      }

      const stored = await AsyncStorage.getItem(
        SECURE_STORAGE_KEYS.HEALTH_DATA
      );
      if (!stored) return null;

      return this.encryptionService.decryptObject(stored);
    } catch (error) {
      console.error('Failed to get health data:', error);
      return null;
    }
  }

  // Store API tokens securely
  async storeAPITokens(tokens: Record<string, string>): Promise<boolean> {
    try {
      if (!this.authService.isAuthenticated()) {
        throw new Error('User must be authenticated to store API tokens');
      }

      const encryptedTokens = this.encryptionService.encryptObject(tokens);
      await AsyncStorage.setItem(
        SECURE_STORAGE_KEYS.API_TOKENS,
        encryptedTokens
      );
      return true;
    } catch (error) {
      console.error('Failed to store API tokens:', error);
      return false;
    }
  }

  // Retrieve API tokens
  async getAPITokens(): Promise<Record<string, string> | null> {
    try {
      if (!this.authService.isAuthenticated()) {
        return null;
      }

      const stored = await AsyncStorage.getItem(SECURE_STORAGE_KEYS.API_TOKENS);
      if (!stored) return null;

      return this.encryptionService.decryptObject(stored);
    } catch (error) {
      console.error('Failed to get API tokens:', error);
      return null;
    }
  }

  // Securely store sensitive preferences
  async storePreferences(preferences: Record<string, any>): Promise<boolean> {
    try {
      if (!this.authService.isAuthenticated()) {
        throw new Error('User must be authenticated to store preferences');
      }

      const encryptedPrefs = this.encryptionService.encryptObject(preferences);
      await AsyncStorage.setItem(
        SECURE_STORAGE_KEYS.SENSITIVE_PREFERENCES,
        encryptedPrefs
      );
      return true;
    } catch (error) {
      console.error('Failed to store preferences:', error);
      return false;
    }
  }

  // Retrieve preferences
  async getPreferences(): Promise<Record<string, any> | null> {
    try {
      if (!this.authService.isAuthenticated()) {
        return null;
      }

      const stored = await AsyncStorage.getItem(
        SECURE_STORAGE_KEYS.SENSITIVE_PREFERENCES
      );
      if (!stored) return null;

      return this.encryptionService.decryptObject(stored);
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  // Clear all sensitive data (logout)
  async clearAllSensitiveData(): Promise<void> {
    await AsyncStorage.multiRemove([
      SECURE_STORAGE_KEYS.USER_CREDENTIALS,
      SECURE_STORAGE_KEYS.PERSONAL_DATA,
      SECURE_STORAGE_KEYS.HEALTH_DATA,
      SECURE_STORAGE_KEYS.API_TOKENS,
      SECURE_STORAGE_KEYS.SENSITIVE_PREFERENCES,
    ]);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Login
  async login(email: string, password: string): Promise<boolean> {
    const result = await this.authService.login({ email, password });
    if (result.success) {
      // Store credentials securely after successful login
      await this.storeCredentials(email, password);
    }
    return result.success;
  }

  // Logout
  async logout(): Promise<void> {
    await this.clearAllSensitiveData();
    await this.authService.logout();
  }

  // Get current user
  async getCurrentUser() {
    return await this.authService.getCurrentUser();
  }

  // Refresh session if needed
  async refreshSessionIfNeeded(): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    // Check if token is expiring soon (within 5 minutes)
    // This is a simplified check - in production you'd decode the JWT
    const token = this.authService.getSessionToken();
    if (!token) {
      return false;
    }

    return true;
  }

  // Update activity (call this on user interaction)
  updateActivity(): void {
    this.authService.updateActivity();
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
