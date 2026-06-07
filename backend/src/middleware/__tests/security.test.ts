import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { generalLimiter, authLimiter, aiLimiter, helmetMiddleware, sanitizeInputs } from '../security.js';

describe('Security Middleware', () => {
  it('should define rate limiters and helmet middleware', () => {
    expect(generalLimiter).toBeDefined();
    expect(authLimiter).toBeDefined();
    expect(aiLimiter).toBeDefined();
    expect(helmetMiddleware).toBeDefined();
  });

  it('should sanitize query parameters for HTTP Parameter Pollution', () => {
    const req = {
      query: {
        id: ['first', 'second'],
        name: 'rishi'
      }
    } as unknown as Request;

        const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    sanitizeInputs(req, res, next);

    expect(req.query.id).toBe('first');
    expect(req.query.name).toBe('rishi');
    expect(next).toHaveBeenCalled();
  });
});
