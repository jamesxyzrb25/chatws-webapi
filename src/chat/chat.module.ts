import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthService } from 'src/auth/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './entities/room.entity';
import { Message, MessageSchema } from './entities/message.entity';
import { User, UserSchema } from './entities/user.entity';
import { MessagesController } from './controllers/message.controller';
import { RoomsController } from './controllers/room.controller';
import { MessageService } from './services/message.service';
import { RoomService } from './services/room.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Room.name,schema: RoomSchema},
      {name: Message.name, schema: MessageSchema},
      {name: User.name, schema: UserSchema}
    ]),
  ],
  providers: [ChatGateway, AuthService, MessageService, RoomService, UserService],
  controllers: [RoomsController,MessagesController],
})
export class ChatModule { }
