import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
  } else if (err instanceof ZodError) {
    res.status(400).json({ message: 'Validation failed', errors: err.flatten().fieldErrors });
  } else if (err instanceof Error && err.name === 'CastError') {
    res.status(400).json({ message: 'Invalid id or value' });
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
