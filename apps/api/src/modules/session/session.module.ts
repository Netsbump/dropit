import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../entities/athlete.entity';
import { Session } from '../../entities/session.entity';
import { Workout } from '../../entities/workout.entity';
import { AthleteModule } from '../athlete/athlete.module';
import { WorkoutModule } from '../workout/workout.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Session, Athlete, Workout]),
    AthleteModule,
    WorkoutModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
