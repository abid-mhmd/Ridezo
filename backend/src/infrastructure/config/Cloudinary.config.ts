import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export function configureCloudinary(
  configService: ConfigService,
): typeof cloudinary {
  cloudinary.config({
    cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
    api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
    api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    secure: true,
  });

  return cloudinary;
}
