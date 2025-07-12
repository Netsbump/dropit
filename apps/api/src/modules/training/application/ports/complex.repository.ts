import { Complex } from "../../domain/complex.entity";

export const COMPLEX_REPO = Symbol('COMPLEX_REPO');

export interface IComplexRepository {
  getOne(id: string, organizationId: string): Promise<Complex | null>;
  getAll(organizationId: string): Promise<Complex[]>;
  save(complex: Complex): Promise<void>;
  remove(complex: Complex): Promise<void>;
} 