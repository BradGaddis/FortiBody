import { z, ZodError } from 'zod';

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: FormFieldError[];
  rawErrors?: ZodError;
}

export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: FormFieldError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return {
        success: false,
        errors: fieldErrors,
        rawErrors: error,
      };
    }
    throw error;
  }
};

export const getFieldError = (
  errors: FormFieldError[] | undefined,
  fieldName: string
): string | undefined => {
  if (!errors) return undefined;
  const error = errors.find(e => e.field === fieldName);
  return error?.message;
};

export const hasFieldError = (
  errors: FormFieldError[] | undefined,
  fieldName: string
): boolean => {
  if (!errors) return false;
  return errors.some(e => e.field === fieldName);
};

export const getFirstError = (
  errors: FormFieldError[] | undefined
): string | undefined => {
  if (!errors || errors.length === 0) return undefined;
  return errors[0].message;
};

export const getErrorsForField = (
  errors: FormFieldError[] | undefined,
  fieldName: string
): string[] => {
  if (!errors) return [];
  return errors.filter(e => e.field === fieldName).map(e => e.message);
};

export const clearFieldError = (
  errors: FormFieldError[] | undefined,
  fieldName: string
): FormFieldError[] => {
  if (!errors) return [];
  return errors.filter(e => e.field !== fieldName);
};

export const addFieldError = (
  errors: FormFieldError[] | undefined,
  field: string,
  message: string
): FormFieldError[] => {
  const current = errors || [];
  return [...current, { field, message }];
};

export const setFieldError = (
  errors: FormFieldError[] | undefined,
  field: string,
  message: string
): FormFieldError[] => {
  const current = errors || [];
  const filtered = current.filter(e => e.field !== field);
  return [...filtered, { field, message }];
};

export const getErrorSummary = (
  errors: FormFieldError[] | undefined
): string => {
  if (!errors || errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} errors found. Please check the form for details.`;
};

export const isValidationError = (error: unknown): boolean => {
  return error instanceof ZodError;
};

export const extractZodErrors = (error: ZodError): FormFieldError[] => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

export const formatErrorForDisplay = (error: ZodError): string => {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('\n');
};

export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  if (input !== null && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      input as Record<string, unknown>
    )) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePasswordStrength = (
  password: string
): {
  valid: boolean;
  score: number;
  errors: string[];
} => {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else errors.push('At least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else errors.push('Lowercase letter');

  if (/[A-Z]/.test(password)) score++;
  else errors.push('Uppercase letter');

  if (/\d/.test(password)) score++;
  else errors.push('Number');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else errors.push('Special character');

  return {
    valid: score >= 4,
    score,
    errors,
  };
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateDateRange = (
  startDate: Date,
  endDate?: Date
): { valid: boolean; error?: string } => {
  const now = new Date();

  if (startDate > now) {
    return { valid: false, error: 'Start date cannot be in the future' };
  }

  if (endDate && endDate < startDate) {
    return { valid: false, error: 'End date must be after start date' };
  }

  return { valid: true };
};

export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; error?: string } => {
  if (value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (value > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }
  return { valid: true };
};
