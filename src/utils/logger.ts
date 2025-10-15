export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    console.log(`[INFO] [${this.context}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] [${this.context}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] [${this.context}] ${message}`, error ? JSON.stringify(error, null, 2) : '');
  }
}