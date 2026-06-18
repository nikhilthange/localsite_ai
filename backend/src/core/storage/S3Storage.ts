import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Storage {
  private static client: S3Client;
  private static bucket: string;
  private static cloudfrontDomain: string;
  private static initialized = false;

  static initialize(): void {
    this.bucket = process.env.AWS_S3_BUCKET || 'localsite-ai-assets';
    this.cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || '';

    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      maxAttempts: 3,
    });

    this.initialized = true;
  }

  static async upload(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string,
    acl: 'public-read' | 'private' = 'public-read'
  ): Promise<{ url: string; key: string }> {
    if (!this.initialized) this.initialize();

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: acl,
    });

    await (this.client as any).send(command);

    const url = this.cloudfrontDomain
      ? 'https://' + this.cloudfrontDomain + '/' + key
      : 'https://' + this.bucket + '.s3.amazonaws.com/' + key;

    return { url, key };
  }

  static async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    return this.upload(key, buffer, contentType);
  }

  static async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.initialized) this.initialize();

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  static async delete(key: string): Promise<void> {
    if (!this.initialized) this.initialize();

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await (this.client as any).send(command);
  }

  static async listFiles(prefix: string): Promise<Array<{ key: string; size: number; lastModified?: Date }>> {
    if (!this.initialized) this.initialize();

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const response = await (this.client as any).send(command);
    return (
      response.Contents?.map((obj: any) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified,
      })) || []
    );
  }

  static getPublicUrl(key: string): string {
    if (this.cloudfrontDomain) {
      return 'https://' + this.cloudfrontDomain + '/' + key;
    }
    return 'https://' + this.bucket + '.s3.amazonaws.com/' + key;
  }

  static generateKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = filename.split('.').pop();
    return prefix + '/' + timestamp + '-' + random + '.' + ext;
  }

  static get cloudfrontUrl(): string {
    return this.cloudfrontDomain ? 'https://' + this.cloudfrontDomain : '';
  }
}
