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
    try {
      const request = context.switchToHttp().getRequest();
      const session = await this.authService.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      // Injecter la session et l'utilisateur dans la requête
      request.session = session;
      request.user = session?.user ?? null; // Utile pour les outils d'observabilité comme Sentry

      // Vérifier si la route est marquée comme publique
      const isPublic = this.reflector.get('PUBLIC', context.getHandler());
      if (isPublic) {
        return true;
      }

      // Vérifier si la route est marquée comme optionnelle
      const isOptional = this.reflector.get('OPTIONAL', context.getHandler());
      if (isOptional && !session) {
        return true;
      }

      // Si nous arrivons ici et qu'il n'y a pas de session, l'accès est refusé
      if (!session) {
        throw new UnauthorizedException(
          'Vous devez être connecté pour accéder à cette ressource'
        );
      }

      return true;
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      throw new UnauthorizedException('Authentification échouée');
    }
  }
}
