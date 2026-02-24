import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FieldAliasMiddleware implements NestMiddleware {
  private readonly logger = new Logger(FieldAliasMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      this.logger.log(`[FieldAlias] Before: ${JSON.stringify(req.body)}`);

      // Map 'frequency' to 'couponFrequency' if 'frequency' is present and 'couponFrequency' is not
      if ('frequency' in req.body && !('couponFrequency' in req.body)) {
        this.logger.log(`[FieldAlias] Mapping frequency (${req.body.frequency}) to couponFrequency`);
        req.body.couponFrequency = req.body.frequency;
      }

      this.logger.log(`[FieldAlias] After: ${JSON.stringify(req.body)}`);
    }

    next();
  }
}
