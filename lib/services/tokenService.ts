import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

export interface TokenPayload {
    userId: string;
}

export const generateTokens = (userId: string) => {
    const accessToken = jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
        { userId },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRE } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};
