// Service layer exports
export { storageService, StorageService } from './storage/StorageService';
export type { StorageResult } from './storage/StorageService';

export {
  validationService,
  ValidationService,
} from './validation/ValidationService';
export type {
  UserProfileSchema,
  ExerciseSchema,
  ExerciseSessionSchema,
  WorkoutSchema,
  NutritionEntrySchema,
  BodyMeasurementSchema,
} from './validation/ValidationService';

export { backupService, BackupService } from './backup/BackupService';
export type { BackupData, BackupMetadata } from './backup/BackupService';
