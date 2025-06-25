import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip authentication in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('🧪 [AuthGuard] Test environment detected, skipping authentication');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const endpoint = `${request.method} ${request.url}`;
    
    try {
      console.log('🔑 [AuthGuard] Checking authentication for:', endpoint);

      const session = await this.authService.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      // Injecter la session et l'utilisateur dans la requête
      request.session = session;
      request.user = session?.user ?? null; // Utile pour les outils d'observabilité comme Sentry

      // Vérifier si la route est marquée comme publique
      const isPublic = this.reflector.get('PUBLIC', context.getHandler());
      if (isPublic) {
        console.log('✅ [AuthGuard] Public route, no authentication required');
        return true;
      }

      // Vérifier si la route est marquée comme optionnelle
      const isOptional = this.reflector.get('OPTIONAL', context.getHandler());
      if (isOptional && !session) {
        console.log('⚠️ [AuthGuard] Optional route, no session found but access granted');
        return true;
      }

      // Si nous arrivons ici et qu'il n'y a pas de session, l'accès est refusé
      if (!session) {
        console.log('❌ [AuthGuard] No session found, access denied');
        throw new UnauthorizedException(
          'You must be logged in to access this resource'
        );
      }

      return true;
    } catch (error) {
      console.error('❌ [AuthGuard] Authentication error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        endpoint,
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
