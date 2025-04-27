import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionPresenter } from './session.presenter';
import { SessionRepository } from './session.repository';

@Injectable()
export class SessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly presenter: SessionPresenter
  ) {}

  async getOne(id: string) {
    try {
      const session = await this.sessionRepository.findOneWithDetails(id);
      return this.presenter.presentOne(session);
    } catch (error) {
      return this.presenter.presentError(error as Error);
    }
  }

  async getAll() {
    try {
      const sessions = await this.sessionRepository.findAllWithDetails();
      return this.presenter.present(sessions);
    } catch (error) {
      return this.presenter.presentError(error as Error);
    }
  }
}
