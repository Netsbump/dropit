import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExerciseCategory } from './exercise-category.entity';
import { ExerciseCategoryController } from './exerciseCategory.controller';
import { ExerciseCategoryService } from './exerciseCategory.service';

@Module({
  imports: [MikroOrmModule.forFeature([ExerciseCategory])],
  controllers: [ExerciseCategoryController],
  providers: [ExerciseCategoryService],
})
export class ExerciseCategoryModule {}
