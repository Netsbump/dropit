import { Invitation } from '../../domain/organization/invitation.entity';

export const INVITATION_REPO = Symbol('INVITATION_REPO');

export interface IInvitationRepository {
  findById(id: string): Promise<Invitation | null>;
  save(invitation: Invitation): Promise<void>;
}
