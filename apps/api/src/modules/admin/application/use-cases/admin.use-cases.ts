import { Inject, Injectable } from '@nestjs/common';
import {
  ADMIN_REPOSITORY,
  IAdminRepository,
} from '../ports/admin.repository.port';
import { IAdminUseCases } from '../ports/admin-use-cases.port';

@Injectable()
export class AdminUseCases implements IAdminUseCases {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository
  ) {}

  getUsers() {
    return this.adminRepository.getUsers();
  }

  getInvitations() {
    return this.adminRepository.getPendingInvitations();
  }
}
