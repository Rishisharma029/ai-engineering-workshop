import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

// 1. General Rate Limiter (DDoS protection)
// Limits requests from a single IP to 300 requests per 10 minutes.
export const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 300,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again after 10 minutes.'
  },
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    logger.warn(`Rate limit exceeded for IP ${req.ip} on route ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// 2. Auth Route Limiter (Brute-Force protection)
// Limits login and registration requests to 15 attempts per 15 minutes.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    logger.warn(`Brute-force security check: Auth rate limit exceeded for IP ${req.ip} on route ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// 3. AI Generation Route Limiter (API Abuse protection)
// Limits chat streams and doc generation to 50 requests per 15 minutes.
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI generation requests. Please try again after 15 minutes.'
  },
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    logger.warn(`AI route rate limit exceeded for IP ${req.ip} on route ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// 4. Helmet configuration (HTTP Headers Security)
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com', 'https://api.openai.com', 'https://api.anthropic.com']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// 5. Clean / Sanitize inputs middleware
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  // Protect against HTTP Parameter Pollution (convert arrays to single string)
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = (req.query[key] as any)[0];
      }
    }
  }
  next();
};
