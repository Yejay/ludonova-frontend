// types/auth.ts
export interface User {
    id: number
    username: string
    email: string | null
    steamUser?: {
      steamId: string
      personaName: string
      profileUrl: string
      avatarUrl: string
    }
  }
  
  export interface AuthTokens {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
  }
  
  export interface AuthResponse {
    tokens: AuthTokens
    user: User
  }
  
  export interface LoginCredentials {
    username: string
    password: string
  }