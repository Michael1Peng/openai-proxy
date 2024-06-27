import { Injectable, Logger } from '@nestjs/common';
import { HttpService, AxiosResponse } from '@nestjs/axios';
import { Request, Response } from 'express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly httpService: HttpService) {}

  async forwardRequest(req: Request, res: Response) {
    const url = `https://api.openai.com${req.url}`;
    const method = req.method;
    const headers = req.headers;
    const data = req.body;

    this.logger.log(`Request: ${method} ${url}`);
    this.logger.log(`Headers: ${JSON.stringify(headers)}`);
    this.logger.log(`Body: ${JSON.stringify(data)}`);

    const logFilePath = join(__dirname, '..', 'logs', `${format(new Date(), 'yyyy-MM-dd')}.log`);
    const logStream = createWriteStream(logFilePath, { flags: 'a' });

    logStream.write(`Request: ${method} ${url}\n`);
    logStream.write(`Headers: ${JSON.stringify(headers)}\n`);
    logStream.write(`Body: ${JSON.stringify(data)}\n`);

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          headers,
          data,
        }),
      );

      this.logger.log(`Response: ${response.status} ${JSON.stringify(response.data)}`);
      logStream.write(`Response: ${response.status} ${JSON.stringify(response.data)}\n`);

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      logStream.write(`Error: ${error.message}\n`);
      res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
    } finally {
      logStream.end();
    }
  }
}
