import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { TrainingSession } from "../domain/training-session.entity";
import { TrainingSessionRepository } from "../application/training-session.repository";

export class MikroTrainingSessionRepository extends EntityRepository<TrainingSession> implements TrainingSessionRepository {
  constructor(public readonly em: EntityManager) {
    super(em, TrainingSession);
  }

  async getAllWithDetails(organizationId: string): Promise<TrainingSession[]> {
    return await this.em.find(
        TrainingSession,
        { organization: { id: organizationId } },
        {
          populate: [
            'athletes',
            'athletes.athlete',
            'workout',
            'workout.elements',
            'workout.elements.exercise',
            'workout.elements.exercise.exerciseCategory',
            'workout.elements.complex',
            'workout.elements.complex.complexCategory',
            'workout.elements.complex.exercises',
            'workout.elements.complex.exercises.exercise',
            'workout.elements.complex.exercises.exercise.exerciseCategory',
          ],
        }
    );
  }

  async getOneWithDetails(id: string, organizationId: string): Promise<TrainingSession | null> {
    return await this.em.findOne(
        TrainingSession,
        { id, organization: { id: organizationId } },
        {
          populate: [
            'athletes',
            'athletes.athlete',
            'workout',
            'workout.elements',
            'workout.elements.exercise',
            'workout.elements.exercise.exerciseCategory',
            'workout.elements.complex',
            'workout.elements.complex.complexCategory',
            'workout.elements.complex.exercises',
            'workout.elements.complex.exercises.exercise',
            'workout.elements.complex.exercises.exercise.exerciseCategory',
          ],
        }
      );
  }

  async getAllWithDetailsByAthlete(athleteId: string): Promise<TrainingSession[]> {
    return await this.em.find(TrainingSession, { athletes: { athlete: { id: athleteId } } });
  }

  async getOneWithDetailsByAthlete(athleteId: string, id: string): Promise<TrainingSession> {
    return await this.em.findOne(TrainingSession, { id, athletes: { athlete: { id: athleteId } } });
  }

  async save(trainingSession: TrainingSession): Promise<TrainingSession> {
    return await this.em.persistAndFlush(trainingSession);
  }

  async update(id: string, trainingSession: TrainingSession): Promise<TrainingSession> {
    return await this.em.persistAndFlush(trainingSession);
  }

  async remove(id: string): Promise<void> {
    return await this.em.removeAndFlush(id);
  }
}