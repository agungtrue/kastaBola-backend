import { Injectable, Logger} from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getWelcome(): object {
    this.logger.log(`First Load`);
    return {
      name: 'KASTABOLA API Engine',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())} seconds`,
    };
  }
}
