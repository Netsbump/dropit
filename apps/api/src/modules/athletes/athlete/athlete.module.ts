import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PersonalRecord } from '../personal-record/personal-record.entity';
import { PersonalRecordModule } from '../personal-record/personal-record.module';

import { Athlete } from './domain/athlete.entity';
import { CompetitorStatus } from './domain/competitor-status.entity';

// ports (symboles)
import { ATHLETE_READ_REPO } from './application/ports/athlete-read.repository';
import { ATHLETE_WRITE_REPO } from './application/ports/athlete-write.repository';
import { COMPETITOR_STATUS_REPO } from './application/ports/competitor-status.repository';

// implémentations MikroORM
import { MikroAthleteReadRepository } from './infrastructure/read-model/mikro-athlete-read.repository';
import { MikroAthleteWriteRepository } from './infrastructure/persistence/mikro-athlete-write.repository';
import { MikroCompetitorStatusRepository } from './infrastructure/mikro-competitor-status.repository';

// contrôleur & use-cases
import { AthleteController } from './interface/athlete.controller';
import { CompetitorStatusController } from './interface/competitor-status.controller';
import { CreateAthleteUseCase } from './application/use-cases/create-athlete.use-case';
import { DeleteAthleteUseCase } from './application/use-cases/delete-athlete.use-case';
import { GetAthleteUseCase } from './application/use-cases/get-athlete.use-case';
import { GetAthletesUseCase } from './application/use-cases/get-athletes.use-case';
import { UpdateAthleteUseCase } from './application/use-cases/update-athlete.use-case';
import { CompetitorStatusUseCases } from './application/use-cases/competitor-status.use-cases';
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
    MikroAthleteReadRepository,
    MikroAthleteWriteRepository,
    MikroCompetitorStatusRepository,

    // liaisons port -> implémentation
    { provide: ATHLETE_READ_REPO,  useClass: MikroAthleteReadRepository },
    { provide: ATHLETE_WRITE_REPO, useClass: MikroAthleteWriteRepository },
    { provide: COMPETITOR_STATUS_REPO, useClass: MikroCompetitorStatusRepository },

    // use-cases
    GetAthletesUseCase,
    GetAthleteUseCase,
    CreateAthleteUseCase,
    UpdateAthleteUseCase,
    DeleteAthleteUseCase,
    CompetitorStatusUseCases,
  ],

  // ce que d’autres modules pourront injecter
  exports: [ATHLETE_READ_REPO, ATHLETE_WRITE_REPO, COMPETITOR_STATUS_REPO],
})
export class AthleteModule {}
