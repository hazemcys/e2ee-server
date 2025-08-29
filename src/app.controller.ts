import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  root() {
    return { status: 'ok', name: 'e2ee-server' };
  }

  @Get('/health')
  health() {
    return { status: 'healthy' };
  }

  @Get('/debug')
  debug() {
    return { 
      status: 'debug working',
      adminSecret: process.env.ADMIN_SECRET ? 'Set' : 'Not set',
      timestamp: new Date().toISOString()
    };
  }
}
