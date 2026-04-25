import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminPrincipal } from './admin.types';

/** Pulls the verified AdminPrincipal off the request, populated by JwtAdminAuthGuard. */
export const CurrentAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AdminPrincipal => {
    const req = ctx
      .switchToHttp()
      .getRequest<{ admin?: AdminPrincipal }>();
    if (!req.admin) {
      throw new Error('CurrentAdmin used on an unguarded route');
    }
    return req.admin;
  },
);
