import { accessContract } from '@dropit/contract';
import { Controller, Inject } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { ACCESS_USE_CASES, IAccessUseCases } from '../../application/ports/access-use-cases.port';
import { Public } from '../../infrastructure/decorators/auth.decorator';

const c = accessContract;

@Controller()
export class AccessController {
  constructor(
    @Inject(ACCESS_USE_CASES)
    private readonly accessUseCases: IAccessUseCases
  ) { }

  @TsRestHandler(c.requestAccess)
  @Public()
  requestAccess(): ReturnType<typeof tsRestHandler<typeof c.requestAccess>> {
    return tsRestHandler(c.requestAccess, async ({ body }) => {
      await this.accessUseCases.createAccess(body);
      return { status: 202 as const, body: { accepted: true } };
    });
  }

}
