import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard.js';
import { AdminRoleGuard } from './guards/admin-role.guard.js';
import { AdminUserListQueryDto } from '../application/dto/admin-user-list-query.dto.js';
import { ListUsersUseCase } from '../application/use-cases/list-users.use-case.js';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUsersController {
  constructor(private readonly listUsersUseCase: ListUsersUseCase) {}

  @Get()
  async listUsers(@Query() query: AdminUserListQueryDto) {
    return this.listUsersUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }
}
