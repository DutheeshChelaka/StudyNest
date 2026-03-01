import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Get user by ID
  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Update user profile (PATCH /users/profile)
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Verify user exists
    await this.findById(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
      },
    });

    return user;
  }

  // Get users by education level (useful for room matching later)
  async findByEducationLevel(educationLevel: string) {
    return this.prisma.user.findMany({
      where: { educationLevel: educationLevel as any },
    });
  }

  // Search users by name (for friend search later)
  async searchByName(query: string) {
    return this.prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 10,
    });
  }
}