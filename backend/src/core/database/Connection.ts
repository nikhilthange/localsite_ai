import mongoose from 'mongoose';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 3000;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!this.instance) {
      this.instance = new DatabaseConnection();
    }
    return this.instance;
  }

  async connect(uri: string): Promise<void> {
    if (this.isConnected) return;

    try {
      mongoose.set('strictQuery', true);
      mongoose.set('toJSON', {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
          ret.id = ret._id.toString();
          delete ret.__v;
          return ret;
        },
      });

      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true,
      });

      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log('✓ MongoDB Connected');

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✓ MongoDB reconnected');
        this.isConnected = true;
      });
    } catch (error: any) {
      this.isConnected = false;
      this.connectionAttempts++;

      if (error.name === 'MongooseServerSelectionError' || error.message?.includes('Could not connect')) {
        console.error('✗ MongoDB connection failed.');
        console.error('  → Check that MONGODB_URI in .env is correct.');
        console.error('  → For local dev, ensure Docker is running: docker compose up -d mongodb');
        console.error('  → For Atlas, verify the connection string, IP whitelist, and credentials.');
        console.error('  → Current URI: ' + uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      }

      if (this.connectionAttempts < this.MAX_RETRIES) {
        console.warn(`  → Retrying in ${this.RETRY_DELAY / 1000}s... (attempt ${this.connectionAttempts}/${this.MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.connect(uri);
      }

      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await mongoose.disconnect();
    this.isConnected = false;
  }

  getConnection(): typeof mongoose {
    return mongoose;
  }

  get isConnectedStatus(): boolean {
    return this.isConnected;
  }
}
