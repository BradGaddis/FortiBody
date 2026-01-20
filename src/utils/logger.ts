export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  file?: string;
  line?: number;
  data?: any;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class DebugLogger {
  private enabled: boolean = __DEV__;
  private minLevel: LogLevel = 'debug';
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;
  private listeners: Set<(entry: LogEntry) => void> = new Set();

  configure(
    options: {
      enabled?: boolean;
      minLevel?: LogLevel;
      maxLogs?: number;
    } = {}
  ): void {
    if (options.enabled !== undefined) this.enabled = options.enabled;
    if (options.minLevel !== undefined) this.minLevel = options.minLevel;
    if (options.maxLogs !== undefined) this.maxLogs = options.maxLogs;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabled && LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    this.listeners.forEach(listener => listener(entry));
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    file?: string,
    line?: number
  ): string {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const levelPrefix = level.toUpperCase().padEnd(5);
    const location = file ? `[${file}${line ? `:${line}` : ''}]` : '';
    return `[${timestamp}] ${levelPrefix} ${location} ${message}`;
  }

  log(
    level: LogLevel,
    message: string,
    data?: any,
    file?: string,
    line?: number
  ): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, file, line);
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      file,
      line,
      data,
    };

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data ?? '');
        break;
      case 'info':
        console.info(formattedMessage, data ?? '');
        break;
      case 'warn':
        console.warn(formattedMessage, data ?? '');
        break;
      case 'error':
        console.error(formattedMessage, data ?? '');
        break;
    }

    this.addLog(entry);
  }

  debug(message: string, data?: any, file?: string, line?: number): void {
    this.log('debug', message, data, file, line);
  }

  info(message: string, data?: any, file?: string, line?: number): void {
    this.log('info', message, data, file, line);
  }

  warn(message: string, data?: any, file?: string, line?: number): void {
    this.log('warn', message, data, file, line);
  }

  error(message: string, data?: any, file?: string, line?: number): void {
    this.log('error', message, data, file, line);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  getRecentLogs(count: number): LogEntry[] {
    return this.logs.slice(0, count);
  }

  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStats(): {
    total: number;
    debug: number;
    info: number;
    warn: number;
    error: number;
  } {
    return {
      total: this.logs.length,
      debug: this.logs.filter(l => l.level === 'debug').length,
      info: this.logs.filter(l => l.level === 'info').length,
      warn: this.logs.filter(l => l.level === 'warn').length,
      error: this.logs.filter(l => l.level === 'error').length,
    };
  }

  exportLogs(): string {
    return this.logs
      .map(log => {
        const timestamp = log.timestamp.toISOString();
        return `[${timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`;
      })
      .join('\n');
  }
}

export const logger = new DebugLogger();

export const createLogger = (file: string, line?: number) => ({
  debug: (message: string, data?: any) =>
    logger.debug(message, data, file, line),
  info: (message: string, data?: any) => logger.info(message, data, file, line),
  warn: (message: string, data?: any) => logger.warn(message, data, file, line),
  error: (message: string, data?: any) =>
    logger.error(message, data, file, line),
});

export const LOG = {
  APP: {
    START: () => logger.info('App starting...'),
    MOUNT: () => logger.info('App mounted'),
    UNMOUNT: () => logger.info('App unmounted'),
    ERROR: (error: any) => logger.error('App error', error),
  },
  NAVIGATION: {
    NAVIGATE: (screen: string, params?: any) =>
      logger.debug(`Navigating to ${screen}`, params),
    RESET: (screen: string) => logger.info(`Navigation reset to ${screen}`),
    BACK: () => logger.debug('Going back'),
    STATE: (state: any) => logger.debug('Navigation state', state),
  },
  STORAGE: {
    GET: (key: string) => logger.debug(`Storage get: ${key}`),
    SET: (key: string, value: any) =>
      logger.debug(`Storage set: ${key}`, value),
    REMOVE: (key: string) => logger.debug(`Storage remove: ${key}`),
    CLEAR: () => logger.info('Storage cleared'),
    ERROR: (key: string, error: any) =>
      logger.error(`Storage error for ${key}`, error),
  },
  AUTH: {
    LOGIN: (email: string) => logger.info(`Login attempt for ${email}`),
    LOGOUT: () => logger.info('User logged out'),
    TOKEN_SET: () => logger.debug('Auth token set'),
    TOKEN_CLEAR: () => logger.debug('Auth token cleared'),
    ERROR: (error: any) => logger.error('Auth error', error),
  },
  NETWORK: {
    REQUEST: (url: string, method: string) => logger.debug(`${method} ${url}`),
    RESPONSE: (url: string, status: number) =>
      logger.debug(`${url} -> ${status}`),
    ERROR: (url: string, error: any) =>
      logger.error(`Network error for ${url}`, error),
    OFFLINE: () => logger.warn('Device is offline'),
    ONLINE: () => logger.info('Device is online'),
  },
  EXERCISE: {
    START_SESSION: (exerciseId: string) =>
      logger.info(`Starting exercise session: ${exerciseId}`),
    END_SESSION: (exerciseId: string, duration: number) =>
      logger.info(`Ending exercise session: ${exerciseId}`, { duration }),
    ADD_SET: (reps: number, weight: number) =>
      logger.debug(`Added set: ${reps}x${weight}`),
    PR_SET: (type: string, value: number) =>
      logger.info(`New PR: ${type} = ${value}`),
  },
  NUTRITION: {
    ADD_FOOD: (name: string, calories: number) =>
      logger.debug(`Added food: ${name} (${calories} cal)`),
    DAILY_TOTAL: (calories: number) =>
      logger.debug(`Daily total: ${calories} cal`),
    GOAL_REACHED: () => logger.info('Daily nutrition goal reached!'),
  },
  SYNC: {
    START: () => logger.info('Sync started'),
    COMPLETE: (count: number) => logger.info(`Sync complete: ${count} items`),
    ERROR: (error: any) => logger.error('Sync error', error),
    OFFLINE: () => logger.warn('Sync skipped - offline'),
  },
};

export default logger;
