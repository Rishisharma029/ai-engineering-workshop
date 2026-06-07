import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthenticatedRequest } from '../auth.js';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('Auth Middleware', () => {
  it('should fallback to default developer if no token is provided', () => {
    const mockReq = {
      headers: {}
    } as unknown as AuthenticatedRequest;

    const mockRes = {} as Response;
    const next = vi.fn();

    authenticateToken(mockReq, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.email).toBe('rishi.sharma@example.com');
  });

  it('should authenticate with a valid token', () => {
    const payload = { id: 2, email: 'test@example.com', name: 'Test User', role: 'DEVELOPER' };
    const token = jwt.sign(payload, JWT_SECRET);

    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`
      }
    } as unknown as AuthenticatedRequest;

    const mockRes = {} as Response;
    const next = vi.fn();

    authenticateToken(mockReq, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.email).toBe('test@example.com');
    expect(mockReq.user?.role).toBe('DEVELOPER');
  });

  it('should fallback to default developer if token verification fails', () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer invalid-token-string'
      }
    } as unknown as AuthenticatedRequest;

    const mockRes = {} as Response;
    const next = vi.fn();

    authenticateToken(mockReq, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.email).toBe('rishi.sharma@example.com');
  });
});
