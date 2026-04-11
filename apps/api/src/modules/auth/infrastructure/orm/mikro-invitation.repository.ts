import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Invitation } from '../../domain/organization/invitation.entity';
import { IInvitationRepository } from '../../application/ports/invitation.repository.port';

@Injectable()
export class MikroInvitationRepository extends EntityRepository<Invitation> implements IInvitationRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Invitation);
  }

  async findById(id: string): Promise<Invitation | null> {
    return await this.em.findOne(Invitation, { id }, { populate: ['organization'] });
  }

  async save(invitation: Invitation): Promise<void> {
    await this.em.persistAndFlush(invitation);
  }
}
