import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExerciseCategory } from './exercise-category.entity';
import { ExerciseCategoryController } from './exercise-category.controller';
import { ExerciseCategoryService } from './exercise-category.service';

@Module({
  imports: [MikroOrmModule.forFeature([ExerciseCategory])],
  controllers: [ExerciseCategoryController],
  providers: [ExerciseCategoryService],
})
export class ExerciseCategoryModule {}
