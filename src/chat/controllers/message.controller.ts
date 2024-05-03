import { Controller, Get, Query } from "@nestjs/common";
import { MessageService } from "../services/message.service";

@Controller('api/messages')
export class MessagesController {
    constructor(
        private readonly messagService: MessageService
    ) { }

    @Get()
    find(@Query('where') where) {
        return this.messagService.find(where);
    }

}