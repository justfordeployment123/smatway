import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AnnouncementAudience } from '@prisma/client';

/**
 * Real-time push for platform announcements. Lives on the same Socket.io
 * server the chat gateway uses (one HTTP upgrade per client). Clients join an
 * audience room when they call `subscribe-announcements` with their account
 * type; admins broadcast `announcement.created` / `.updated` / `.deleted`
 * events to the matching rooms.
 *
 * Important: this is a "go refetch" hint, not the source of truth. The user
 * dashboard should still GET /announcements on mount + visibilitychange so a
 * disconnected client never misses an announcement permanently.
 */
@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class AnnouncementGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  // Same lifecycle as the chat gateway — connection arrives, client opts-in
  // to a room via subscribe-announcements with their accountType.
  handleConnection(_client: Socket) {
    // No-op. Rooms are joined explicitly via subscribe-announcements.
  }

  @SubscribeMessage('subscribe-announcements')
  handleSubscribe(
    client: Socket,
    payload: { accountType?: 'TRAVELER' | 'TRANSPORTER' },
  ) {
    // Everyone joins the "ALL" room.
    client.join('announcements:all');
    if (payload?.accountType === 'TRAVELER') {
      client.join('announcements:travelers');
    } else if (payload?.accountType === 'TRANSPORTER') {
      client.join('announcements:transporters');
    }
  }

  @SubscribeMessage('unsubscribe-announcements')
  handleUnsubscribe(client: Socket) {
    client.leave('announcements:all');
    client.leave('announcements:travelers');
    client.leave('announcements:transporters');
  }

  /** Returns the room names a given audience should be broadcast to. */
  private roomsFor(audience: AnnouncementAudience): string[] {
    switch (audience) {
      case AnnouncementAudience.TRAVELERS_ONLY:
        return ['announcements:travelers'];
      case AnnouncementAudience.TRANSPORTERS_ONLY:
        return ['announcements:transporters'];
      case AnnouncementAudience.ALL:
      default:
        return ['announcements:all'];
    }
  }

  emitCreated(announcement: { id: string; audience: AnnouncementAudience; isPublished: boolean }) {
    if (!announcement.isPublished) return; // hidden ones don't notify
    for (const room of this.roomsFor(announcement.audience)) {
      this.server.to(room).emit('announcement.created', { id: announcement.id });
    }
  }

  emitUpdated(announcement: { id: string; audience: AnnouncementAudience }) {
    for (const room of this.roomsFor(announcement.audience)) {
      this.server.to(room).emit('announcement.updated', { id: announcement.id });
    }
  }

  emitDeleted(announcement: { id: string; audience: AnnouncementAudience }) {
    for (const room of this.roomsFor(announcement.audience)) {
      this.server.to(room).emit('announcement.deleted', { id: announcement.id });
    }
  }
}
