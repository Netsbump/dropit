import { EntityManager } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { Invitation } from '../../domain/organization/invitation.entity';
import { Member } from '../../domain/organization/member.entity';
import { Organization } from '../../domain/organization/organization.entity';
import { hasPermission } from '../../permissions.config';
import { PermissionsGuard } from '../guards/permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let entityManager: EntityManager;

  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: false,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockOrganization = {
    id: 'org-456',
    name: 'Test Org',
    createdAt: new Date(),
    members: {
      add: vi.fn(),
      getItems: vi.fn(),
      count: vi.fn(),
      isInitialized: true,
    } as unknown as Collection<Member>,
    invitations: {
      add: vi.fn(),
      getItems: vi.fn(),
      count: vi.fn(),
      isInitialized: true,
    } as unknown as Collection<Invitation>,
  } as Organization;

  const mockMember: Member = {
    id: 'member-789',
    user: mockUser,
    organization: mockOrganization,
    role: 'member',
    createdAt: new Date(),
  };

  const mockRequest = {
    session: {
      user: mockUser,
      session: {
        activeOrganizationId: 'org-456',
      },
    },
    method: 'GET',
    url: '/workouts',
  };

  const mockContext = {
    switchToHttp: () => ({ getRequest: () => mockRequest }),
    getClass: () => ({ name: 'WorkoutController' }),
    getHandler: () => ({}),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            get: vi.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('No Organization Actions Tests', () => {
    it('should allow access for actions without organization', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(true) // NO_ORGANIZATION
        .mockReturnValueOnce(['create']); // REQUIRED_PERMISSIONS

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access for athlete creation without organization', async () => {
      const athleteContext = {
        ...mockContext,
        getClass: () => ({ name: 'AthleteController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(true) // NO_ORGANIZATION
        .mockReturnValueOnce(['create']); // REQUIRED_PERMISSIONS

      const result = await guard.canActivate(athleteContext);
      expect(result).toBe(true);
    });
  });

  describe('Permission Mapping Tests', () => {
    it('should correctly map member permissions for athlete resource', async () => {
      const athleteContext = {
        ...mockContext,
        getClass: () => ({ name: 'AthleteController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS (checked first)
        .mockReturnValueOnce(false); // NO_ORGANIZATION (checked second)
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(athleteContext);

      expect(result).toBe(true);
      expect(entityManager.findOne).toHaveBeenCalledWith(Member, {
        user: { id: mockUser.id },
        organization: { id: 'org-456' },
      });
    });

    it('should correctly map admin permissions for workout resource', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['create']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      const adminMember = { ...mockMember, role: 'admin' };
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should correctly map coach (admin) permissions for workout resource', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['delete']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      const adminMember = { ...mockMember, role: 'admin' };
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should handle unknown organization role', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      const unknownRoleMember = { ...mockMember, role: 'unknown' };
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(unknownRoleMember);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('Different Routes Tests', () => {
    it('should handle WorkoutController correctly', async () => {
      const workoutContext = {
        ...mockContext,
        getClass: () => ({ name: 'WorkoutController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(false) // NO_ORGANIZATION
        .mockReturnValueOnce(['read']); // REQUIRED_PERMISSIONS
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(workoutContext);
      expect(result).toBe(true);
    });

    it('should handle ExerciseController correctly', async () => {
      const exerciseContext = {
        ...mockContext,
        getClass: () => ({ name: 'ExerciseController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(false) // NO_ORGANIZATION
        .mockReturnValueOnce(['read']); // REQUIRED_PERMISSIONS
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(exerciseContext);
      expect(result).toBe(true);
    });

    it('should handle ComplexController correctly', async () => {
      const complexContext = {
        ...mockContext,
        getClass: () => ({ name: 'ComplexController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(false) // NO_ORGANIZATION
        .mockReturnValueOnce(['read']); // REQUIRED_PERMISSIONS
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(complexContext);
      expect(result).toBe(true);
    });

    it('should handle AthleteController correctly', async () => {
      const athleteContext = {
        ...mockContext,
        getClass: () => ({ name: 'AthleteController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(false) // NO_ORGANIZATION
        .mockReturnValueOnce(['read']); // REQUIRED_PERMISSIONS
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(athleteContext);
      expect(result).toBe(true);
    });

    it('should handle SessionController correctly', async () => {
      const sessionContext = {
        ...mockContext,
        getClass: () => ({ name: 'SessionController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(false) // NO_ORGANIZATION
        .mockReturnValueOnce(['read']); // REQUIRED_PERMISSIONS
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(sessionContext);
      expect(result).toBe(true);
    });
  });

  describe('Role-based Access Tests', () => {
    describe('Member Role Tests', () => {
      it('should allow member to read athletes', async () => {
        const athleteContext = {
          ...mockContext,
          getClass: () => ({ name: 'AthleteController' }),
        } as unknown as ExecutionContext;

        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(false) // NO_ORGANIZATION
          .mockReturnValueOnce(['read']); // REQUIRED_PERMISSIONS
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        const result = await guard.canActivate(athleteContext);
        expect(result).toBe(true);
      });

      it('should deny member from reading workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(
          ForbiddenException
        );
      });

      it('should deny member from creating workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['create']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(
          ForbiddenException
        );
      });

      it('should deny member from updating workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['update']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(
          ForbiddenException
        );
      });

      it('should deny member from deleting workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['delete']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(
          ForbiddenException
        );
      });

      it('should allow member to create personal records', async () => {
        const personalRecordContext = {
          ...mockContext,
          getClass: () => ({ name: 'PersonalRecordController' }),
        } as unknown as ExecutionContext;

        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(false) // NO_ORGANIZATION
          .mockReturnValueOnce(['create']); // REQUIRED_PERMISSIONS
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        const result = await guard.canActivate(personalRecordContext);
        expect(result).toBe(true);
      });
    });

    describe('Admin Role Tests', () => {
      const adminMember = { ...mockMember, role: 'admin' };

      it('should allow admin to read workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(false) // NO_ORGANIZATION
          .mockReturnValueOnce(['read']); // REQUIRED_PERMISSIONS
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow admin to create workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(false) // NO_ORGANIZATION
          .mockReturnValueOnce(['create']); // REQUIRED_PERMISSIONS
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow admin to update workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['update']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow admin to delete workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['delete']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });
    });

    describe('Coach (admin) role tests', () => {
      const adminMember = { ...mockMember, role: 'admin' };

      it('should allow coach to read workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow coach to create workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['create']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow coach to update workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['update']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow coach to delete workouts', async () => {
        vi.spyOn(reflector, 'get')
          .mockReturnValueOnce(['delete']) // REQUIRED_PERMISSIONS
          .mockReturnValueOnce(false); // NO_ORGANIZATION
        vi.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });
    });
  });

  describe('Multiple Permissions Tests', () => {
    it('should allow access if user has at least one required permission (OR logic)', async () => {
      const athleteContext = {
        ...mockContext,
        getClass: () => ({ name: 'AthleteController' }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['read', 'create']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(athleteContext);
      expect(result).toBe(true);
    });

    it('should deny access if user has none of the required permissions', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['create', 'update']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('Error Cases Tests', () => {
    it('should throw error when user is not found in session', async () => {
      const requestWithoutUser = {
        ...mockRequest,
        session: {
          ...mockRequest.session,
          user: null,
        },
      };

      const contextWithoutUser = {
        ...mockContext,
        switchToHttp: () => ({ getRequest: () => requestWithoutUser }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION

      await expect(guard.canActivate(contextWithoutUser)).rejects.toThrow(
        new ForbiddenException('Permission check failed')
      );
    });

    it('should throw error when user has no organization', async () => {
      const requestWithoutOrg = {
        ...mockRequest,
        session: {
          ...mockRequest.session,
          session: {
            ...mockRequest.session.session,
            activeOrganizationId: null,
          },
        },
      };

      const contextWithoutOrg = {
        ...mockContext,
        switchToHttp: () => ({ getRequest: () => requestWithoutOrg }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION

      await expect(guard.canActivate(contextWithoutOrg)).rejects.toThrow(
        new ForbiddenException('Permission check failed')
      );
    });

    it('should throw error when user is not a member of the organization', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new ForbiddenException('Permission check failed')
      );
    });
  });

  describe('No Required Permissions Tests', () => {
    it('should allow access when no permissions are required', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(undefined) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access when empty permissions array is required', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce([]) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      vi.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['read']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION
      vi.spyOn(entityManager, 'findOne').mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('permissions.config integration', () => {
    it('should allow athlete (member) read on athlete resource', () => {
      expect(hasPermission('member', 'athlete', ['read'])).toBe(true);
    });

    it('should allow coach (admin) full access on workout', () => {
      expect(hasPermission('admin', 'workout', ['delete'])).toBe(true);
    });

    it('should deny athlete (member) on workout', () => {
      expect(hasPermission('member', 'workout', ['read'])).toBe(false);
    });

    it('should deny unknown role', () => {
      expect(hasPermission('owner', 'workout', ['read'])).toBe(false);
    });
  });

  describe('Super admin bypass', () => {
    it('should allow app-level admin without organization check', async () => {
      const superAdminUser = { ...mockUser, role: 'admin' };
      const requestSuperAdmin = {
        ...mockRequest,
        session: {
          ...mockRequest.session,
          user: superAdminUser,
        },
      };
      const contextSuperAdmin = {
        ...mockContext,
        switchToHttp: () => ({ getRequest: () => requestSuperAdmin }),
      } as unknown as ExecutionContext;

      vi.spyOn(reflector, 'get')
        .mockReturnValueOnce(['delete']) // REQUIRED_PERMISSIONS
        .mockReturnValueOnce(false); // NO_ORGANIZATION

      const result = await guard.canActivate(contextSuperAdmin);
      expect(result).toBe(true);
      expect(entityManager.findOne).not.toHaveBeenCalled();
    });
  });
});
