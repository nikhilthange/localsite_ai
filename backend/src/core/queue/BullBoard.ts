import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { QueueService } from './QueueService';
import { QueueNames } from './QueueService';

export function setupBullBoard(): ExpressAdapter {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const queues = Object.values(QueueNames).map((name) => {
    const queue = QueueService.getQueue(name);
    return new BullMQAdapter(queue);
  });

  createBullBoard({
    queues: queues as any,
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: 'LocalSite AI - Job Queues',
      },
    },
  });

  return serverAdapter;
}

export function mountBullBoard(app: express.Application): void {
  const serverAdapter = setupBullBoard();
  app.use('/admin/queues', serverAdapter.getRouter());
}
