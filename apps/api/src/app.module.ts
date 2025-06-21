import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from './modules/core/db/db.module';
import { EmailModule } from './modules/core/email/email.module';
import { AthleteModule } from './modules/members/athlete/athlete.module';
import { AuthModule } from './modules/members/auth/auth.module';
import { OrganizationModule } from './modules/members/organization/organization.module';
import { AthleteSessionModule } from './modules/performance/athlete-session/athlete-session.module';
import { PersonalRecordModule } from './modules/performance/personal-record/personal-record.module';
import { SessionModule } from './modules/performance/session/session.module';
import { ComplexCategoryModule } from './modules/training/complex-category/complex-category.module';
import { ComplexModule } from './modules/training/complex/complex.module';
import { ExerciseCategoryModule } from './modules/training/exercise-category/exerciseCategory.module';
import { ExerciseModule } from './modules/training/exercise/exercise.module';
import { WorkoutCategoryModule } from './modules/training/workout-category/workout-category.module';
import { WorkoutModule } from './modules/training/workout/workout.module';

@Module({
  imports: [
    DbModule,
    AuthModule.forRootAsync(),
    AthleteModule,
    OrganizationModule,
    AthleteSessionModule,
    ExerciseModule,
    ExerciseCategoryModule,
    ComplexModule,
    ComplexCategoryModule,
    SessionModule,
    WorkoutCategoryModule,
    WorkoutModule,
    PersonalRecordModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
