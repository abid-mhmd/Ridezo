import { BadRequestException } from '@nestjs/common';

export class Money {
  private readonly amount: number;
  private readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  static create(amount: number, currency = 'INR'): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException('Amount must be a valid non-negative number.');
    }

    return new Money(Math.round(amount * 100) / 100, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new BadRequestException('Multiplier cannot be negative.');
    }
    return Money.create(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}