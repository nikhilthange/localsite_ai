const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

const app = require('./src/app');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);

const { startWeeklyReportCron, startDailyInsightCron } = require('./src/jobs/growthCron');

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    startWeeklyReportCron();
    startDailyInsightCron();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});
