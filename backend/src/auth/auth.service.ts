import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';

interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  avatar: string | null;
}

interface TokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Called after Google OAuth succeeds
  async handleGoogleLogin(googleUser: GoogleUser) {
    // Find existing user or create new one (Section 4.1.1 step 2)
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      // First time login — create the user
      user = await this.prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
          educationLevel: 'SCHOOL', // Default, user updates in profile setup
        },
      });
      console.log(`🆕 New user created: ${user.email}`);
    } else {
      // Returning user — update their info from Google
      user = await this.prisma.user.update({
        where: { googleId: googleUser.googleId },
        data: {
          name: googleUser.name,
          avatar: googleUser.avatar,
        },
      });
    }

    // Generate tokens (Section 4.1.1 step 3)
    const tokens = await this.generateTokens({ sub: user.id, email: user.email });

    return { user, ...tokens };
  }

  // Generate access + refresh tokens
  async generateTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      // Access token: 15 minute expiry
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      // Refresh token: 7 day expiry
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // Refresh the access token using refresh token (Section 4.1.1 step 6)
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Issue new tokens (token rotation — Section 12)
      const tokens = await this.generateTokens({ sub: user.id, email: user.email });

      return { user, ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Get current user profile (Section 4.1.1 — GET /auth/me)
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}