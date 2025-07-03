import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PersonalRecord } from '../../performance/personal-record/personal-record.entity';
import { PersonalRecordModule } from '../../performance/personal-record/personal-record.module';

import { Athlete } from './domain/athlete.entity';

// ports (symboles)
import { ATHLETE_READ_REPO } from './application/ports/athlete-read.repository';
import { ATHLETE_WRITE_REPO } from './application/ports/athlete-write.repository';

// implémentations MikroORM
import { MikroAthleteReadRepository } from './infrastructure/read-model/mikro-athlete-read.repository';
import { MikroAthleteWriteRepository } from './infrastructure/persistence/mikro-athlete-write.repository';

// contrôleur & use-cases
import { AthleteController } from './interface/athlete.controller';
import { CreateAthleteUseCase } from './application/use-cases/create-athlete.use-case';
import { DeleteAthleteUseCase } from './application/use-cases/delete-athlete.use-case';
import { GetAthleteUseCase } from './application/use-cases/get-athlete.use-case';
import { GetAthletesUseCase } from './application/use-cases/get-athletes.use-case';
import { UpdateAthleteUseCase } from './application/use-cases/update-athlete.use-case';

@Module({
  imports: [
    // on déclare aussi les custom-repositories ici
    MikroOrmModule.forFeature({
      entities: [Athlete, PersonalRecord],
    }),
    forwardRef(() => PersonalRecordModule),
  ],

  controllers: [AthleteController],

  providers: [
    // implémentations MikroORM
    MikroAthleteReadRepository,
    MikroAthleteWriteRepository,

    // liaisons port -> implémentation
    { provide: ATHLETE_READ_REPO,  useClass: MikroAthleteReadRepository },
    { provide: ATHLETE_WRITE_REPO, useClass: MikroAthleteWriteRepository },

    // use-cases
    GetAthletesUseCase,
    GetAthleteUseCase,
    CreateAthleteUseCase,
    UpdateAthleteUseCase,
    DeleteAthleteUseCase,
  ],

  // ce que d’autres modules pourront injecter
  exports: [ATHLETE_READ_REPO, ATHLETE_WRITE_REPO],
})
export class AthleteModule {}
