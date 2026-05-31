import { adminContract } from '@dropit/contract';
import { Controller, Inject } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { RequireSuperAdmin } from '../../../auth/infrastructure/decorators/super-admin.decorator';
import {
  ADMIN_USE_CASES,
  IAdminUseCases,
} from '../../application/ports/admin-use-cases.port';

const c = adminContract;

@Controller()
@RequireSuperAdmin()
export class AdminController {
  constructor(
    @Inject(ADMIN_USE_CASES)
    private readonly adminUseCases: IAdminUseCases
  ) {}

  @TsRestHandler(c.getUsers)
  getUsers(): ReturnType<typeof tsRestHandler<typeof c.getUsers>> {
    return tsRestHandler(c.getUsers, async () => {
      const users = await this.adminUseCases.getUsers();
      return { status: 200, body: users };
    });
  }

  @TsRestHandler(c.getInvitations)
  getInvitations(): ReturnType<typeof tsRestHandler<typeof c.getInvitations>> {
    return tsRestHandler(c.getInvitations, async () => {
      const invitations = await this.adminUseCases.getInvitations();
      return { status: 200, body: invitations };
    });
  }

  @TsRestHandler(c.createInvitation)
  createInvitation(): ReturnType<
    typeof tsRestHandler<typeof c.createInvitation>
  > {
    return tsRestHandler(c.createInvitation, async ({ body }) => {
      await this.adminUseCases.inviteUser({
        email: body.email,
        organizationId: body.organizationId,
        organizationRole: body.organizationRole,
      });
      return { status: 201, body: { message: 'Invitation sent' } };
    });
  }
}
