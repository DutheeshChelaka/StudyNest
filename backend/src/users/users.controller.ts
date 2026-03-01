import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // PATCH /users/profile — Update your own profile
  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as any;
    return this.usersService.updateProfile(user.id, dto);
  }

  // GET /users/search?q=name — Search users by name
  @Get('search')
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchByName(query || '');
  }

  // GET /users/:id — Get any user's public profile
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}