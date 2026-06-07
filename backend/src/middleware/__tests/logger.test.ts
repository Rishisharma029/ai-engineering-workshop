import { describe, it, expect, vi } from 'vitest';
import { requestLogger, logger } from '../logger.js';
import { Request, Response } from 'express';

describe('Logger Middleware', () => {
  it('should call next and set up res finish listener', () => {
    const logSpy = vi.spyOn(logger, 'info').mockImplementation(() => logger);

    const mockReq = {
      method: 'GET',
      originalUrl: '/test-logger',
      url: '/test-logger'
    } as unknown as Request;

    const listeners: Record<string, () => void> = {};
    const mockRes = {
      statusCode: 200,
      on: (event: string, callback: () => void) => {
        listeners[event] = callback;
        return mockRes;
      }
    } as unknown as Response;

    const next = vi.fn();

    requestLogger(mockReq, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect(listeners.finish).toBeDefined();

    // Simulate response finishing
    listeners.finish();

    expect(logSpy).toHaveBeenCalledWith(
      '%s %s %d - %dms',
      'GET',
      '/test-logger',
      200,
      expect.any(Number)
    );

    logSpy.mockRestore();
  });

  it('should fallback to req.url if req.originalUrl is missing', () => {
    const logSpy = vi.spyOn(logger, 'info').mockImplementation(() => logger);

    const mockReq = {
      method: 'POST',
      url: '/fallback-url'
    } as Request;

    const listeners: Record<string, () => void> = {};
    const mockRes = {
      statusCode: 201,
      on: (event: string, callback: () => void) => {
        listeners[event] = callback;
        return mockRes;
      }
    } as unknown as Response;

    const next = vi.fn();

    requestLogger(mockReq, mockRes, next);
    listeners.finish();

    expect(logSpy).toHaveBeenCalledWith(
      '%s %s %d - %dms',
      'POST',
      '/fallback-url',
      201,
      expect.any(Number)
    );

    logSpy.mockRestore();
  });

  it('should format message with stack traces correctly', () => {
    // Log an error with stack trace to execute the if(stack) formatting branch
    logger.error(new Error('Database connection failed'));
  });
});
