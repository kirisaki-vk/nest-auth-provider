import { Controller, Get, Query } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get('login')
  login(@Query('email') email: string, @Query('password') password: string) {
    return this.firebaseService.signInWithBasicCredantials(email, password);
  }
}
