import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import type Multer from 'multer';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName = process.env.GARAGE_BUCKET || 'smatway';

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.GARAGE_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.GARAGE_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.GARAGE_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(
    file: any,
    folder: string,
  ): Promise<{ filePath: string; presignedUrl: string }> {
    const filename = `${folder}/${uuidv4()}-${file.originalname}`;
    const putCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(putCommand);

    const presignedUrl = await this.generatePresignedUrl(filename);

    return { filePath: filename, presignedUrl };
  }

  async generatePresignedUrl(filePathOrUrl: string): Promise<string> {
    // Old records stored the full presigned URL — extract just the S3 key from it
    let key = filePathOrUrl;
    if (filePathOrUrl.startsWith('http')) {
      const url = new URL(filePathOrUrl);
      // forcePathStyle URL format: /{bucket}/{key}
      key = url.pathname.replace(`/${this.bucketName}/`, '');
    }

    // Use a separate public-facing client if GARAGE_PUBLIC_URL is set,
    // so presigned URLs are reachable from browsers in production.
    const publicEndpoint = process.env.GARAGE_PUBLIC_URL;
    const client = publicEndpoint
      ? new S3Client({
          region: 'us-east-1',
          endpoint: publicEndpoint,
          credentials: {
            accessKeyId: process.env.GARAGE_ACCESS_KEY || 'minioadmin',
            secretAccessKey: process.env.GARAGE_SECRET_KEY || 'minioadmin',
          },
          forcePathStyle: true,
        })
      : this.s3Client;

    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(client, getCommand, {
      expiresIn: 7 * 24 * 60 * 60,
    });
  }
}
