import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { RedisSocketAdapter } from './RedisSocketAdapter';
import { Logger } from '../logging/Logger';
import { UserRole } from '../../types/models';

let io: Server | null = null;

export function setupSocketIO(httpServer: HttpServer): Server {
  if (io) return io;

  const corsOrigin = config.isProduction
    ? [config.client.url, /\.localsiteai\.com$/]
    : ['http://localhost:3000', 'http://localhost:5173'];

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
    maxHttpBufferSize: 1e6,
    connectionStateRecovery: {
      maxDisconnectionDuration: 120000,
      skipMiddlewares: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token as string;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret, { algorithms: ['HS256'] }) as {
        userId: string;
        role: UserRole;
        email: string;
        sessionId: string;
      };
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      (socket as any).sessionId = decoded.sessionId;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.engine.on('connection_error', (err) => {
    Logger.debug('Socket.IO transport error', { error: err.message });
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userRole = (socket as any).userRole;

    socket.on('error', (err) => {
      Logger.debug('Socket error', { socketId: socket.id, error: err.message });
    });

    socket.join(`user:${userId}`);

    if (userRole === 'admin') {
      socket.join('admin:monitoring');
    }

    socket.on('join:website', (websiteId: string) => {
      if (typeof websiteId === 'string') {
        socket.join(`website:${websiteId}`);
        Logger.debug(`Socket ${socket.id} joined website:${websiteId}`);
      }
    });

    socket.on('leave:website', (websiteId: string) => {
      if (typeof websiteId === 'string') {
        socket.leave(`website:${websiteId}`);
      }
    });

    socket.on('disconnect', (reason: string) => {
      Logger.debug(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  setupRedisAdapter();

  Logger.info('Socket.IO initialized', { node: process.pid });
  return io;
}

async function setupRedisAdapter(): Promise<void> {
  try {
    await RedisSocketAdapter.initialize();
    const pubClient = RedisSocketAdapter.getPublisher();
    const subClient = RedisSocketAdapter.getSubscriber();
    io?.adapter(createAdapter(pubClient, subClient));
    Logger.info('Socket.IO Redis adapter configured');
  } catch (error) {
    Logger.warn('Socket.IO Redis adapter failed, using in-process only', {
      error: (error as Error).message,
    });
  }
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call setupSocketIO first.');
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: any): void {
  try {
    getIO().to(`user:${userId}`).emit(event, data);
  } catch (error) {
    Logger.error('Failed to emit to user', { userId, event, error: (error as Error).message });
  }
}

export function emitToWebsite(websiteId: string, event: string, data: any): void {
  try {
    getIO().to(`website:${websiteId}`).emit(event, data);
  } catch (error) {
    Logger.error('Failed to emit to website', { websiteId, event, error: (error as Error).message });
  }
}

export function emitToAdmin(event: string, data: any): void {
  try {
    getIO().to('admin:monitoring').emit(event, data);
  } catch (error) {
    Logger.error('Failed to emit to admin', { event, error: (error as Error).message });
  }
}
