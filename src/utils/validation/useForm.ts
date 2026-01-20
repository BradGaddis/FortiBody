import { useState, useCallback, useMemo } from 'react';
import { z, ZodSchema } from 'zod';
import {
  validateForm,
  FormFieldError,
  getFieldError,
  hasFieldError,
} from './formValidation';

interface UseFormOptions<T> {
  initialValues: T;
  schema?: ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormFieldError[];
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  dirty: boolean;

  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => () => void;
  handleReset: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearAllErrors: () => void;
  reset: (values: T) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  getErrorProps: (field: keyof T) => {
    error: string | undefined;
    hasError: boolean;
  };
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  validateOnChange = true,
  validateOnBlur = true,
  validateOnSubmit = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormFieldError[]>([]);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [dirty, setDirty] = useState(false);

  const validateFieldInternal = useCallback(
    (field: keyof T): boolean => {
      if (!schema) return true;

      const fieldValue = values[field];

      try {
        schema.parse(fieldValue);
        setErrors(prev => prev.filter(e => e.field !== String(field)));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors = error.errors
            .filter(err => err.path[0] === field)
            .map(err => ({
              field: String(field),
              message: err.message,
            }));

          setErrors(prev => {
            const filtered = prev.filter(e => e.field !== String(field));
            return [...filtered, ...fieldErrors];
          });
        }
        return false;
      }
    },
    [schema, values]
  );

  const validateAllInternal = useCallback((): boolean => {
    if (!schema) return true;

    setIsValidating(true);
    try {
      const result = validateForm(schema, values);
      if (result.success) {
        setErrors([]);
        setIsValidating(false);
        return true;
      } else {
        setErrors(result.errors || []);
        setIsValidating(false);
        return false;
      }
    } catch {
      setIsValidating(false);
      return false;
    }
  }, [schema, values]);

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => {
        const newValues = { ...prev, [field]: value };
        if (!dirty) {
          const hasChanged = JSON.stringify(prev) !== JSON.stringify(newValues);
          if (hasChanged) setDirty(true);
        }
        return newValues;
      });

      if (validateOnChange && touched[field]) {
        validateFieldInternal(field);
      }
    },
    [validateOnChange, touched, dirty, validateFieldInternal]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched(prev => ({ ...prev, [field]: true }));

      if (validateOnBlur) {
        validateFieldInternal(field);
      }
    },
    [validateOnBlur, validateFieldInternal]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async () => {
        const allTouched = {} as Record<keyof T, boolean>;
        (Object.keys(values) as Array<keyof T>).forEach(key => {
          allTouched[key] = true;
        });
        setTouched(allTouched);

        const isValid = validateOnSubmit ? validateAllInternal() : true;

        if (isValid || !validateOnSubmit) {
          setIsSubmitting(true);
          try {
            await onSubmit(values);
          } finally {
            setIsSubmitting(false);
          }
        }
      };
    },
    [values, validateOnSubmit, validateAllInternal]
  );

  const handleReset = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setTouched({} as Record<keyof T, boolean>);
    setDirty(false);
  }, [initialValues]);

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      handleChange(field, value);
    },
    [handleChange]
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== String(field));
      return [...filtered, { field: String(field), message: error }];
    });
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => prev.filter(e => e.field !== String(field)));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const reset = useCallback((newValues: T) => {
    setValues(newValues);
    setErrors([]);
    setTouched({} as Record<keyof T, boolean>);
    setDirty(false);
  }, []);

  const validateField = useCallback(
    (field: keyof T): boolean => {
      return validateFieldInternal(field);
    },
    [validateFieldInternal]
  );

  const validateAll = useCallback((): boolean => {
    return validateAllInternal();
  }, [validateAllInternal]);

  const getErrorProps = useCallback(
    (field: keyof T) => {
      return {
        error: getFieldError(errors, String(field)),
        hasError: hasFieldError(errors, String(field)) && touched[field],
      };
    },
    [errors, touched]
  );

  const isValid = useMemo(() => {
    return errors.length === 0;
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isValidating,
    dirty,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    setFieldValue,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    reset,
    validateField,
    validateAll,
    getErrorProps,
  };
}

export default useForm;
