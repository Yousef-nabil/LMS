import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserInput } from './entities/user.entity';
@Injectable()
export class UsersRepo {
  constructor(private prisma: PrismaService) {}
  getUserById(id: number) {
    return this.prisma.users?.findUnique({
      where: {
        id,
      },
      select: {
        email: true,
        name: true,
        profile_picture_url: true,
        role: true,
      },
    });
  }
  getUserAuthById(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profile_picture_url: true,
        role: true,
        password_hash: true,
      },
    });
  }

  updateUser(payload: UpdateUserInput) {
    return this.prisma.users.update({
      where: {
        id: payload.id,
      },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.profilePictureUrl !== undefined
          ? { profile_picture_url: payload.profilePictureUrl }
          : {}),
        ...(payload.passwordHash !== undefined
          ? { password_hash: payload.passwordHash }
          : {}),
      },
      select: {
        name: true,
        email: true,
        profile_picture_url: true,
        role: true,
      },
    });
  }
}
