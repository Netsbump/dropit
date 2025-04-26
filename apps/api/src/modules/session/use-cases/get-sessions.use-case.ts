import { SessionDto } from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionPresenter } from '../session.presenter';
import { SessionRepository } from '../session.repository';

@Injectable()
export class GetSessionsUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly presenter: SessionPresenter
  ) {}

  async execute() {
    try {
      const sessions = await this.sessionRepository.findAllWithDetails();
      if (!sessions) {
        throw new NotFoundException('Sessions not found');
      }
      return this.presenter.present(sessions);
    } catch (error) {
      return this.presenter.presentError(error as Error);
    }
  }
}
