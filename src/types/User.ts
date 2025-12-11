
export interface User {
  userId: number;
  userName: string;
  password?: string; // Optional since we don't always want to include password in the frontend
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

// You can also create a type for user creation/registration if needed
export interface CreateUserDTO {
  userName: string;
  password: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}
