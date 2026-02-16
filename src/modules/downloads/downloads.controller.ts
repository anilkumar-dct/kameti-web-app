import { Controller, Get, StreamableFile, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { DownloadsService } from './downloads.service';
import { ApiResponse } from 'src/common/response/api.response';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get('app')
  getApp(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = this.downloadsService.getAppFile();
    if (!file) {
      throw new NotFoundException('App file not found');
    }

    res.set({
      'Content-Type': 'application/vnd.microsoft.portable-executable',
      'Content-Disposition': 'attachment; filename="Kameti Management Setup 2.0.1.exe"',
    });

    return file;
  }
}
