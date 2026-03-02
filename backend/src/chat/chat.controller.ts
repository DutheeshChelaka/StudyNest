import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  // POST /chat/upload — Upload a file (requires auth)
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];

        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('File type not allowed'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      return { error: 'No file uploaded' };
    }

    const isImage = file.mimetype.startsWith('image/');

    return {
      fileUrl: `/chat/files/${file.filename}`,
      fileName: file.originalname,
      fileType: isImage ? 'image' : 'document',
      fileSize: file.size,
    };
  }

  // GET /chat/files/:filename — Serve files (NO auth required)
  @Get('files/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);
    
    // Set correct content type for downloads
    const ext = extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    if (contentTypes[ext]) {
      res.setHeader('Content-Type', contentTypes[ext]);
    }

    // Documents should download, images display inline
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    if (!isImage) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    return res.sendFile(filePath);
  }
}