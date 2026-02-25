import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // GET /auth/google — Redirect to Google OAuth (Section 4.1.1)
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // Guard redirects to Google — this never executes
  }

  // GET /auth/google/callback — Handle OAuth callback
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.handleGoogleLogin(req.user as any);

    // Set refresh token as HTTP-only cookie (Section 12 — Security)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,    // JavaScript cannot access this cookie
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',   // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Redirect to frontend with access token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  // POST /auth/refresh — Refresh access token
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    // Set new refresh token cookie (token rotation)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: result.accessToken, user: result.user });
  }

  // POST /auth/logout — Clear refresh token
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }

  // GET /auth/me — Get current user profile
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.getProfile(user.id);
  }
}