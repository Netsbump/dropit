import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Video } from '../../entities/video.entity';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async getVideos() {
    return this.videoService.getVideos();
  }

  @Get(':id')
  async getVideo(@Param('id') id: string) {
    return this.videoService.getVideo(id);
  }

  @Post()
  async createVideo(@Body() video: Video) {
    return this.videoService.createVideo(video);
  }

  @Put(':id')
  async updateVideo(@Param('id') id: string, @Body() video: Video) {
    return this.videoService.updateVideo(id, video);
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string) {
    return this.videoService.deleteVideo(id);
  }
}
