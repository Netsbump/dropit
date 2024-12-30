export type ExerciseDto = {
  id: number;
  name: string;
  exerciseType: {
    id: number;
    name: string;
  };
  video?: number;
  description?: string;
  englishName?: string;
  shortName?: string;
};

export type CreateExerciseDto = {
  exerciseType: number;
  video?: number;
  name: string;
  description?: string;
  englishName?: string;
  shortName?: string;
};

export type UpdateExerciseDto = {
  exerciseType?: number;
  video?: number;
  name?: string;
  description?: string;
  englishName?: string;
  shortName?: string;
};
