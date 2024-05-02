import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Room } from "../entities/room.entity";
import { RoomService } from "../services/room.service";

@Controller('api/rooms')
export class RoomsController {
  constructor(
    private readonly roomService: RoomService
  ) {} 

  @Get()
  find(@Query('q') q) { 
    return this.roomService.findQ(q);
  }

  @Get('/user/:uid')
  getRoomsByUser(@Param('uid') uid:string){
    return this.roomService.getRoomsByUser(uid);
  }

  @Get('/:id')
  findById(@Param('id') id: string) { 
    return this.roomService.findRoomById(id);
  }

  @Post()
  save(@Body() item: Room) { 
    /* console.log("Entra a a post de room");
    console.log("Item es: ",item);
    return item._id
      ? this.model.findByIdAndUpdate(item._id, item, {new: true})
      : this.model.create(item); */
      return this.roomService.saveRoom(item);
  }
}