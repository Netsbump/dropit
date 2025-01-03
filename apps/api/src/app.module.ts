import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { devOrmConfig, testOrmConfig } from './mikro-orm.config';
import config from './mikro-orm.config';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { ExerciseCategoryModule } from './modules/exerciseCategory/exerciseCategory.module';
import { VideoModule } from './modules/video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(config),
    ExerciseModule,
    VideoModule,
    ExerciseCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
