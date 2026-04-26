export interface RefreshToken {
  id?: string;
  userId: number;
  token: string;
  createdAt?: Date;
  expiresAt?: Date;
}
export interface RefreshTokenInput {
  id?: string;
  userId?: number;
  token?: string;
  createdAt?: Date;
  expiresAt?: Date;
}