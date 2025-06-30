import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Organization, Member, Invitation } from './organization.entity';
import { OrganizationService } from './organization.service';

@Module({
  imports: [MikroOrmModule.forFeature([Organization, Member, Invitation])],
  providers: [OrganizationService],
  exports: [MikroOrmModule.forFeature([Organization, Member, Invitation]), OrganizationService],
})
export class OrganizationModule {} 