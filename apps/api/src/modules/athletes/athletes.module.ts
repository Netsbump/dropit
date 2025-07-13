import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { Athlete } from './domain/athlete.entity';
import { CompetitorStatus } from './domain/competitor-status.entity';
import { PersonalRecord } from './domain/personal-record.entity';
import { Exercise } from '../training/domain/exercise.entity';

// ports (symboles)
import { ATHLETE_REPO } from './application/ports/athlete.repository';
import { COMPETITOR_STATUS_REPO } from './application/ports/competitor-status.repository';
import { PERSONAL_RECORD_REPO } from './application/ports/personal-record.repository';

// implémentations MikroORM
import { MikroAthleteRepository } from './infrastructure/mikro-athlete.repository';
import { MikroCompetitorStatusRepository } from './infrastructure/mikro-competitor-status.repository';
import { MikroPersonalRecordRepository } from './infrastructure/mikro-personal-record.repository';

// contrôleur & use-cases
import { AthleteController } from './interface/controllers/athlete.controller';
import { CompetitorStatusController } from './interface/controllers/competitor-status.controller';
import { PersonalRecordController } from './interface/controllers/personal-record.controller';
import { CompetitorStatusUseCases } from './application/use-cases/competitor-status.use-cases';
import { AthleteUseCases } from './application/use-cases/athlete-use-cases';
import { PersonalRecordUseCases } from './application/use-cases/personal-record.use-cases';
import { IdentityModule } from '../identity/identity.module';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [
    // on déclare aussi les custom-repositories ici
    MikroOrmModule.forFeature({
      entities: [Athlete, PersonalRecord, CompetitorStatus, Exercise],
    }),
    forwardRef(() => IdentityModule),
    forwardRef(() => TrainingModule),
  ],

  controllers: [AthleteController, CompetitorStatusController, PersonalRecordController],

  providers: [
    // implémentations MikroORM
    MikroAthleteRepository,
    MikroCompetitorStatusRepository,
    MikroPersonalRecordRepository,

    // liaisons port -> implémentation
    { provide: ATHLETE_REPO,  useClass: MikroAthleteRepository },
    { provide: COMPETITOR_STATUS_REPO, useClass: MikroCompetitorStatusRepository },
    { provide: PERSONAL_RECORD_REPO, useClass: MikroPersonalRecordRepository },

    // use-cases
    AthleteUseCases,
    CompetitorStatusUseCases,
    PersonalRecordUseCases,
  ],

  // ce que d’autres modules pourront injecter
  exports: [ATHLETE_REPO, COMPETITOR_STATUS_REPO, PERSONAL_RECORD_REPO],
})
export class AthletesModule {}
