import { adminContract } from '@dropit/contract';
import { Controller, Inject } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { RequireSuperAdmin } from '../../../auth/infrastructure/decorators/super-admin.decorator';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../auth/infrastructure/decorators/auth.decorator';
import {
  ADMIN_USE_CASES,
  IAdminUseCases,
} from '../../application/ports/admin-use-cases.port';
import {
  INVITATION_USE_CASES,
  IInvitationUseCases,
} from '../../../invitations/application/ports/invitation-use-cases.port';

const c = adminContract;

@Controller()
@RequireSuperAdmin()
export class AdminController {
  constructor(
    @Inject(ADMIN_USE_CASES)
    private readonly adminUseCases: IAdminUseCases,
    @Inject(INVITATION_USE_CASES)
    private readonly invitationUseCases: IInvitationUseCases
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
  createInvitation(
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createInvitation>> {
    return tsRestHandler(c.createInvitation, async ({ body, headers }) => {
      await this.invitationUseCases.inviteUser(
        {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          organizationId: body.organizationId,
          organizationRole: body.organizationRole,
          headers,
        },
        {
          userId: user.id,
          isSuperAdmin: true,
        }
      );
      return { status: 201, body: { message: 'Invitation sent' } };
    });
  }
}
