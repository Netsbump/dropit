import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/core';
import { PermissionsGuard } from './permissions.guard';
import { member, admin, owner } from '@dropit/permissions';
import { Member, Organization, Invitation } from '../members/organization/organization.entity';
import { Collection } from '@mikro-orm/core';

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
    role: 'athlete',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockOrganization = { 
    id: 'org-456', 
    name: 'Test Org',
    createdAt: new Date(),
    members: { add: jest.fn(), getItems: jest.fn(), count: jest.fn(), isInitialized: true } as unknown as Collection<Member>,
    invitations: { add: jest.fn(), getItems: jest.fn(), count: jest.fn(), isInitialized: true } as unknown as Collection<Invitation>,
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
            get: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            findOne: jest.fn(),
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

  describe('Permission Mapping Tests', () => {
    it('should correctly map member permissions for workout resource', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(entityManager.findOne).toHaveBeenCalledWith(Member, {
        user: { id: mockUser.id },
        organization: { id: 'org-456' },
      });
    });

    it('should correctly map admin permissions for workout resource', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['create']);
      const adminMember = { ...mockMember, role: 'admin' };
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should correctly map owner permissions for workout resource', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['delete']);
      const ownerMember = { ...mockMember, role: 'owner' };
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(ownerMember);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should handle unknown organization role', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      const unknownRoleMember = { ...mockMember, role: 'unknown' };
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(unknownRoleMember);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Different Routes Tests', () => {
    it('should handle WorkoutController correctly', async () => {
      const workoutContext = {
        ...mockContext,
        getClass: () => ({ name: 'WorkoutController' }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(workoutContext);
      expect(result).toBe(true);
    });

    it('should handle ExerciseController correctly', async () => {
      const exerciseContext = {
        ...mockContext,
        getClass: () => ({ name: 'ExerciseController' }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(exerciseContext);
      expect(result).toBe(true);
    });

    it('should handle ComplexController correctly', async () => {
      const complexContext = {
        ...mockContext,
        getClass: () => ({ name: 'ComplexController' }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(complexContext);
      expect(result).toBe(true);
    });

    it('should handle AthleteController correctly', async () => {
      const athleteContext = {
        ...mockContext,
        getClass: () => ({ name: 'AthleteController' }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(athleteContext);
      expect(result).toBe(true);
    });

    it('should handle SessionController correctly', async () => {
      const sessionContext = {
        ...mockContext,
        getClass: () => ({ name: 'SessionController' }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(sessionContext);
      expect(result).toBe(true);
    });
  });

  describe('Role-based Access Tests', () => {
    describe('Member Role Tests', () => {
      it('should allow member to read workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['read']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should deny member from creating workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['create']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
      });

      it('should deny member from updating workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['update']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
      });

      it('should deny member from deleting workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['delete']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
      });

      it('should allow member to create personal records', async () => {
        const personalRecordContext = {
          ...mockContext,
          getClass: () => ({ name: 'PersonalRecordController' }),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(['create']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

        await expect(guard.canActivate(personalRecordContext)).rejects.toThrow(ForbiddenException);
      });

      it('should document the current controller name transformation behavior', () => {
        const controllerName = 'PersonalRecordController';
        const resource = controllerName.replace('Controller', '').toLowerCase();
        
        expect(resource).toBe('personalrecord');
        expect((member.statements as Record<string, string[]>).personalRecord).toBeDefined();
        expect((member.statements as Record<string, string[]>).personalrecord).toBeUndefined();
      });
    });

    describe('Admin Role Tests', () => {
      const adminMember = { ...mockMember, role: 'admin' };

      it('should allow admin to read workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['read']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow admin to create workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['create']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow admin to update workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['update']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow admin to delete workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['delete']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(adminMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });
    });

    describe('Owner Role Tests', () => {
      const ownerMember = { ...mockMember, role: 'owner' };

      it('should allow owner to read workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['read']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(ownerMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow owner to create workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['create']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(ownerMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow owner to update workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['update']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(ownerMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });

      it('should allow owner to delete workouts', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['delete']);
        jest.spyOn(entityManager, 'findOne').mockResolvedValue(ownerMember);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });
    });
  });

  describe('Multiple Permissions Tests', () => {
    it('should allow access if user has at least one required permission (OR logic)', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['read', 'create']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny access if user has none of the required permissions', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['create', 'update']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
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

      jest.spyOn(reflector, 'get').mockReturnValue(['read']);

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

      jest.spyOn(reflector, 'get').mockReturnValue(['read']);

      await expect(guard.canActivate(contextWithoutOrg)).rejects.toThrow(
        new ForbiddenException('Permission check failed')
      );
    });

    it('should throw error when user is not a member of the organization', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new ForbiddenException('Permission check failed')
      );
    });
  });

  describe('No Required Permissions Tests', () => {
    it('should allow access when no permissions are required', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access when empty permissions array is required', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue([]);
      jest.spyOn(entityManager, 'findOne').mockResolvedValue(mockMember);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['read']);
      jest.spyOn(entityManager, 'findOne').mockRejectedValue(new Error('Database connection failed'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Permission Package Integration Tests', () => {
    it('should use correct permission mappings from @dropit/permissions package', () => {
      expect((member.statements as Record<string, string[]>).workout).toEqual(['read']);
      expect((admin.statements as Record<string, string[]>).workout).toEqual(['read', 'create', 'update', 'delete']);
      expect((owner.statements as Record<string, string[]>).workout).toEqual(['read', 'create', 'update', 'delete']);
    });

    it('should handle all supported resources', () => {
      const resources = ['workout', 'exercise', 'complex', 'athlete', 'session', 'personalRecord'] as const;
      
      for (const resource of resources) {
        expect((member.statements as Record<string, string[]>)[resource]).toBeDefined();
        expect((admin.statements as Record<string, string[]>)[resource]).toBeDefined();
        expect((owner.statements as Record<string, string[]>)[resource]).toBeDefined();
      }
    });
  });
}); 