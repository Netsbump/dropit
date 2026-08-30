import type { AthleteId } from '../../../domain/athlete-id';
import { PhysicalMetric } from '../../../domain/physical-metric';
import type { PhysicalMetricId } from '../../../domain/physical-metric-id';

export const PHYSICAL_METRIC_REPO = Symbol('PHYSICAL_METRIC_REPO');

export interface IPhysicalMetricRepository {
  findById(id: PhysicalMetricId): Promise<PhysicalMetric | null>;
  listByAthleteId(athleteId: AthleteId): Promise<PhysicalMetric[]>;
  add(physicalMetric: PhysicalMetric): Promise<PhysicalMetric>;
  save(physicalMetric: PhysicalMetric): Promise<PhysicalMetric>;
  remove(physicalMetric: PhysicalMetric): Promise<void>;
}
