import type { UserEntity } from '../../../users/domain/entities/user.entity.js';
import type {
  CreateUserData,
  UserRepository,
} from '../../../users/domain/repositories/user.repository.js';

import type { RegisterUserDto } from '../dto/register-user.dto.js';
import type { PasswordHasher } from '../ports/passwordhasher.js';

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export class RegisteredUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserDto): Promise<UserEntity> {
    const email = input.email.trim().toLowerCase();
    const emailExists = await this.userRepository.existsByEmail(email);

    if (emailExists) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const userData: CreateUserData = {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      passwordHash,
    };

    return this.userRepository.create(userData);
  }
}
