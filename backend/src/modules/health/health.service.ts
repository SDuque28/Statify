import { Injectable } from '@nestjs/common';

export interface HealthCheckResponse {
  status: 'ok';
  service: 'statify-backend';
  timestamp: string;
}

@Injectable()
export class HealthService {
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'statify-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
