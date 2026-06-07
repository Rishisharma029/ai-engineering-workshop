import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Configure Winston Logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-engineering-workshop-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            return `[${timestamp}] ${level}: ${message}\nStack: ${stack}`;
          }
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    })
  ]
});

// Express Request Logging Middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      '%s %s %d - %dms',
      req.method,
      req.originalUrl || req.url,
      res.statusCode,
      duration
    );
  });
  next();
}
