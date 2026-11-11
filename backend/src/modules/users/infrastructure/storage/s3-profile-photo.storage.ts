import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

import { configureS3 } from '../../../../infrastructure/config/s3.config.js';
import type { IProfilePhotoStorage } from '../../application/ports/profile-photo-storage.js';

@Injectable()
export class S3ProfilePhotoStorage implements IProfilePhotoStorage {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = configureS3(configService);
    this.bucketName = configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
  }

  async upload(
    file: Buffer,
    contentType: string,
  ): Promise<{ objectKey: string }> {
    const objectKey = `users/profile-photos/${randomUUID()}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: file,
        ContentType: contentType,
      }),
    );

    return { objectKey };
  }

  async getUrl(objectKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });
  }

  async delete(objectKey: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      }),
    );
  }
}
