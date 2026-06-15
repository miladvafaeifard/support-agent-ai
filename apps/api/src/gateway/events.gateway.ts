import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log('client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('client disconnected:', client.id);
  }

  ticketUpdated(ticketId: string, status: string) {
    this.server.emit('ticket:updated', { ticketId, status });
  }
}