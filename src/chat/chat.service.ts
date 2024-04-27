import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface Client {
    id: string;
    name: string;
}

interface Room {
    messages: any;
    id: string;
    users: string[];
}

@Injectable()
export class ChatService {
    constructor(
        @InjectModel('Room')
        private readonly roomModel: Model<Room>
    ){}

    private clients: Record<string, Client> = {};
    private rooms: Record<string, Room> = {};

    createRoom(id: string) {
        this.rooms[id] = { id, users: [], messages: [] };
    }

    addMessageToRoom(roomId: string, userId: string, name: string, message: string) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].messages.push({ userId, name, message });
        }
    }

    getMessagesInRoom(roomId: string) {
        return this.rooms[roomId]?.messages || [];
    }

    addUserToRoom(roomId: string, userId: string) {
        if (!this.rooms[roomId]) {
            this.createRoom(roomId);
        }
        this.rooms[roomId].users.push(userId);
    }

    getUsersInRoom(roomId: string) {
        return this.rooms[roomId]?.users || [];
    }

    onClientConnected(client: Client) {
        this.clients[client.id] = client;
    }

    onClientDisconected(id: string) {
        delete this.clients[id];
    }

    getClients() {
        return Object.values(this.clients);
    }

}
