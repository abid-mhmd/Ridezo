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

import { configureS3 } from '../../../../../../infrastructure/config/s3.config';
import type { IVehicleDocumentStorage } from '../../../../application/ports/vehicle-document-storage';

@Injectable()
export class S3VehicleDocumentStorage implements IVehicleDocumentStorage {
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
    const objectKey = `vehicles/vehicle-documents/${randomUUID()}`;

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

  async download(
    objectKey: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const response = await this.s3Client.send(
      new GetObjectCommand({ Bucket: this.bucketName, Key: objectKey }),
    );

    if (!response.Body) {
      throw new Error('Vehicle document counld not be downloaded');
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray());

    return {
      buffer,
      contentType: response.ContentType ?? 'application/octet-stream',
    };
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
