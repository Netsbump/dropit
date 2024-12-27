import { Module } from '@nestjs/common';
import { ExerciseTypeController } from './exerciseType.controller';
import { ExerciseTypeService } from './exerciseType.service';

@Module({
  controllers: [ExerciseTypeController],
  providers: [ExerciseTypeService],
})
export class ExerciseTypeModule {}
