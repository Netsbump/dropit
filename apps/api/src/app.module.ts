import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { devOrmConfig, testOrmConfig } from './mikro-orm.config';
import config from './mikro-orm.config';
import { AthleteSessionModule } from './modules/athlete-session/athlete-session.module';
import { AthleteModule } from './modules/athlete/athlete.module';
import { ComplexCategoryModule } from './modules/complex-category/complex-category.module';
import { ComplexModule } from './modules/complex/complex.module';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { ExerciseCategoryModule } from './modules/exerciseCategory/exerciseCategory.module';
import { SessionModule } from './modules/session/session.module';
import { WorkoutCategoryModule } from './modules/workout-category/workout-category.module';
import { WorkoutModule } from './modules/workout/workout.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(config),
    AthleteModule,
    AthleteSessionModule,
    ExerciseModule,
    ExerciseCategoryModule,
    ComplexModule,
    ComplexCategoryModule,
    SessionModule,
    WorkoutCategoryModule,
    WorkoutModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
