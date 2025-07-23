// Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { decode } from 'jsonwebtoken';

@Injectable()
export class JwtClientIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const jwtHeader = req.headers['x-jwt-assertion'] || req.headers['X-JWT-Assertion'];
    if (!jwtHeader) {
      throw new UnauthorizedException('x-jwt-assertion header missing');
    }
    const token = jwtHeader as string;
    const payload = decode(token) as any;
    if (!payload || !payload.clientId) {
      throw new UnauthorizedException('clientId missing in JWT');
    }
    (req as any).clientId = payload.clientId;
    next();
  }
}
