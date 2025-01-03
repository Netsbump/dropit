import { Module } from '@nestjs/common';
import { ExerciseCategoryController } from './exerciseCategory.controller';
import { ExerciseCategoryService } from './exerciseCategory.service';

@Module({
  controllers: [ExerciseCategoryController],
  providers: [ExerciseCategoryService],
})
export class ExerciseCategoryModule {}
