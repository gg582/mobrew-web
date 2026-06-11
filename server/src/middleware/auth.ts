import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  userId: string;
  email: string;
  username?: string | null;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Invalid Authorization header format" });
    return;
  }

  if (!JWT_SECRET) {
    res.status(500).json({ error: "JWT_SECRET is not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username ?? null,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authenticateOptional(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header) {
    next();
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token || !JWT_SECRET) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username ?? null,
    };
  } catch {
    // ignore invalid optional token
  }
  next();
}
