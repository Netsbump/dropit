import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { WorkoutCategory } from '../../entities';
import { WorkoutCategoryController } from './workout-category.controller';
import { WorkoutCategoryService } from './workout-category.service';

@Module({
  imports: [MikroOrmModule.forFeature([WorkoutCategory])],
  controllers: [WorkoutCategoryController],
  providers: [WorkoutCategoryService],
})
export class WorkoutCategoryModule {}
