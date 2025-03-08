import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AthleteSession } from '../../entities/athlete-session.entity';
import { Athlete } from '../../entities/athlete.entity';
import { Session } from '../../entities/session.entity';
import { AthleteModule } from '../athlete/athlete.module';
import { SessionModule } from '../session/session.module';
import { AthleteSessionController } from './athlete-session.controller';
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
