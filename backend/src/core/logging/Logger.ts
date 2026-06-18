export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;
  private static context: string = 'App';

  static initialize(level?: LogLevel): void {
    if (level !== undefined) {
      this.level = level;
    }
    if (process.env.NODE_ENV === 'production') {
      this.level = LogLevel.INFO;
    } else if (process.env.NODE_ENV === 'test') {
      this.level = LogLevel.ERROR;
    } else {
      this.level = LogLevel.DEBUG;
    }
  }

  static setContext(context: string): void {
    this.context = context;
  }

  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
    return '[' + timestamp + '] [' + level + '] [' + this.context + '] ' + message + metaStr;
  }

  static error(message: string, meta?: any): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, meta));
    }
  }

  static warn(message: string, meta?: any): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, meta));
    }
  }

  static info(message: string, meta?: any): void {
    if (this.level >= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message, meta));
    }
  }

  static debug(message: string, meta?: any): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  static time(label: string): void {
    console.time(label);
  }

  static timeEnd(label: string): void {
    console.timeEnd(label);
  }
}
