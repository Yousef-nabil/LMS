export type User = {
  id: number;
  name: string;
  role: string;
  password: string;
};
export type UpdateUserInput = {
  id: number;
  name?: string;
  role?: string;
  password?: string;
};