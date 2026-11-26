import { BadRequestException } from '@nestjs/common';

export class RegistrationNumber {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): RegistrationNumber {
    const normalized = raw.replace(/[\s-]+/g, '').toUpperCase();

    // Indian vehicle registration format (e.g., KL07AB1234 or 22BH1234AA)
    const indianPlateRegex =
      /^([A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}|\d{2}BH\d{4}[A-Z]{1,2})$/;

    if (!indianPlateRegex.test(normalized)) {
      throw new BadRequestException(
        'Invalid vehicle registration number format.',
      );
    }

    return new RegistrationNumber(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: RegistrationNumber): boolean {
    return this.value === other.value;
  }
}
