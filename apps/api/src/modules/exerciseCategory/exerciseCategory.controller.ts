import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ExerciseCategory } from '../../entities/exerciseCategory.entity';
import { ExerciseCategoryService } from './exerciseCategory.service';

@Controller('exercise-category')
export class ExerciseCategoryController {
  constructor(
    private readonly exerciseCategoryService: ExerciseCategoryService
  ) {}

  @Get()
  async getExerciseCategories() {
    return this.exerciseCategoryService.getExerciseCategories();
  }

  @Get(':id')
  async getExerciseCategory(@Param('id') id: string) {
    return this.exerciseCategoryService.getExerciseCategory(id);
  }

  @Post()
  async createExerciseCategory(@Body() exerciseCategory: ExerciseCategory) {
    return this.exerciseCategoryService.createExerciseCategory(
      exerciseCategory
    );
  }

  @Put(':id')
  async updateExerciseCategory(
    @Param('id') id: string,
    @Body() exerciseCategory: ExerciseCategory
  ) {
    return this.exerciseCategoryService.updateExerciseCategory(
      id,
      exerciseCategory
    );
  }

  @Delete(':id')
  async deleteExerciseCategory(@Param('id') id: string) {
    return this.exerciseCategoryService.deleteExerciseCategory(id);
  }
}
