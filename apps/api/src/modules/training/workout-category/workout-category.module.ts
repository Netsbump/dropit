import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { WorkoutCategoryController } from './workout-category.controller';
import { WorkoutCategory } from './workout-category.entity';
import { WorkoutCategoryService } from './workout-category.service';

@Module({
  imports: [MikroOrmModule.forFeature([WorkoutCategory])],
  controllers: [WorkoutCategoryController],
  providers: [WorkoutCategoryService],
})
export class WorkoutCategoryModule {}
