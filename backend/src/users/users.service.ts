import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepo } from './users.repo';
import { UpdateUserInput, User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
      private userRepo:UsersRepo
    ){}
  findOne(id: number) {
    return this.userRepo.getUserById(id);
  }
  updateUser(payload: UpdateUserInput) {
    return this.userRepo.updateUser(payload);
  }
}
