import { Body, Controller, Post } from "@nestjs/common";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
export class TicketsController {
  constructor(private tickets: TicketsService) {}

  @Post()
  create(@Body() body: { customerEmail: string; subject: string; body: string }) {
    return this.tickets.create(body);
  }
}
