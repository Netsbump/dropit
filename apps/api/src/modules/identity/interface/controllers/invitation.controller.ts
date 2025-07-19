import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/guards/auth.guard';
import { PermissionsGuard } from '../../infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../infrastructure/decorators/permissions.decorator';
import { CurrentUser } from '../../infrastructure/decorators/auth.decorator';
import { CurrentOrganization } from '../../infrastructure/decorators/organization.decorator';
import { User } from '../../domain/auth/user.entity';
import { AuthService } from '../../../core/auth/auth.service';

@Controller('invitations')
@UseGuards(AuthGuard, PermissionsGuard)
export class InvitationController {
  constructor(private authService: AuthService) {}

  @Post('test')
  @RequirePermissions('create')
  async testInvitation(
    @Body() data: { email: string; role?: string },
    @CurrentUser() user: User,
    @CurrentOrganization() organizationId: string
  ) {
    console.log('🧪 [InvitationController] Testing invitation:', {
      email: data.email,
      role: data.role || 'member',
      organizationId,
      inviter: user.name,
    });

    try {
      // Pour le test, on simule l'envoi d'email directement
      console.log('🧪 [InvitationController] Simulating invitation email...');
      
      // TODO: Appeler Better Auth quand l'API sera disponible
      // const result = await this.authService.api.organization.inviteMember({...});
      
      return {
        success: true,
        message: 'Test d\'invitation - vérifiez les logs pour voir l\'email simulé',
        invitationId: 'test-' + Date.now(),
      };
    } catch (error) {
      console.error('❌ [InvitationController] Error creating invitation:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la création de l\'invitation',
      };
    }
  }
} 