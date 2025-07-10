import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExerciseCategory } from '../exercise-category/exercise-category.entity';
import { ExerciseCategoryModule } from '../exercise-category/exercise-category.module';
import { ExerciseController } from './exercise.controller';
import { Exercise } from './exercise.entity';
import { ExerciseService } from './exercise.service';
import { OrganizationModule } from '../../identity/organization/organization.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Exercise, ExerciseCategory]),
    ExerciseCategoryModule,
    OrganizationModule,
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
