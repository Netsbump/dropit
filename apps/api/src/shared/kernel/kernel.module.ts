import { Module } from '@nestjs/common';
import { ID_GENERATOR } from './id-generator.port';
import { UuidIdGenerator } from './uuid-id-generator';

@Module({
  providers: [
    {
      provide: ID_GENERATOR,
      useClass: UuidIdGenerator,
    },
  ],
  exports: [ID_GENERATOR],
})
export class KernelModule {}
