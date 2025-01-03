import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Video } from '../../entities/video.entity';

@Injectable()
export class VideoService {
  constructor(private readonly em: EntityManager) {}

  async getVideos() {
    return this.em.find(Video, {});
  }

  async getVideo(id: string) {
    return this.em.findOne(Video, { id });
  }

  async createVideo(video: Video) {
    return this.em.persistAndFlush(video);
  }

  async updateVideo(id: string, video: Video) {
    const videoToUpdate = await this.em.findOne(Video, { id });

    if (!videoToUpdate) {
      throw new Error('Video not found');
    }

    wrap(videoToUpdate).assign(video);
    await this.em.flush();
  }

  async deleteVideo(id: string) {
    const videoToDelete = await this.em.findOne(Video, { id });

    if (!videoToDelete) {
      throw new Error('Video not found');
    }

    return this.em.removeAndFlush(videoToDelete);
  }
}
