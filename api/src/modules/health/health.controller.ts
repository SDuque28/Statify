import { Controller, Get } from '@nestjs/common';
import { HealthService, type HealthCheckResponse } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth(): HealthCheckResponse {
    return this.healthService.getHealth();
  }
}
