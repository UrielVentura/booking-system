/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UsersService } from 'src/users/user.service';

@Injectable()
export class AuthService {
  private oauth2Client;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );
  }

  async verifyAndCreateUser(token: string) {
    try {
      const decoded = await this.verifyAuth0Token(token);

      const user = await this.usersService.findOrCreate({
        auth0Id: decoded.sub,
        email: decoded.email || `${decoded.sub}@placeholder.com`,
        name: decoded.name || decoded.nickname || 'User',
        picture: decoded.picture,
      });

      return user;
    } catch (error) {
      console.error('Error in verifyAndCreateUser:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async verifyAuth0Token(token: string): Promise<any> {
    const decoded = jwt.decode(token);

    if (decoded && typeof decoded === 'object' && 'email' in decoded) {
      return decoded;
    }

    const client = jwksClient({
      jwksUri: `https://${this.configService.get('AUTH0_DOMAIN')}/.well-known/jwks.json`,
    });

    const getKey = (header, callback) => {
      client.getSigningKey(header.kid, (error, key) => {
        if (error) {
          callback(error);
        } else {
          const signingKey = key.getPublicKey();
          callback(null, signingKey);
        }
      });
    };

    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: this.configService.get('AUTH0_AUDIENCE'),
          issuer: `https://${this.configService.get('AUTH0_DOMAIN')}/`,
          algorithms: ['RS256'],
        },
        (error, decoded) => {
          if (error) {
            const unverified = jwt.decode(token);
            if (
              unverified &&
              typeof unverified === 'object' &&
              'email' in unverified
            ) {
              resolve(unverified);
            } else {
              reject(error);
            }
          } else {
            resolve(decoded);
          }
        },
      );
    });
  }

  async connectGoogleCalendar(userId: string, code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      await this.usersService.updateGoogleTokens(userId, {
        refreshToken: tokens.refresh_token,
        calendarId: 'primary',
      });

      return { success: true };
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      throw new UnauthorizedException('Failed to connect Google Calendar');
    }
  }

  getGoogleAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }
}
