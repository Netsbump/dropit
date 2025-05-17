import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Athlete } from '../../members/athlete/athlete.entity';
import { AthleteModule } from '../../members/athlete/athlete.module';
import { Session } from '../session/session.entity';
import { SessionModule } from '../session/session.module';
import { AthleteSessionController } from './athlete-session.controller';
import { AthleteSession } from './athlete-session.entity';
import { AthleteSessionService } from './athlete-session.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([AthleteSession, Athlete, Session]),
    AthleteModule,
    SessionModule,
  ],
  controllers: [AthleteSessionController],
  providers: [AthleteSessionService],
  exports: [AthleteSessionService],
})
export class AthleteSessionModule {}
