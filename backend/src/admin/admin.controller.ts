import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { Role } from '../auth/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('recent-orders')
  async getRecentOrders() {
    return this.adminService.getRecentOrders();
  }

  @Get('top-products')
  async getTopProducts() {
    return this.adminService.getTopProducts();
  }

  @Get('notifications')
  async getNotifications(@Query('since') since?: string) {
    return this.adminService.getNotifications(since);
  }
}
