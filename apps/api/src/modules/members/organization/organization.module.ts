import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Organization, Member, Invitation } from './organization.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Organization, Member, Invitation])],
  exports: [MikroOrmModule.forFeature([Organization, Member, Invitation])],
})
export class OrganizationModule {} 