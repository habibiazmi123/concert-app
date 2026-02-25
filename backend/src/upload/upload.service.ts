import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly forcePathStyle: boolean;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('s3.endpoint')!;
    this.bucket = this.configService.get<string>('s3.bucket')!;
    this.forcePathStyle = this.configService.get<boolean>('s3.forcePathStyle') ?? true;

    this.s3 = new S3Client({
      endpoint: this.endpoint,
      region: this.configService.get<string>('s3.region')!,
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId')!,
        secretAccessKey: this.configService.get<string>('s3.secretAccessKey')!,
      },
      forcePathStyle: this.forcePathStyle, // Required for MinIO
    });
  }

  async onModuleInit() {
    // Auto-create bucket if it doesn't exist (dev convenience for MinIO)
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket "${this.bucket}" is accessible`);
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        this.logger.warn(
          `Bucket "${this.bucket}" not found, creating it...`,
        );
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket "${this.bucket}" created successfully`);
      } else {
        this.logger.warn(
          `Could not check S3 bucket: ${error.message}. Upload features may not work.`,
        );
      }
    }
  }

  /**
   * Generate a presigned URL for the client to upload directly to S3/MinIO.
   *
   * Flow:
   * 1. Frontend calls GET /concerts/:id/upload-url?fileType=image/jpeg
   * 2. Backend generates a presigned PUT URL (valid for 5 minutes)
   * 3. Frontend PUTs the file directly to the presigned URL
   * 4. Frontend calls PATCH /concerts/:id with { imageUrl: publicUrl }
   */
  async generatePresignedUploadUrl(
    folder: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const ext = this.getExtensionFromMime(fileType);
    const key = `${folder}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300, // 5 minutes
    });

    // Public URL for accessing the uploaded file
    const publicUrl = this.forcePathStyle
      ? `${this.endpoint}/${this.bucket}/${key}` // MinIO path-style
      : `https://${this.bucket}.s3.${this.configService.get('s3.region')}.amazonaws.com/${key}`; // AWS virtual-hosted

    return { uploadUrl, publicUrl, key };
  }

  /**
   * Delete a file from S3 by its key.
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted S3 object: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete S3 object ${key}: ${error.message}`);
    }
  }

  /**
   * Extract the S3 key from a public URL.
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      if (this.forcePathStyle) {
        // MinIO path-style: http://localhost:9000/bucket/concerts/uuid.jpg
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts[0] === this.bucket) {
          return parts.slice(1).join('/');
        }
      }
      // AWS virtual-hosted: https://bucket.s3.region.amazonaws.com/concerts/uuid.jpg
      return urlObj.pathname.replace(/^\//, '');
    } catch {
      return null;
    }
  }

  private getExtensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    };
    return map[mimeType] || 'jpg';
  }
}
