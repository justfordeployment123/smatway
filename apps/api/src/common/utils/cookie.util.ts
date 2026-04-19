import { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const base = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
    path: '/',
  };
  res.cookie('access_token', accessToken, {
    ...base,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    ...base,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  const base = { httpOnly: true, secure: IS_PROD, sameSite: 'lax' as const, path: '/' };
  res.clearCookie('access_token', base);
  res.clearCookie('refresh_token', base);
}
