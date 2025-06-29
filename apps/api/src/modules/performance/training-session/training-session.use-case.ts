import { Injectable } from '@nestjs/common';
import { TrainingSessionPresenter } from './training-session.presenter';
import { TrainingSessionRepository } from './training-session.repository';

@Injectable()
export class TrainingSessionUseCase {
  constructor(
    private readonly trainingSessionRepository: TrainingSessionRepository,
    private readonly trainingSessionPresenter: TrainingSessionPresenter
  ) {}

  async getOne(id: string) {
    try {
      const session = await this.trainingSessionRepository.findOneWithDetails(id);
      return this.trainingSessionPresenter.presentOne(session);
    } catch (error) {
      return this.trainingSessionPresenter.presentError(error as Error);
    }
  }

  async getAll() {
    try {
      const sessions = await this.trainingSessionRepository.findAllWithDetails();
      return this.trainingSessionPresenter.present(sessions);
    } catch (error) {
      return this.trainingSessionPresenter.presentError(error as Error);
    }
  }
}
