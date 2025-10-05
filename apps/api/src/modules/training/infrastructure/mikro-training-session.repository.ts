import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { TrainingSession } from "../domain/training-session.entity";
import { ITrainingSessionRepository } from "../application/ports/training-session.repository.port";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MikroTrainingSessionRepository extends EntityRepository<TrainingSession> implements ITrainingSessionRepository {
  constructor(public readonly em: EntityManager) {
    super(em, TrainingSession);
  }

  async getOne(id: string, organizationId: string): Promise<TrainingSession | null> {
    return await this.em.findOne(
      TrainingSession, 
      { id, organization: { id: organizationId } },
      { populate: ['workout', 'athletes', 'athletes.athlete'] }
    );
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

  async getByAthleteWithDetails(athleteId: string, organizationId: string, startDate?: string, endDate?: string): Promise<TrainingSession[]> {
    interface WhereClause {
      organization: { id: string };
      athletes: { athlete: { id: string } };
      scheduledDate?: { $gte: Date; $lte: Date };
    }

    const where: WhereClause = {
      organization: { id: organizationId },
      athletes: { athlete: { id: athleteId } }
    };

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startOfDay = new Date(start.setHours(0, 0, 0, 0));
      const endOfDay = new Date(end.setHours(23, 59, 59, 999));
      where.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    return await this.em.find(
        TrainingSession,
        where,
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

  async save(trainingSession: TrainingSession): Promise<void> {
    return await this.em.persistAndFlush(trainingSession);
  }

  async remove(trainingSession: TrainingSession): Promise<void> {
    return await this.em.removeAndFlush(trainingSession);
  }
}