import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'matches',
})
export class MatchesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client terhubung: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client terputus: ${client.id}`);
  }

  // Client bergabung ke room pertandingan tertentu
  @SubscribeMessage('joinMatch')
  handleJoinMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `match_${data.matchId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} bergabung ke room: ${roomName}`);
    return { event: 'joinedRoom', room: roomName };
  }

  // Client meninggalkan room pertandingan
  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `match_${data.matchId}`;
    client.leave(roomName);
    this.logger.log(`Client ${client.id} keluar dari room: ${roomName}`);
    return { event: 'leftRoom', room: roomName };
  }

  // Broadcast pembaruan skor ke semua penonton di room match tersebut
  broadcastScoreUpdate(matchId: string, payload: { homeScore: number; awayScore: number }) {
    this.server.to(`match_${matchId}`).emit('scoreUpdated', payload);
  }

  // Broadcast pembaruan status laga (LIVE, PAUSED, FINISHED)
  broadcastStatusChange(matchId: string, payload: { status: string }) {
    this.server.to(`match_${matchId}`).emit('statusChanged', payload);
  }

  // Broadcast log event baru (Gol / Kartu)
  broadcastEventLogged(matchId: string, eventData: any) {
    this.server.to(`match_${matchId}`).emit('eventLogged', eventData);
  }
}