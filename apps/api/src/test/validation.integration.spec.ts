import { createWorkoutSchema, updateWorkoutSchema } from '@dropit/schemas';

/**
 * Tests de validation Zod automatique avec ts-rest
 *
 * Ces tests vérifient que les schémas Zod définis dans @dropit/schemas
 * valident correctement les données. Ces mêmes schémas sont utilisés
 * par ts-rest via tsRestHandler pour valider automatiquement les requêtes HTTP.
 *
 * Note: ts-rest applique automatiquement la validation Zod sur les endpoints
 * et retourne une erreur 400 avec les détails de validation en cas d'échec.
 */
describe('Zod Validation - Automatic validation with ts-rest', () => {

  describe('createWorkoutSchema - used by POST /api/workout', () => {


    it('should reject when workoutCategory is missing (required field)', () => {
      const invalidPayload = {
        elements: [],
        // workoutCategory manquant
      };

      const result = createWorkoutSchema.safeParse(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const categoryError = result.error.issues.find(
          issue => issue.path.includes('workoutCategory')
        );
        expect(categoryError).toBeDefined();
      }
    });

    it('should reject when numberOfSets is negative (min validation)', () => {
      const invalidPayload = {
        workoutCategory: 'strength',
        elements: [
          {
            type: 'exercise',
            exerciseId: 'some-id',
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: -1, // Invalide ! Doit être >= 1
                exercises: [
                  {
                    exerciseId: 'some-id',
                    reps: 10,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const setsError = result.error.issues.find(
          issue => issue.path.includes('numberOfSets')
        );
        expect(setsError).toBeDefined();
        expect(setsError?.code).toBe('too_small');
      }
    });

    it('should reject when reps is negative (min validation)', () => {
      const invalidPayload = {
        workoutCategory: 'strength',
        elements: [
          {
            type: 'exercise',
            exerciseId: 'some-id',
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: 3,
                exercises: [
                  {
                    exerciseId: 'some-id',
                    reps: -5, // Invalide ! Doit être >= 1
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const repsError = result.error.issues.find(
          issue => issue.path.includes('reps')
        );
        expect(repsError).toBeDefined();
        expect(repsError?.code).toBe('too_small');
      }
    });

    it('should reject when order is negative (min validation)', () => {
      const invalidPayload = {
        workoutCategory: 'strength',
        elements: [
          {
            type: 'exercise',
            exerciseId: 'some-id',
            order: -1, // Invalide ! Doit être >= 0
            blocks: [
              {
                order: 1,
                numberOfSets: 3,
                exercises: [
                  {
                    exerciseId: 'some-id',
                    reps: 10,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const orderError = result.error.issues.find(
          issue => issue.path.includes('order')
        );
        expect(orderError).toBeDefined();
        expect(orderError?.code).toBe('too_small');
      }
    });

    it('should reject when element type is invalid (discriminated union)', () => {
      const invalidPayload = {
        workoutCategory: 'strength',
        elements: [
          {
            type: 'invalid-type', // Doit être 'exercise' ou 'complex'
            exerciseId: 'some-id',
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: 3,
                exercises: [
                  {
                    exerciseId: 'some-id',
                    reps: 10,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have discriminator error
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject when element exerciseId is missing (required field)', () => {
      const invalidPayload = {
        workoutCategory: 'strength',
        elements: [
          {
            type: 'exercise',
            // exerciseId manquant
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: 3,
                exercises: [
                  {
                    exerciseId: 'some-id',
                    reps: 10,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const idError = result.error.issues.find(
          issue => issue.path.includes('exerciseId')
        );
        expect(idError).toBeDefined();
      }
    });

    it('should accept valid workout data', () => {
      const validPayload = {
        workoutCategory: 'strength',
        description: 'A valid workout',
        elements: [
          {
            type: 'exercise',
            exerciseId: 'some-exercise-id',
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: 3,
                rest: 90,
                intensity: {
                  percentageOfMax: 75,
                  type: 'percentage',
                },
                exercises: [
                  {
                    exerciseId: 'some-exercise-id',
                    reps: 10,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.elements.length).toBe(1);
        expect(result.data.elements[0].blocks[0].numberOfSets).toBe(3);
      }
    });

    it('should accept valid workout with complex element', () => {
      const validPayload = {
        workoutCategory: 'strength',
        elements: [
          {
            type: 'complex',
            complexId: 'some-complex-id',
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: 3,
                rest: 120,
                intensity: {
                  percentageOfMax: 80,
                  type: 'percentage',
                },
                exercises: [
                  {
                    exerciseId: 'some-exercise-id-1',
                    reps: 5,
                    order: 1,
                  },
                  {
                    exerciseId: 'some-exercise-id-2',
                    reps: 5,
                    order: 2,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.elements[0].type).toBe('complex');
      }
    });

    it('should accept optional fields as undefined', () => {
      const validPayload = {
        workoutCategory: 'cardio',
        elements: [],
        // description est optionnel
      };

      const result = createWorkoutSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
    });
  });

  describe('updateWorkoutSchema - used by PATCH /api/workout/:id', () => {

    it('should accept partial data (all fields optional)', () => {
      const validPayload = {
        description: 'Updated Description',
      };

      const result = updateWorkoutSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('Updated Description');
      }
    });

    it('should reject when numberOfSets is negative in elements', () => {
      const invalidPayload = {
        elements: [
          {
            type: 'exercise',
            exerciseId: 'some-id',
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: -1, // Invalide
                exercises: [
                  {
                    exerciseId: 'some-id',
                    reps: 10,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = updateWorkoutSchema.safeParse(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        const setsError = result.error.issues.find(
          issue => issue.path.includes('numberOfSets')
        );
        expect(setsError).toBeDefined();
      }
    });

    it('should accept empty update payload', () => {
      const validPayload = {};

      const result = updateWorkoutSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
    });

    it('should accept partial element updates', () => {
      const validPayload = {
        description: 'New description',
        elements: [
          {
            type: 'exercise',
            exerciseId: 'ex-1',
            order: 0,
            blocks: [
              {
                order: 1,
                numberOfSets: 5,
                exercises: [
                  {
                    exerciseId: 'ex-1',
                    reps: 5,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = updateWorkoutSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
    });
  });

  describe('Documentation - How ts-rest uses these schemas', () => {

    it('documents that tsRestHandler automatically validates body', () => {
      /**
       * Dans le controller workout.controller.ts, tsRestHandler applique
       * automatiquement la validation Zod définie dans le contrat:
       *
       * @TsRestHandler(c.createWorkout)
       * createWorkout(): ReturnType<typeof tsRestHandler<typeof c.createWorkout>> {
       *   return tsRestHandler(c.createWorkout, async ({ body }) => {
       *     // body est DÉJÀ validé par createWorkoutSchema ici !
       *     // Si la validation échoue, ts-rest retourne automatiquement 400
       *     const workout = await this.workoutUseCases.createWorkout(body, ...);
       *     return { status: 201, body: workout };
       *   });
       * }
       *
       * Le contrat (workoutContract.ts) spécifie le schéma:
       * createWorkout: {
       *   body: createWorkoutSchema, // ← Ce schéma est utilisé pour validation
       *   ...
       * }
       *
       * Comportement en cas d'erreur de validation:
       * - Status: 400 Bad Request
       * - Body: { bodyResult: { success: false, error: { issues: [...] } } }
       */
      expect(true).toBe(true);
    });
  });
});
