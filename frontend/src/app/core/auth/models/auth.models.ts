export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface NewUserRequest {
  email: string;
  username: string;
  password: string;
  birthdate: string; // Formato YYYY-MM-DD (LocalDate de Java)
}

export interface UserSession {
  userId: string;
  username: string;
  roles: string[];
  token: string;
  expiresAt: number; // Timestamp en milisegundos
}

// Payload decodificado del JWT generado por JwtService.java
export interface JwtPayload {
  sub: string;
  roles: string[];
  userId?: string;
  exp: number; // Segundos Unix
  iat: number;
}