import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/admin',
})
export class AdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AdminGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Admin client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Admin client disconnected: ${client.id}`);
  }

  /**
   * Emit a queue job status update to all connected admin clients.
   */
  emitQueueUpdate(data: {
    jobId: string;
    status: string;
    position?: number | null;
    userId?: string;
    concertId?: string;
    bookingId?: string;
    error?: string;
  }) {
    this.server.emit('queue:update', data);
  }

  /**
   * Emit queue summary counts.
   */
  emitQueueCounts(counts: {
    waiting: number;
    processing: number;
    completed: number;
    failed: number;
  }) {
    this.server.emit('queue:counts', counts);
  }
}
