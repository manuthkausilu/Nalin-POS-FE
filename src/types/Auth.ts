export interface UserDTO {
    userId: number;
    userName: string;
    password: string;
    email: string;
    role: string;
    isActive: boolean;
}

export interface LoginResponse {
    statusCode: number;
    message: string;
    token: string;
    expirationTime: string;
    userDTO: UserDTO;
}

export interface AuthContextType {
    user: UserDTO | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (response: LoginResponse) => void;
    logout: () => void;
}

