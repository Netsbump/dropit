import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AthleteSessionModule } from './modules/athlete-session/athlete-session.module';
import { AthleteModule } from './modules/athlete/athlete.module';
import { AuthModule } from './modules/auth/auth.module';
import { ComplexCategoryModule } from './modules/complex-category/complex-category.module';
import { ComplexModule } from './modules/complex/complex.module';
import { DbModule } from './modules/db/db.module';
import { EmailModule } from './modules/email/email.module';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { ExerciseCategoryModule } from './modules/exerciseCategory/exerciseCategory.module';
import { PersonalRecordModule } from './modules/personal-record/personal-record.module';
import { SessionModule } from './modules/session/session.module';
import { WorkoutCategoryModule } from './modules/workout-category/workout-category.module';
import { WorkoutModule } from './modules/workout/workout.module';

@Module({
  imports: [
    DbModule,
    AuthModule.forRootAsync(),
    AthleteModule,
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
