import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './modules/core/db/db.module';
import { EmailModule } from './modules/core/email/email.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { AuthModule } from './modules/identity/auth/auth.module';
import { OrganizationModule } from './modules/identity/organization/organization.module';
import { TrainingSessionModule } from './modules/training/training-session/training-session.module';
import { ComplexCategoryModule } from './modules/training/complex-category.module';
import { ComplexModule } from './modules/training/complex.module';
import { ExerciseCategoryModule } from './modules/training/exercise-category/exercise-category.module';
import { ExerciseModule } from './modules/training/exercise/exercise.module';
import { WorkoutCategoryModule } from './modules/training/workout-category/workout-category.module';
import { WorkoutModule } from './modules/training/workout.module';

@Module({
  imports: [
    DbModule,
    AuthModule.forRootAsync(),
    AthletesModule,
    OrganizationModule,
    ExerciseModule,
    ExerciseCategoryModule,
    ComplexModule,
    ComplexCategoryModule,
    TrainingSessionModule,
    WorkoutCategoryModule,
    WorkoutModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
