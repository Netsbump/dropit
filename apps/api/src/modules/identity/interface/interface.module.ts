import { Module } from '@nestjs/common';
import { InvitationController } from './controllers/invitation.controller';

@Module({
  controllers: [InvitationController],
})
export class IdentityInterfaceModule {} 