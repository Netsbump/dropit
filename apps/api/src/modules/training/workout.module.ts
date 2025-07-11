import { Module } from '@nestjs/common';
import { WorkoutController } from './interface/controllers/workout.controller';
import { WorkoutUseCases } from './application/use-cases/workout.use-cases';
import { MikroWorkoutRepository } from './infrastructure/mikro-workout.repository';
import { OrganizationModule } from '../identity/organization/organization.module';

@Module({
  imports: [OrganizationModule],
  controllers: [WorkoutController],
  providers: [
    WorkoutUseCases,
    {
      provide: 'WorkoutRepository',
      useClass: MikroWorkoutRepository,
    },
  ],
  exports: [WorkoutUseCases],
})
export class WorkoutModule {}
