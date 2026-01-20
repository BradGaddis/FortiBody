import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage error types
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class StorageRetryError extends StorageError {
  constructor(message: string, originalError?: any) {
    super(message, 'STORAGE_RETRY_FAILED', originalError);
  }
}

// Storage operation result
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

// Storage service abstraction layer
export class StorageService {
  private static instance: StorageService;
  private retryConfig: RetryConfig;

  private constructor() {
    this.retryConfig = DEFAULT_RETRY_CONFIG;
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Configure retry settings
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  // Generic retry wrapper
  private async retryOperation<T>(
    operation: () => Promise<T>,
    config: RetryConfig = this.retryConfig
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === config.maxAttempts) {
          throw new StorageRetryError(
            `Operation failed after ${config.maxAttempts} attempts`,
            error
          );
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelayMs
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Get item with error handling and retry
  async getItem<T = any>(key: string): Promise<StorageResult<T>> {
    try {
      const data = await this.retryOperation(async () => {
        const stored = await AsyncStorage.getItem(key);
        if (stored === null) {
          throw new StorageError('Key not found', 'STORAGE_KEY_NOT_FOUND');
        }
        return stored;
      });

      const parsed = JSON.parse(data);
      return { success: true, data: parsed };
    } catch (error) {
      if (
        error instanceof StorageError &&
        error.code === 'STORAGE_KEY_NOT_FOUND'
      ) {
        return { success: true, data: null };
      }

      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to get item',
                'STORAGE_GET_FAILED',
                error
              ),
      };
    }
  }

  // Set item with error handling and retry
  async setItem<T = any>(key: string, value: T): Promise<StorageResult<void>> {
    try {
      const serialized = JSON.stringify(value);

      await this.retryOperation(async () => {
        await AsyncStorage.setItem(key, serialized);
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to set item',
                'STORAGE_SET_FAILED',
                error
              ),
      };
    }
  }

  // Remove item with error handling and retry
  async removeItem(key: string): Promise<StorageResult<void>> {
    try {
      await this.retryOperation(async () => {
        await AsyncStorage.removeItem(key);
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to remove item',
                'STORAGE_REMOVE_FAILED',
                error
              ),
      };
    }
  }

  // Get all keys with error handling and retry
  async getAllKeys(): Promise<StorageResult<string[]>> {
    try {
      const keys = await this.retryOperation(async () => {
        return await AsyncStorage.getAllKeys();
      });

      return { success: true, data: keys };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to get all keys',
                'STORAGE_KEYS_FAILED',
                error
              ),
      };
    }
  }

  // Multi-get items with error handling and retry
  async multiGet<T = any>(
    keys: string[]
  ): Promise<StorageResult<Array<[string, T | null]>>> {
    try {
      const results = await this.retryOperation(async () => {
        const stored = await AsyncStorage.multiGet(keys);
        return stored.map(([key, value]) => [
          key,
          value ? JSON.parse(value) : null,
        ]) as Array<[string, T | null]>;
      });

      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to multi-get items',
                'STORAGE_MULTI_GET_FAILED',
                error
              ),
      };
    }
  }

  // Multi-set items with error handling and retry
  async multiSet<T = any>(
    keyValuePairs: Array<[string, T]>
  ): Promise<StorageResult<void>> {
    try {
      const serializedPairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]) as Array<[string, string]>;

      await this.retryOperation(async () => {
        await AsyncStorage.multiSet(serializedPairs);
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to multi-set items',
                'STORAGE_MULTI_SET_FAILED',
                error
              ),
      };
    }
  }

  // Multi-remove items with error handling and retry
  async multiRemove(keys: string[]): Promise<StorageResult<void>> {
    try {
      await this.retryOperation(async () => {
        await AsyncStorage.multiRemove(keys);
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to multi-remove items',
                'STORAGE_MULTI_REMOVE_FAILED',
                error
              ),
      };
    }
  }

  // Clear all storage with error handling and retry
  async clear(): Promise<StorageResult<void>> {
    try {
      await this.retryOperation(async () => {
        await AsyncStorage.clear();
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to clear storage',
                'STORAGE_CLEAR_FAILED',
                error
              ),
      };
    }
  }

  // Check if storage is available
  async isStorageAvailable(): Promise<boolean> {
    try {
      await AsyncStorage.getAllKeys();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get storage info
  async getStorageInfo(): Promise<
    StorageResult<{ usedKeys: number; totalSize: number }>
  > {
    try {
      const keys = await this.retryOperation(async () => {
        return await AsyncStorage.getAllKeys();
      });

      let totalSize = 0;
      const values = await this.retryOperation(async () => {
        return await AsyncStorage.multiGet(keys);
      });

      values.forEach(([key, value]) => {
        totalSize += key.length + (value ? value.length : 0);
      });

      return {
        success: true,
        data: {
          usedKeys: keys.length,
          totalSize: totalSize,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof StorageError
            ? error
            : new StorageError(
                'Failed to get storage info',
                'STORAGE_INFO_FAILED',
                error
              ),
      };
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
