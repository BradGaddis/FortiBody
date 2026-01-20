import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface AsyncActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
}

export function useAsync<T>(
  initialData: T | null = null
): [AsyncState<T>, AsyncActions<T>] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async <TResult>(
      asyncFunction: () => Promise<TResult>
    ): Promise<TResult> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction();
        setState({
          data: result as T,
          loading: false,
          error: null,
        });
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return [state, { execute, reset, setData, setError }];
}

interface UsePromiseOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
  immediate?: boolean;
}

export function usePromise<T>(
  promiseFn: () => Promise<T>,
  options: UsePromiseOptions = {}
) {
  const { onSuccess, onError, onFinally, immediate = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const promiseFnRef = useRef(promiseFn);

  useEffect(() => {
    promiseFnRef.current = promiseFn;
  }, [promiseFn]);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await promiseFnRef.current();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
      onFinally?.();
    }
  }, [onSuccess, onError, onFinally]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
  };
}

interface UseAsyncOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFn();
        setData(result);
        setRetryCount(0);
        onSuccess?.(result);
        setLoading(false);
        return result;
      } catch (err) {
        lastError = err as Error;

        if (attempt < maxRetries) {
          await new Promise(resolve =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        }
      }
    }

    setError(lastError);
    setRetryCount(maxRetries);
    onError?.(lastError!);
    setLoading(false);
    return null;
  }, [asyncFn, maxRetries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setRetryCount(0);
  }, []);

  const retry = useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    retryCount,
    canRetry: retryCount < maxRetries && !!error,
    execute,
    reset,
    retry,
  };
}

interface DebounceOptions {
  delay?: number;
  maxWait?: number;
}

export function useDebounce<T>(value: T, options: DebounceOptions = {}): T {
  const { delay = 500, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [waiting, setWaiting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (maxWait && !waiting) {
      setWaiting(true);
      maxWaitRef.current = setTimeout(() => {
        setDebouncedValue(value);
        setWaiting(false);
      }, maxWait);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setWaiting(false);
      if (maxWaitRef.current) {
        clearTimeout(maxWaitRef.current);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitRef.current) {
        clearTimeout(maxWaitRef.current);
      }
    };
  }, [value, delay, maxWait, waiting]);

  return debouncedValue;
}

interface ThrottleOptions {
  delay?: number;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: ThrottleOptions = {}
): T {
  const { delay = 500 } = options;
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args) => {
      const now = Date.now();
      const remaining = delay - (now - lastCallRef.current);

      if (remaining <= 0) {
        lastCallRef.current = now;
        callback(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timeoutRef.current = null;
          callback(...args);
        }, remaining);
      }
    }) as T,
    [callback, delay]
  );
}

export default useAsync;
