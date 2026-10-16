import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import type { EmailSender } from '../../application/ports/email.sender.js';

@Injectable()
export class NodemailerEmailSender implements EmailSender {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: this.configService.getOrThrow<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });

    this.from = this.configService.getOrThrow<string>('SMTP_FROM');
  }

  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Verify your Ridezo email address',
      text: `Your Ridezo verification code is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Verify your email address</h2>
          <p>Use the following code to verify your Ridezo account:</p>
          <h1 style="letter-spacing: 8px;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
          <p>If you didn't request this code, you can ignore this email.</p>
        </div>
      `,
    });
  }
}
