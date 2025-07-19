export interface TokenRequest
{
    email: string;
    password: string;
}

export interface TokenResponse
{
    token: string;
    refreshToken: string;
    refreshTokenExpiryTime: string;
}

export interface RefreshTokenRequest
{
    token: string;
    refreshToken: string;
} 