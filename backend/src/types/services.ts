export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface QueueJobData {
  type: string;
  payload: Record<string, any>;
  userId?: string;
  priority?: number;
}

export interface StorageOptions {
  bucket: string;
  key: string;
  contentType: string;
  body: Buffer | Uint8Array | string;
  acl?: 'public-read' | 'private';
}

export interface CacheOptions {
  ttl?: number;
  key: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
