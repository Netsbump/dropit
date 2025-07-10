import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './modules/core/db/db.module';
import { EmailModule } from './modules/core/email/email.module';
import { AthleteModule } from './modules/athletes/athlete/athlete.module';
import { AuthModule } from './modules/identity/auth/auth.module';
import { OrganizationModule } from './modules/identity/organization/organization.module';
import { PersonalRecordModule } from './modules/athletes/personal-record/personal-record.module';
import { TrainingSessionModule } from './modules/training/training-session/training-session.module';
import { ComplexCategoryModule } from './modules/training/complex-category/complex-category.module';
import { ComplexModule } from './modules/training/complex/complex.module';
import { ExerciseCategoryModule } from './modules/training/exercise-category/exercise-category.module';
import { ExerciseModule } from './modules/training/exercise/exercise.module';
import { WorkoutCategoryModule } from './modules/training/workout-category/workout-category.module';
import { WorkoutModule } from './modules/training/workout/workout.module';

@Module({
  imports: [
    DbModule,
    AuthModule.forRootAsync(),
    AthleteModule,
    OrganizationModule,
    ExerciseModule,
    ExerciseCategoryModule,
    ComplexModule,
    ComplexCategoryModule,
    TrainingSessionModule,
    WorkoutCategoryModule,
    WorkoutModule,
    PersonalRecordModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
