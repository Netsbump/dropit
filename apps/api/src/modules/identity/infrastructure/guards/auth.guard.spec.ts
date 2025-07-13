import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../../../core/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let authService: AuthService;

  // Mock data pour l'authentification uniquement
  const mockAdminUser = {
    id: 'admin-user-id',
    email: 'admin@test.com',
    name: 'Admin User',
    isSuperAdmin: false,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSuperAdminUser = {
    id: 'super-admin-user-id',
    email: 'superadmin@test.com',
    name: 'Super Admin User',
    isSuperAdmin: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminSession = {
    user: mockAdminUser,
    session: {
      id: 'admin-session-id',
      userId: mockAdminUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      token: 'test-token',
    }
  };

  const mockSuperAdminSession = {
    user: mockSuperAdminUser,
    session: {
      id: 'super-admin-session-id',
      userId: mockSuperAdminUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      token: 'test-token',
    }
  };

  const mockRequest = {
    session: mockAdminSession,
    user: mockAdminUser,
    method: 'GET',
    url: '/workouts',
    headers: {},
  };

  const mockContext = {
    switchToHttp: () => ({ getRequest: () => mockRequest }),
    getClass: () => ({ name: 'WorkoutController' }),
    getHandler: () => ({}),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            api: {
              getSession: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('Authentication Logic', () => {
    it('should use Better Auth API in production environment', async () => {
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(mockAdminSession);
      
      const result = await guard.canActivate(mockContext);
      
      expect(result).toBe(true);
      expect(authService.api.getSession).toHaveBeenCalled();
    });

    it('should deny access when no session is found', async () => {
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(null);
      
      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should allow access to public routes', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('PUBLIC');
      
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access to optional routes without session', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue('OPTIONAL');
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(null);
      
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });

  describe('Session Injection Tests', () => {
    it('should inject session and user into request', async () => {
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(mockAdminSession);
      
      await guard.canActivate(mockContext);
      
      expect(mockRequest.session).toBe(mockAdminSession);
      expect(mockRequest.user).toBe(mockAdminSession.user);
    });
  });

  describe('Error Handling', () => {
    it('should handle Better Auth API errors gracefully', async () => {
      jest.spyOn(authService.api, 'getSession').mockRejectedValue(new Error('API Error'));
      
      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('User Authentication Tests', () => {
    it('should handle regular admin user correctly', async () => {
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(mockAdminSession);
      
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user.isSuperAdmin).toBe(false);
    });

    it('should handle super admin user correctly', async () => {
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(mockSuperAdminSession);
      
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user.isSuperAdmin).toBe(true);
    });

    it('should handle unverified email user', async () => {
      const unverifiedUser = { ...mockAdminUser, emailVerified: false };
      const unverifiedSession = { ...mockAdminSession, user: unverifiedUser };
      
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(unverifiedSession);
      
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user.emailVerified).toBe(false);
    });
  });

  describe('Session Validation Tests', () => {
    it('should handle expired session', async () => {
      const expiredSession = {
        ...mockAdminSession,
        session: { ...mockAdminSession.session, expiresAt: new Date(Date.now() - 1000) }
      };
      
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(expiredSession);
      
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true); // Better Auth gère l'expiration automatiquement
    });

    it('should handle valid session', async () => {
      const validSession = {
        ...mockAdminSession,
        session: { ...mockAdminSession.session, expiresAt: new Date(Date.now() + 1000) }
      };
      
      jest.spyOn(authService.api, 'getSession').mockResolvedValue(validSession);
      
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});