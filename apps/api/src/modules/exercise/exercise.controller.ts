import { exerciseContract } from '@dropit/contract';
import { Controller } from '@nestjs/common';
import {
  NestControllerInterface,
  NestRequestShapes,
  TsRest,
  TsRestHandler,
  TsRestRequest,
  nestControllerContract,
} from '@ts-rest/nest';
import { UpdateExerciseDto } from './exercice.dto';
import { ExerciseService } from './exercise.service';

const c = nestControllerContract(exerciseContract);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class ExerciseController implements NestControllerInterface<typeof c> {
  constructor(private readonly exerciseService: ExerciseService) {}

  // ---------------------------------------
  // GET /exercise
  // ---------------------------------------
  @TsRest(c.getExercises)
  async getExercises(@TsRestRequest() request: RequestShapes['getExercises']) {
    const exercises = await this.exerciseService.getExercises();

    if (!exercises) {
      return {
        status: 404 as const,
        body: {
          message: 'Exercises not found',
        },
      };
    }

    return {
      status: 200 as const,
      body: exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        exerciseType: {
          id: exercise.exerciseType.id,
          name: exercise.exerciseType.name,
        },
        video: exercise.video?.toString() ?? '',
        description: exercise.description ?? '',
        englishName: exercise.englishName ?? '',
        shortName: exercise.shortName ?? '',
      })),
    };
  }

  // ---------------------------------------
  // GET /exercise/:id
  // ---------------------------------------
  @TsRest(c.getExercise)
  async getExercise(@TsRestRequest() { params }: RequestShapes['getExercise']) {
    // Dans le contrat, pathParams = { id: z.string() }
    // => on cast en number (ou on utilise z.coerce.number() dans le contrat)
    const id = parseInt(params.id, 10);

    const exercise = await this.exerciseService.getExercise(id);

    if (!exercise) {
      return {
        status: 404 as const,
        body: {
          message: 'Exercise not found',
        },
      };
    }

    // Contrat : 200 => un objet unique, pas de champ "data" ici
    return {
      status: 200 as const,
      body: {
        id: exercise.id,
        name: exercise.name,
        exerciseType: {
          id: exercise.exerciseType.id,
          name: exercise.exerciseType.name,
        },
        video: exercise.video?.toString() ?? '',
        description: exercise.description ?? '',
        englishName: exercise.englishName ?? '',
        shortName: exercise.shortName ?? '',
      },
    };
  }

  // ---------------------------------------
  // POST /exercise
  // ---------------------------------------
  @TsRest(c.createExercise)
  async createExercise(
    @TsRestRequest() { body }: RequestShapes['createExercise']
  ) {
    // body = { name: string; description?: string; exerciseType: number; ... }
    // Contrat : 201 => un objet { id, name, exerciseType, ... }
    //           400 => { message } si besoin
    //           500 => { message } en cas d'erreur interne ?

    try {
      const newExercise = await this.exerciseService.createExercise(body);
      return {
        status: 201 as const,
        body: {
          id: newExercise.id,
          name: newExercise.name,
          description: newExercise.description ?? '',
          exerciseType: {
            id: newExercise.exerciseType.id,
            name: newExercise.exerciseType.name,
          },
          video: newExercise.video?.toString() ?? '',
          englishName: newExercise.englishName ?? '',
          shortName: newExercise.shortName ?? '',
        },
      };
    } catch (error) {
      return {
        status: 400 as const,
        body: { message: 'Could not create exercise' },
      };
    }
  }

  // ---------------------------------------
  // PUT /exercise/:id
  // ---------------------------------------
  @TsRest(c.updateExercise)
  async updateExercise(
    @TsRestRequest() { params, body }: RequestShapes['updateExercise']
  ) {
    // Todo: revoir si je passe en number ou string dans le contrat
    const id = parseInt(params.id, 10);

    const dataToUpdate: Partial<UpdateExerciseDto> = {};

    //Todo : déplacer dans le service ?
    if (body.name !== undefined) {
      dataToUpdate.name = body.name;
    }
    if (body.description !== undefined) {
      dataToUpdate.description = body.description;
    }
    if (body.exerciseType !== undefined) {
      // exemple : le contrat déclare exerciseType: z.string().optional()
      // on cast en number
      dataToUpdate.exerciseType = parseInt(body.exerciseType, 10);
    }
    if (body.video !== undefined) {
      dataToUpdate.video = parseInt(body.video, 10);
    }
    if (body.englishName !== undefined) {
      dataToUpdate.englishName = body.englishName;
    }
    if (body.shortName !== undefined) {
      dataToUpdate.shortName = body.shortName;
    }

    const updated = await this.exerciseService.updateExercise(id, dataToUpdate);

    if (!updated) {
      return {
        status: 404 as const,
        body: { message: 'Exercise not found' },
      };
    }

    return {
      status: 200 as const,
      body: {
        id: updated.id,
        name: updated.name,
        exerciseType: {
          id: updated.exerciseType.id,
          name: updated.exerciseType.name,
        },
        video: updated.video?.toString() ?? '',
        description: updated.description ?? '',
        englishName: updated.englishName ?? '',
        shortName: updated.shortName ?? '',
      },
    };
  }

  // ---------------------------------------
  // DELETE /exercise/:id
  // ---------------------------------------
  @TsRest(c.deleteExercise)
  async deleteExercise(
    @TsRestRequest() { params }: RequestShapes['deleteExercise']
  ) {
    const id = parseInt(params.id, 10);

    const deleted = await this.exerciseService.deleteExercise(id);

    if (!deleted) {
      return { status: 404 as const, body: { message: 'Exercise not found' } };
    }

    return {
      status: 200 as const,
      body: { message: 'Exercise deleted successfully' },
    };
  }

  // ---------------------------------------
  // GET /exercise/search?like=xxx
  // ---------------------------------------
  @TsRestHandler(c.searchExercises)
  async searchExercises(
    @TsRestRequest() { query }: RequestShapes['searchExercises']
  ) {
    // Contrat : query = { like: z.string() }
    const found = await this.exerciseService.searchExercises(query.like);

    if (!found || found.length === 0) {
      return { status: 404 as const, body: { message: 'No exercises found' } };
    }

    return {
      status: 200 as const,
      body: found.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        exerciseType: {
          id: exercise.exerciseType.id,
          name: exercise.exerciseType.name,
        },
        video: exercise.video?.toString() ?? '',
        description: exercise.description ?? '',
        englishName: exercise.englishName ?? '',
        shortName: exercise.shortName ?? '',
      })),
    };
  }
}
