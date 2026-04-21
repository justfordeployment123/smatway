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

  async generatePresignedUrl(filePath: string): Promise<string> {
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
    });

    return getSignedUrl(this.s3Client, getCommand, {
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  }
}
