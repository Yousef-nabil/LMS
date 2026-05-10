import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepo } from './users.repo';
import { UpdateUserInput } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private userRepo: UsersRepo) {}
  async findOne(id: number) {
    const user = await this.userRepo.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUser(user);
  }
  async updateUser(payload: UpdateUserDto & { id: number }) {
    const currentUser = await this.userRepo.getUserAuthById(payload.id);

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const updates: UpdateUserInput = { id: payload.id };

    if (payload.name !== undefined) {
      updates.name = payload.name;
    }

    if (payload.profilePictureUrl !== undefined) {
      updates.profilePictureUrl = payload.profilePictureUrl;
    }

    const wantsPasswordChange =
      Boolean(payload.oldPassword) ||
      Boolean(payload.newPassword) ||
      Boolean(payload.confirmNewPassword);

    if (wantsPasswordChange) {
      if (
        !payload.oldPassword ||
        !payload.newPassword ||
        !payload.confirmNewPassword
      ) {
        throw new BadRequestException(
          'Old password, new password, and confirmation are required to change your password',
        );
      }

      const isOldPasswordValid = await bcrypt.compare(
        payload.oldPassword,
        currentUser.password_hash,
      );

      if (!isOldPasswordValid) {
        throw new ForbiddenException('Old password is incorrect');
      }

      const passwordErrors = this.validatePassword(
        payload.newPassword,
        payload.confirmNewPassword,
      );
      if (passwordErrors) {
        throw new BadRequestException(passwordErrors);
      }

      updates.passwordHash = await bcrypt.hash(payload.newPassword, 10);
    }

    if (
      updates.name === undefined &&
      updates.profilePictureUrl === undefined &&
      updates.passwordHash === undefined
    ) {
      throw new BadRequestException('No changes provided');
    }

    const updatedUser = await this.userRepo.updateUser(updates);
    return this.mapUser(updatedUser);
  }

  private mapUser(user: {
    name: string;
    email: string;
    role: string;
    profile_picture_url?: string | null;
  }) {
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      profilePictureUrl: user.profile_picture_url ?? null,
    };
  }

  private validatePassword(newPassword: string, confirmNewPassword: string) {
    if (newPassword.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(newPassword)) {
      return 'Password must contain at least 1 lowercase letter';
    }
    if (!/[A-Z]/.test(newPassword)) {
      return 'Password must contain at least 1 uppercase letter';
    }
    if (!/[0-9]/.test(newPassword)) {
      return 'Password must contain at least 1 number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return 'Password must contain at least 1 symbol';
    }
    if (confirmNewPassword !== newPassword) {
      return 'Passwords do not match';
    }

    return null;
  }
}
