import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Member, Organization } from './organization.entity';
import { User } from '../auth/auth.entity';

@Injectable()
export class OrganizationService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Récupère les IDs des coachs (admin/owner) d'une organisation
   * @param organizationId - ID de l'organisation
   * @returns Array des IDs des coachs
   * @throws NotFoundException si aucun coach n'est trouvé
   */
  async getCoachUserIds(organizationId: string): Promise<string[]> {
    const coachMembers = await this.em.find(Member, {
      organization: {
        id: organizationId,
      },
      role: { $in: ['admin', 'owner'] }
    });

    if (coachMembers.length === 0) {
      throw new NotFoundException(`Coach members with organization id ${organizationId} not found`);
    }

    return coachMembers.map((member) => member.user.id);
  }

  /**
   * Récupère l'utilisateur par son ID
   * @param userId - ID de l'utilisateur
   * @returns L'utilisateur
   * @throws NotFoundException si l'utilisateur n'est pas trouvé
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  /**
   * Génère les conditions de filtrage pour les entités créées par les coachs
   * @param coachUserIds - IDs users des coachs
   * @returns Conditions $or pour MikroORM
   */
  getCoachFilterConditions(coachUserIds: string[]) {
    return {
      $or: [
        { createdBy: null }, // Catalogue commun
        { createdBy: { id: { $in: coachUserIds } } }, // Contenu des coachs
      ],
    };
  }

  /**
   * Récupère les coachs et génère les conditions de filtrage en une seule méthode
   * @param organizationId - ID de l'organisation
   * @returns Objet avec coachUserIds et conditions de filtrage
   */
  async getCoachFilterData(organizationId: string) {
    const coachUserIds = await this.getCoachUserIds(organizationId);
    const filterConditions = this.getCoachFilterConditions(coachUserIds);
    
    return {
      coachUserIds,
      filterConditions,
    };
  }

  /**
   * Vérifie si un utilisateur est coach dans une organisation
   * @param userId - ID de l'utilisateur
   * @param organizationId - ID de l'organisation
   * @returns true si l'utilisateur est coach
   */
  async isUserCoach(userId: string, organizationId: string): Promise<boolean> {
    const member = await this.em.findOne(Member, {
      user: userId,
      organization: organizationId,
      role: { $in: ['admin', 'owner'] }
    });
    
    return !!member;
  }

  /**
   * Récupère l'organisation par son ID
   * @param organizationId - ID de l'organisation
   * @returns L'organisation
   * @throws NotFoundException si l'organisation n'est pas trouvée
   */
  async getOrganizationById(organizationId: string): Promise<Organization> {
    const organization = await this.em.findOne(Organization, { id: organizationId });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }
    return organization;
  }

  /**
   * Récupère les IDs des athlètes d'une organisation
   * @param organizationId - ID de l'organisation
   * @returns Array des IDs des athlètes
  */
  async getAthleteUserIds(organizationId: string): Promise<string[]> {
  const athleteMembers = await this.em.find(Member, {
    organization: { id: organizationId },
    role: 'member'
  });

  return athleteMembers.map((member) => member.user.id);
  }

  /**
   * Vérifie si un athlète appartient à une organisation
   * @param athleteId - ID de l'athlète
   * @param organizationId - ID de l'organisation
   * @throws NotFoundException si l'athlète n'appartient pas à l'organisation
  */
  async checkAthleteBelongsToOrganization(athleteId: string, organizationId: string): Promise<void> {
    const member = await this.em.findOne(Member, {
      user: { id: athleteId },
      organization: { id: organizationId },
      role: 'member'
    });
    
    if (!member) {
      throw new NotFoundException(`Athlete with ID ${athleteId} does not belong to organization ${organizationId}`);
    }
  }
} 