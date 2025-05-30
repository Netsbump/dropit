import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExerciseCategory } from '../exercise-category/exercise-category.entity';
import { ExerciseCategoryModule } from '../exercise-category/exerciseCategory.module';
import { ExerciseController } from './exercise.controller';
import { Exercise } from './exercise.entity';
import { ExerciseService } from './exercise.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Exercise, ExerciseCategory]),
    ExerciseCategoryModule,
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
