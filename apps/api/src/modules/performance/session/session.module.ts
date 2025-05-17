import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../members/athlete/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { Workout } from '../../training/workout/workout.entity';
import { WorkoutModule } from '../../training/workout/workout.module';
import { SessionController } from './session.controller';
import { Session } from './session.entity';
import { SessionPresenter } from './session.presenter';
import { SessionRepository } from './session.repository';
import { SessionService } from './session.service';
import { SessionUseCase } from './session.use-case';
@Module({
  imports: [
    MikroOrmModule.forFeature([Session, Athlete, Workout]),
    AthleteModule,
    WorkoutModule,
  ],
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionRepository,
    SessionPresenter,
    SessionUseCase,
  ],
  exports: [SessionService, SessionRepository],
})
export class SessionModule {}
