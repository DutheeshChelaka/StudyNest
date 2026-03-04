import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  // GET /search/autocomplete?q=phy&type=all
  @Get('autocomplete')
  async autocomplete(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    const maxResults = limit ? parseInt(limit) : 10;

    switch (type) {
      case 'rooms':
        return { rooms: this.searchService.searchRooms(query, maxResults) };
      case 'users':
        return { users: this.searchService.searchUsers(query, maxResults) };
      default:
        return this.searchService.searchAll(query, maxResults);
    }
  }
}