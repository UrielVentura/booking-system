/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';

interface CreateUserDto {
  auth0Id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface UpdateGoogleTokensDto {
  refreshToken: string;
  calendarId: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(data: CreateUserDto): Promise<User> {
    if (!data.email) {
      throw new Error('Email is required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { auth0Id: data.auth0Id },
    });

    if (existingUser) {
      // Update user info if needed
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: data.name || existingUser.name,
          picture: data.picture || existingUser.picture,
          email: data.email || existingUser.email,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        auth0Id: data.auth0Id,
        email: data.email,
        name: data.name || 'User',
        picture: data.picture,
      },
    });
  }

  async findByAuth0Id(auth0Id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { auth0Id },
    });
  }

  async updateGoogleTokens(auth0Id: string, tokens: UpdateGoogleTokensDto) {
    return await this.prisma.user.update({
      where: { auth0Id },
      data: {
        googleRefreshToken: tokens.refreshToken,
        googleCalendarId: tokens.calendarId,
      },
    });
  }
}
