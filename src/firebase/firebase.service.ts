import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from 'firebase-admin';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithRedirect,
} from 'firebase/auth';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class FirebaseService {
  private firebaseClientApp: FirebaseApp;

  constructor() {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSENGER_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };

    this.firebaseClientApp = initializeApp(firebaseConfig);
  }

  async getUserByEmail(email: string) {
    return await auth().getUserByEmail(email);
  }

  async callbackOAuthGoogle(props: {
    accessToken: string;
    refreshToken: string;
    profile: any;
  }) {
    try {
      const user = await this.getUserByEmail(props.profile.emails[0].value);
      return user;
    } catch {
      throw new BadRequestException('User not found');
    }
  }

  async signInOAuthGoogle() {
    const googleOAuth2Provider = new GoogleAuthProvider();

    await signInWithRedirect(this.getAuth(), googleOAuth2Provider);

    googleOAuth2Provider.addScope('email');

    const gotUser = await getRedirectResult(this.getAuth());

    return gotUser;
  }

  async signInWithBasicCredantials(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException(
        '"email" and/or "password" must be passed as query parameters',
      );
    }
    try {
      const user = await signInWithEmailAndPassword(
        this.getAuth(),
        email,
        password,
      );
      return this.verifyToken(await user.user.getIdToken());
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  login(user: UserRecord) {
    return {
      id: user.uid,
      email: user.email,
    };
  }

  verifyToken(token: string) {
    return auth().verifyIdToken(token);
  }

  private getAuth() {
    return getAuth(this.firebaseClientApp);
  }
}
