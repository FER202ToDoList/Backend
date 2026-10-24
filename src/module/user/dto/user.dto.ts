import { Exclude } from 'class-transformer';

export class UserDto {
  id: string;
  email: string;
  fullName: string;
  role: string;

  @Exclude()
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUserDto {
  email: string;
  fullName: string;
  password: string;
}
