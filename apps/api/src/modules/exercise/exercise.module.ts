import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, forwardRef } from '@nestjs/common';
import { Exercise, ExerciseCategory } from '../../entities';
import { ExerciseCategoryModule } from '../exerciseCategory/exerciseCategory.module';
import { ExerciseController } from './exercise.controller';
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
