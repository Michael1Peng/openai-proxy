import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    const _this = this;
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      _this?.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent}`,
      );
    });

    next();
  }
}
