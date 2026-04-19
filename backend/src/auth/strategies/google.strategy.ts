import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

type GoogleProfile = {
  id?: string;
  displayName?: string;
  emails?: Array<{ value?: string }>;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? '',
      passReqToCallback: false,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    const email = profile?.emails?.[0]?.value;
    if (!email) {
      return done(new UnauthorizedException('Google account has no email'), false);
    }

    return done(null, {
      provider: 'google',
      providerId: profile.id,
      email,
      name: profile.displayName,
    });
  }
}

