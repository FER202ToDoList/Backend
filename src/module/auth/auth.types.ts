import type { Request } from 'express';
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
