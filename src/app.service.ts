import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello !!! This route is no longer used for authentication. It has been moved to /auth/login';
  }
}
