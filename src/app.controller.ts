import { Controller, All, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    await this.appService.forwardRequest(req, res);
  }
}