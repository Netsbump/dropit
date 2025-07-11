import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ComplexCategoryController } from './interface/controllers/complex-category.controller';
import { ComplexCategory } from './domain/complex-category.entity';
import { ComplexCategoryUseCase } from './application/use-cases/complex-category.use-cases';
import { MikroComplexCategoryRepository } from './infrastructure/mikro-complex-category.repository';
import { COMPLEX_CATEGORY_REPO } from './application/ports/complex-category.repository';
import { OrganizationModule } from '../identity/organization/organization.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([ComplexCategory]),
    OrganizationModule,
  ],
  controllers: [ComplexCategoryController],
  providers: [
    // implementations MikroORM
    MikroComplexCategoryRepository,

    // use-cases
    ComplexCategoryUseCase,

    // liaisons port -> implementation
    { provide: COMPLEX_CATEGORY_REPO, useClass: MikroComplexCategoryRepository },
  ],
  exports: [COMPLEX_CATEGORY_REPO],
})
export class ComplexCategoryModule {}
