export type User = {
  id: number;
  name: string;
  profilePictureUrl?: string | null;
  role: string;
  password: string;
};
export type UpdateUserInput = {
  id: number;
  name?: string;
  profilePictureUrl?: string | null;
  passwordHash?: string;
};
