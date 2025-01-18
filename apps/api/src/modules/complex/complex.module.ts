import { Module } from '@nestjs/common';
import { ComplexController } from './complex.controller';
import { ComplexService } from './complex.service';

@Module({
  controllers: [ComplexController],
  providers: [ComplexService],
})
export class ComplexModule {}
