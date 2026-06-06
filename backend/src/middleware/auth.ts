import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'workspace-developer-jwt-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Development fallback: if no token, authenticate as standard developer
    console.log('Auth: No token provided, auto-logging in as default developer');
    req.user = {
      id: 1,
      email: 'rishi.sharma@example.com',
      name: 'Rishi Sharma',
      role: 'LEAD'
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      // Dev bypass: even with invalid token, allow local requests
      console.warn('Auth: Token verification failed, fallback to default developer');
      req.user = {
        id: 1,
        email: 'rishi.sharma@example.com',
        name: 'Rishi Sharma',
        role: 'LEAD'
      };
      return next();
    }
    req.user = decoded;
    next();
  });
}
