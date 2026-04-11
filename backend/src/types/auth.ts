export type UserRole = 'admin' | 'user';

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
