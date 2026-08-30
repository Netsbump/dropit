import { NotFoundError } from '../../../../shared/application/errors/not-found.error';
import type { PhysicalMetricId } from '../../domain/physical-metric-id';

export class PhysicalMetricNotFoundError extends NotFoundError {
  constructor(physicalMetricId: PhysicalMetricId) {
    super(`Physical metric with ID ${physicalMetricId} not found`);
  }
}
