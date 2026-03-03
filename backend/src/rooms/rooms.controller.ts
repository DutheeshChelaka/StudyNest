import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchingService } from '../matching/matching.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService,private matchingService: MatchingService) {}

  // POST /rooms — Create a new room
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateRoomDto) {
    const user = req.user as any;
    return this.roomsService.create(user.id, dto);
  }

  // GET /rooms — List public rooms (paginated, filtered)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('subject') subject?: string,
    @Query('educationLevel') educationLevel?: string,
    @Query('grade') grade?: string,
    @Query('medium') medium?: string,
    @Query('search') search?: string,
  ) {
    return this.roomsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      subject,
      educationLevel,
      grade: grade ? parseInt(grade) : undefined,
      medium,
      search,
    });
  }
// GET /rooms/quick-join — Smart room matching using Priority Queue
  @Get('quick-join')
  @UseGuards(JwtAuthGuard)
  async quickJoin(@Req() req: any) {
    const bestRoom = await this.matchingService.findBestRoom(req.user.id);
    if (!bestRoom) {
      return { message: 'No suitable rooms found. Try creating one!' };
    }
    return bestRoom;
  }
  // GET /rooms/:id — Get room details
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  // PATCH /rooms/:id — Update room (owner only)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: UpdateRoomDto,
  ) {
    const user = req.user as any;
    return this.roomsService.update(id, user.id, dto);
  }

  // DELETE /rooms/:id — Delete room (owner only)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.roomsService.delete(id, user.id);
  }

  // POST /rooms/:id/join — Join a room
  @Post(':id/join')
  async join(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('password') password?: string,
  ) {
    const user = req.user as any;
    return this.roomsService.join(id, user.id, password);
  }

  // POST /rooms/:id/leave — Leave a room
  @Post(':id/leave')
  async leave(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.roomsService.leave(id, user.id);
  }
}