import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized!');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * ক্লায়েন্ট একটি নির্দিষ্ট প্রজেক্টের রুমে যোগ দেওয়ার জন্য এই ইভেন্টটি পাঠাবে।
   * @param client - The connected client socket.
   * @param projectId - The ID of the project room to join.
   */
  @SubscribeMessage('joinProjectRoom')
  handleJoinRoom(client: Socket, projectId: string) {
    client.join(projectId);
    this.logger.log(`Client ${client.id} joined room: ${projectId}`);
  }

  /**
   * ক্লায়েন্ট একটি প্রজেক্টের রুম থেকে বেরিয়ে যাওয়ার জন্য এই ইভেন্টটি পাঠাবে।
   * @param client - The connected client socket.
   * @param projectId - The ID of the project room to leave.
   */
  @SubscribeMessage('leaveProjectRoom')
  handleLeaveRoom(client: Socket, projectId: string) {
    client.leave(projectId);
    this.logger.log(`Client ${client.id} left room: ${projectId}`);
  }

  /**
   * @param projectId - The ID of the project room to emit the event to.
   * @param updatedTask - The updated task data to send.
   */
  sendTaskUpdate(projectId: string, updatedTask: any) {
    this.server.to(projectId).emit('taskUpdated', updatedTask);
    this.logger.log(`Sent task update to room ${projectId}`);
  }
}
