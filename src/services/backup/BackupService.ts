import { storageService } from './StorageService';
import { validationService } from '../validation/ValidationService';

// Backup data structure
export interface BackupData {
  version: string;
  timestamp: Date;
  user: any;
  exercises: any[];
  exerciseSessions: any[];
  workouts: any[];
  nutritionEntries: any[];
  bodyMeasurements: any[];
  settings: any;
}

// Backup metadata
export interface BackupMetadata {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  size: number;
  version: string;
  dataTypes: string[];
}

// Backup service error types
export class BackupError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

export class BackupRestoreError extends BackupError {
  constructor(message: string, originalError?: any) {
    super(message, 'BACKUP_RESTORE_FAILED', originalError);
  }
}

export class BackupValidationError extends BackupError {
  constructor(message: string, validationErrors?: any) {
    super(message, 'BACKUP_VALIDATION_FAILED', validationErrors);
  }
}

// Backup service
export class BackupService {
  private static instance: BackupService;
  private readonly BACKUP_PREFIX = '@backup_';
  private readonly METADATA_PREFIX = '@backup_meta_';
  private readonly CURRENT_VERSION = '1.0.0';

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // Create a complete backup of all user data
  async createBackup(
    name?: string
  ): Promise<{ success: boolean; backupId?: string; error?: BackupError }> {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();

      // Gather all data
      const user = await this.getDataFromStorage('currentUser');
      const exercises = (await this.getDataFromStorage('exercises')) || [];
      const exerciseSessions =
        (await this.getDataFromStorage('exerciseSessions')) || [];
      const workouts = (await this.getDataFromStorage('workouts')) || [];
      const nutritionEntries =
        (await this.getDataFromStorage('nutritionEntries')) || [];
      const bodyMeasurements =
        (await this.getDataFromStorage('bodyMeasurements')) || [];
      const settings = (await this.getDataFromStorage('appSettings')) || {};

      // Create backup data
      const backupData: BackupData = {
        version: this.CURRENT_VERSION,
        timestamp,
        user,
        exercises,
        exerciseSessions,
        workouts,
        nutritionEntries,
        bodyMeasurements,
        settings,
      };

      // Validate backup data
      const validationResult = this.validateBackupData(backupData);
      if (!validationResult.success) {
        return {
          success: false,
          error: new BackupValidationError(
            'Backup data validation failed',
            validationResult.errors
          ),
        };
      }

      // Serialize and store backup
      const serializedBackup = JSON.stringify(backupData);
      const backupKey = `${this.BACKUP_PREFIX}${backupId}`;

      const storeResult = await storageService.setItem(backupKey, backupData);
      if (!storeResult.success) {
        return {
          success: false,
          error: new BackupError(
            'Failed to store backup data',
            'BACKUP_STORE_FAILED',
            storeResult.error
          ),
        };
      }

      // Create and store backup metadata
      const metadata: BackupMetadata = {
        id: backupId,
        name: name || `Backup ${timestamp.toLocaleDateString()}`,
        timestamp,
        size: serializedBackup.length,
        version: this.CURRENT_VERSION,
        dataTypes: this.getDataTypesPresent(backupData),
      };

      const metadataKey = `${this.METADATA_PREFIX}${backupId}`;
      const metaResult = await storageService.setItem(metadataKey, metadata);
      if (!metaResult.success) {
        // Clean up backup if metadata fails
        await storageService.removeItem(backupKey);
        return {
          success: false,
          error: new BackupError(
            'Failed to store backup metadata',
            'BACKUP_META_FAILED',
            metaResult.error
          ),
        };
      }

      return { success: true, backupId };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof BackupError
            ? error
            : new BackupError(
                'Backup creation failed',
                'BACKUP_CREATE_FAILED',
                error
              ),
      };
    }
  }

  // Restore data from a backup
  async restoreBackup(
    backupId: string
  ): Promise<{ success: boolean; error?: BackupError }> {
    try {
      const backupKey = `${this.BACKUP_PREFIX}${backupId}`;

      // Retrieve backup data
      const backupResult = await storageService.getItem<BackupData>(backupKey);
      if (!backupResult.success || !backupResult.data) {
        return {
          success: false,
          error: new BackupError('Backup not found', 'BACKUP_NOT_FOUND'),
        };
      }

      const backupData = backupResult.data;

      // Validate backup data
      const validationResult = this.validateBackupData(backupData);
      if (!validationResult.success) {
        return {
          success: false,
          error: new BackupValidationError(
            'Backup data validation failed',
            validationResult.errors
          ),
        };
      }

      // Check version compatibility
      if (!this.isVersionCompatible(backupData.version)) {
        return {
          success: false,
          error: new BackupError(
            'Backup version is not compatible',
            'BACKUP_VERSION_INCOMPATIBLE'
          ),
        };
      }

      // Create restore transaction for atomicity
      const restoreOperations = [
        { key: 'currentUser', data: backupData.user },
        { key: 'exercises', data: backupData.exercises },
        { key: 'exerciseSessions', data: backupData.exerciseSessions },
        { key: 'workouts', data: backupData.workouts },
        { key: 'nutritionEntries', data: backupData.nutritionEntries },
        { key: 'bodyMeasurements', data: backupData.bodyMeasurements },
        { key: 'appSettings', data: backupData.settings },
      ];

      // Execute restore operations
      for (const operation of restoreOperations) {
        if (operation.data !== undefined) {
          const result = await storageService.setItem(
            operation.key,
            operation.data
          );
          if (!result.success) {
            return {
              success: false,
              error: new BackupRestoreError(
                `Failed to restore ${operation.key}`,
                result.error
              ),
            };
          }
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof BackupError
            ? error
            : new BackupRestoreError('Restore operation failed', error),
      };
    }
  }

  // List all available backups
  async listBackups(): Promise<{
    success: boolean;
    backups?: BackupMetadata[];
    error?: BackupError;
  }> {
    try {
      const allKeysResult = await storageService.getAllKeys();
      if (!allKeysResult.success) {
        return {
          success: false,
          error: new BackupError(
            'Failed to retrieve backup list',
            'BACKUP_LIST_FAILED',
            allKeysResult.error
          ),
        };
      }

      const metadataKeys = allKeysResult.data!.filter(key =>
        key.startsWith(this.METADATA_PREFIX)
      );

      const backups: BackupMetadata[] = [];

      for (const metadataKey of metadataKeys) {
        const metaResult =
          await storageService.getItem<BackupMetadata>(metadataKey);
        if (metaResult.success && metaResult.data) {
          backups.push(metaResult.data);
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return { success: true, backups };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof BackupError
            ? error
            : new BackupError(
                'Failed to list backups',
                'BACKUP_LIST_FAILED',
                error
              ),
      };
    }
  }

  // Delete a backup
  async deleteBackup(
    backupId: string
  ): Promise<{ success: boolean; error?: BackupError }> {
    try {
      const backupKey = `${this.BACKUP_PREFIX}${backupId}`;
      const metadataKey = `${this.METADATA_PREFIX}${backupId}`;

      // Delete both backup and metadata
      const backupResult = await storageService.removeItem(backupKey);
      const metaResult = await storageService.removeItem(metadataKey);

      if (!backupResult.success || !metaResult.success) {
        return {
          success: false,
          error: new BackupError(
            'Failed to delete backup',
            'BACKUP_DELETE_FAILED'
          ),
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof BackupError
            ? error
            : new BackupError(
                'Backup deletion failed',
                'BACKUP_DELETE_FAILED',
                error
              ),
      };
    }
  }

  // Export backup as JSON string (for sharing/exporting)
  async exportBackup(
    backupId: string
  ): Promise<{ success: boolean; data?: string; error?: BackupError }> {
    try {
      const backupKey = `${this.BACKUP_PREFIX}${backupId}`;

      const result = await storageService.getItem<BackupData>(backupKey);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: new BackupError('Backup not found', 'BACKUP_NOT_FOUND'),
        };
      }

      const exportData = {
        ...result.data,
        exportedAt: new Date(),
        exportVersion: this.CURRENT_VERSION,
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof BackupError
            ? error
            : new BackupError(
                'Backup export failed',
                'BACKUP_EXPORT_FAILED',
                error
              ),
      };
    }
  }

  // Import backup from JSON string
  async importBackup(
    jsonData: string
  ): Promise<{ success: boolean; backupId?: string; error?: BackupError }> {
    try {
      const importData = JSON.parse(jsonData);

      // Validate import data structure
      if (!importData.version || !importData.timestamp || !importData.user) {
        return {
          success: false,
          error: new BackupError(
            'Invalid backup format',
            'BACKUP_INVALID_FORMAT'
          ),
        };
      }

      // Convert to BackupData format
      const backupData: BackupData = {
        version: importData.version,
        timestamp: new Date(importData.timestamp),
        user: importData.user,
        exercises: importData.exercises || [],
        exerciseSessions: importData.exerciseSessions || [],
        workouts: importData.workouts || [],
        nutritionEntries: importData.nutritionEntries || [],
        bodyMeasurements: importData.bodyMeasurements || [],
        settings: importData.settings || {},
      };

      // Validate imported data
      const validationResult = this.validateBackupData(backupData);
      if (!validationResult.success) {
        return {
          success: false,
          error: new BackupValidationError(
            'Imported backup data validation failed',
            validationResult.errors
          ),
        };
      }

      // Create backup from imported data
      return await this.createBackup(
        `Imported ${new Date().toLocaleDateString()}`
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: new BackupError('Invalid JSON format', 'BACKUP_INVALID_JSON'),
        };
      }

      return {
        success: false,
        error:
          error instanceof BackupError
            ? error
            : new BackupError(
                'Backup import failed',
                'BACKUP_IMPORT_FAILED',
                error
              ),
      };
    }
  }

  // Private helper methods
  private async getDataFromStorage<T = any>(key: string): Promise<T | null> {
    const result = await storageService.getItem<T>(key);
    return result.success ? result.data || null : null;
  }

  private validateBackupData(data: BackupData): {
    success: boolean;
    errors?: any;
  } {
    try {
      // Validate user data if present
      if (data.user) {
        const userValidation = validationService.validateUserProfile(data.user);
        if (!userValidation.success)
          return { success: false, errors: userValidation.errors };
      }

      // Validate exercises
      for (const exercise of data.exercises || []) {
        const exerciseValidation = validationService.validateExercise(exercise);
        if (!exerciseValidation.success)
          return { success: false, errors: exerciseValidation.errors };
      }

      // Validate exercise sessions
      for (const session of data.exerciseSessions || []) {
        const sessionValidation =
          validationService.validateExerciseSession(session);
        if (!sessionValidation.success)
          return { success: false, errors: sessionValidation.errors };
      }

      // Validate workouts
      for (const workout of data.workouts || []) {
        const workoutValidation = validationService.validateWorkout(workout);
        if (!workoutValidation.success)
          return { success: false, errors: workoutValidation.errors };
      }

      // Validate nutrition entries
      for (const entry of data.nutritionEntries || []) {
        const nutritionValidation =
          validationService.validateNutritionEntry(entry);
        if (!nutritionValidation.success)
          return { success: false, errors: nutritionValidation.errors };
      }

      // Validate body measurements
      for (const measurement of data.bodyMeasurements || []) {
        const measurementValidation =
          validationService.validateBodyMeasurement(measurement);
        if (!measurementValidation.success)
          return { success: false, errors: measurementValidation.errors };
      }

      return { success: true };
    } catch (error) {
      return { success: false, errors: error };
    }
  }

  private isVersionCompatible(version: string): boolean {
    // Simple version compatibility check
    // In a real app, you'd have more sophisticated version checking
    const currentMajor = parseInt(this.CURRENT_VERSION.split('.')[0]);
    const backupMajor = parseInt(version.split('.')[0]);

    return backupMajor <= currentMajor;
  }

  private getDataTypesPresent(data: BackupData): string[] {
    const types: string[] = [];

    if (data.user) types.push('user');
    if (data.exercises?.length) types.push('exercises');
    if (data.exerciseSessions?.length) types.push('exerciseSessions');
    if (data.workouts?.length) types.push('workouts');
    if (data.nutritionEntries?.length) types.push('nutrition');
    if (data.bodyMeasurements?.length) types.push('measurements');
    if (data.settings && Object.keys(data.settings).length)
      types.push('settings');

    return types;
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance();
