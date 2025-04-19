import { Module } from '@nestjs/common';
import { PersonalRecordController } from './personal-record.controller';
import { PersonalRecordService } from './personal-record.service';

@Module({
  controllers: [PersonalRecordController],
  providers: [PersonalRecordService],
  exports: [PersonalRecordService],
})
export class PersonalRecordModule {}
