import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ExerciseType } from '../../entities/exerciseType.entity';
import { ExerciseTypeService } from './exerciseType.service';

@Controller('exercise-type')
export class ExerciseTypeController {
  constructor(private readonly exerciseTypeService: ExerciseTypeService) {}

  @Get()
  async getExerciseTypes() {
    return this.exerciseTypeService.getExerciseTypes();
  }

  @Get(':id')
  async getExerciseType(@Param('id') id: number) {
    return this.exerciseTypeService.getExerciseType(id);
  }

  @Post()
  async createExerciseType(@Body() exerciseType: ExerciseType) {
    return this.exerciseTypeService.createExerciseType(exerciseType);
  }

  @Put(':id')
  async updateExerciseType(
    @Param('id') id: number,
    @Body() exerciseType: ExerciseType
  ) {
    return this.exerciseTypeService.updateExerciseType(id, exerciseType);
  }

  @Delete(':id')
  async deleteExerciseType(@Param('id') id: number) {
    return this.exerciseTypeService.deleteExerciseType(id);
  }
}
