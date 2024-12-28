import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ExerciseDto } from './exercice.dto';
import { ExerciseService } from './exercise.service';
@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  async getExercises() {
    return this.exerciseService.getExercises();
  }

  @Get(':id')
  async getExercise(@Param('id') id: number) {
    return this.exerciseService.getExercise(id);
  }

  @Post()
  async createExercise(@Body() exercise: ExerciseDto) {
    return this.exerciseService.createExercise(exercise);
  }

  @Put(':id')
  async updateExercise(@Param('id') id: number, @Body() exercise: ExerciseDto) {
    return this.exerciseService.updateExercise(id, exercise);
  }

  @Delete(':id')
  async deleteExercise(@Param('id') id: number) {
    return this.exerciseService.deleteExercise(id);
  }

  @Get('search')
  async searchExercises(@Query('query') query: string) {
    return this.exerciseService.searchExercises(query);
  }
}
