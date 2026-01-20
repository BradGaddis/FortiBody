import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionService } from './EncryptionService';

// Authentication state types
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  sessionToken: string | null;
  refreshToken: string | null;
  lastActivity: Date | null;
  expiresAt: Date | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  sessionToken?: string;
  refreshToken?: string;
  error?: string;
}

// Authentication errors
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Session configuration
const SESSION_CONFIG = {
  TOKEN_KEY: '@auth_session_token',
  REFRESH_TOKEN_KEY: '@auth_refresh_token',
  USER_KEY: '@auth_user',
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_INACTIVE_PERIOD_MINUTES: 60,
};

// Authentication service
export class AuthenticationService {
  private static instance: AuthenticationService;
  private sessionToken: string | null = null;
  private refreshToken: string | null = null;
  private lastActivity: Date | null = null;
  private expiresAt: Date | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  // Initialize session from storage
  async initializeSession(): Promise<boolean> {
    try {
      // Load stored tokens
      const storedToken = await AsyncStorage.getItem(SESSION_CONFIG.TOKEN_KEY);
      const storedRefreshToken = await AsyncStorage.getItem(
        SESSION_CONFIG.REFRESH_TOKEN_KEY
      );
      const storedUser = await AsyncStorage.getItem(SESSION_CONFIG.USER_KEY);
      const storedLastActivity = await AsyncStorage.getItem(
        '@auth_last_activity'
      );
      const storedExpiresAt = await AsyncStorage.getItem('@auth_expires_at');

      if (storedToken && storedRefreshToken && storedUser) {
        this.sessionToken = storedToken;
        this.refreshToken = storedRefreshToken;
        this.lastActivity = storedLastActivity
          ? new Date(storedLastActivity)
          : null;
        this.expiresAt = storedExpiresAt ? new Date(storedExpiresAt) : null;

        // Check if session is still valid
        if (this.isSessionValid()) {
          this.startSessionMonitoring();
          return true;
        } else {
          // Session expired, clear
          await this.clearSession();
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      return false;
    }
  }

  // Login with credentials
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Simulate authentication - replace with actual auth API call
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate credentials format
      if (!this.validateEmail(credentials.email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      if (credentials.password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters',
        };
      }

      // Create user (simulated - in production, this comes from backend)
      const user: AuthUser = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      // Generate tokens
      const sessionToken = encryptionService.generateSecureToken(32);
      const refreshToken = encryptionService.generateSecureToken(32);

      // Store session
      await this.storeSession(user, sessionToken, refreshToken);

      return {
        success: true,
        user,
        sessionToken,
        refreshToken,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    await this.clearSession();
  }

  // Refresh session token
  async refreshSession(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        throw new AuthenticationError(
          'No refresh token available',
          'NO_REFRESH_TOKEN'
        );
      }

      // Simulate token refresh - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate new tokens
      const newSessionToken = encryptionService.generateSecureToken(32);
      const newRefreshToken = encryptionService.generateSecureToken(32);

      // Update storage
      await AsyncStorage.setItem(SESSION_CONFIG.TOKEN_KEY, newSessionToken);
      await AsyncStorage.setItem(
        SESSION_CONFIG.REFRESH_TOKEN_KEY,
        newRefreshToken
      );
      await AsyncStorage.setItem(
        '@auth_expires_at',
        this.calculateExpiry().toISOString()
      );

      this.sessionToken = newSessionToken;
      this.refreshToken = newRefreshToken;
      this.updateActivity();

      return true;
    } catch (error) {
      await this.clearSession();
      return false;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const storedUser = await AsyncStorage.getItem(SESSION_CONFIG.USER_KEY);
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.isSessionValid();
  }

  // Get session token
  getSessionToken(): string | null {
    return this.sessionToken;
  }

  // Update last activity timestamp
  updateActivity(): void {
    this.lastActivity = new Date();
    this.expiresAt = this.calculateExpiry();

    // Persist activity
    AsyncStorage.setItem(
      '@auth_last_activity',
      this.lastActivity.toISOString()
    );
    AsyncStorage.setItem('@auth_expires_at', this.expiresAt.toISOString());
  }

  // Private helper methods
  private async storeSession(
    user: AuthUser,
    sessionToken: string,
    refreshToken: string
  ): Promise<void> {
    this.sessionToken = sessionToken;
    this.refreshToken = refreshToken;
    this.updateActivity();

    // Store encrypted user data
    const encryptedUser = encryptionService.encryptObject(user);
    await AsyncStorage.setItem(SESSION_CONFIG.USER_KEY, encryptedUser);
    await AsyncStorage.setItem(SESSION_CONFIG.TOKEN_KEY, sessionToken);
    await AsyncStorage.setItem(SESSION_CONFIG.REFRESH_TOKEN_KEY, refreshToken);

    this.startSessionMonitoring();
  }

  private async clearSession(): Promise<void> {
    // Stop monitoring
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }

    // Clear state
    this.sessionToken = null;
    this.refreshToken = null;
    this.lastActivity = null;
    this.expiresAt = null;

    // Clear storage
    await AsyncStorage.multiRemove([
      SESSION_CONFIG.TOKEN_KEY,
      SESSION_CONFIG.REFRESH_TOKEN_KEY,
      SESSION_CONFIG.USER_KEY,
      '@auth_last_activity',
      '@auth_expires_at',
    ]);
  }

  private isSessionValid(): boolean {
    if (!this.sessionToken || !this.refreshToken) {
      return false;
    }

    if (!this.expiresAt) {
      return false;
    }

    // Check if token expired
    if (new Date() > this.expiresAt) {
      return false;
    }

    // Check if inactive too long
    if (this.lastActivity) {
      const inactiveTime = Date.now() - this.lastActivity.getTime();
      const maxInactiveMs =
        SESSION_CONFIG.MAX_INACTIVE_PERIOD_MINUTES * 60 * 1000;
      if (inactiveTime > maxInactiveMs) {
        return false;
      }
    }

    return true;
  }

  private calculateExpiry(): Date {
    return new Date(
      Date.now() + SESSION_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000
    );
  }

  private startSessionMonitoring(): void {
    // Check session validity every minute
    this.sessionCheckInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        this.clearSession();
      }
    }, 60000); // Check every minute
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const authService = AuthenticationService.getInstance();
