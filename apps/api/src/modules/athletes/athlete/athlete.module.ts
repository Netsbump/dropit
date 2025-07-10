import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PersonalRecord } from '../personal-record/personal-record.entity';
import { PersonalRecordModule } from '../personal-record/personal-record.module';

import { Athlete } from './domain/athlete.entity';
import { CompetitorStatus } from './domain/competitor-status.entity';

// ports (symboles)
import { ATHLETE_REPO } from './application/ports/athlete.repository';
import { COMPETITOR_STATUS_REPO } from './application/ports/competitor-status.repository';

// implémentations MikroORM
import { MikroAthleteRepository } from './infrastructure/mikro-athlete.repository';
import { MikroCompetitorStatusRepository } from './infrastructure/mikro-competitor-status.repository';

// contrôleur & use-cases
import { AthleteController } from './interface/controllers/athlete.controller';
import { CompetitorStatusController } from './interface/controllers/competitor-status.controller';
import { CompetitorStatusUseCases } from './application/use-cases/competitor-status.use-cases';
import { AthleteUseCases } from './application/use-cases/athlete-use-cases';
import { OrganizationModule } from '../../identity/organization/organization.module';


@Module({
  imports: [
    // on déclare aussi les custom-repositories ici
    MikroOrmModule.forFeature({
      entities: [Athlete, PersonalRecord, CompetitorStatus],
    }),
    forwardRef(() => PersonalRecordModule),
    forwardRef(() => OrganizationModule),
  ],

  controllers: [AthleteController, CompetitorStatusController],

  providers: [
    // implémentations MikroORM
    MikroAthleteRepository,
    MikroCompetitorStatusRepository,

    // liaisons port -> implémentation
    { provide: ATHLETE_REPO,  useClass: MikroAthleteRepository },
    { provide: COMPETITOR_STATUS_REPO, useClass: MikroCompetitorStatusRepository },

    // use-cases
    AthleteUseCases,
    CompetitorStatusUseCases,
  ],

  // ce que d’autres modules pourront injecter
  exports: [ATHLETE_REPO, COMPETITOR_STATUS_REPO],
})
export class AthleteModule {}
