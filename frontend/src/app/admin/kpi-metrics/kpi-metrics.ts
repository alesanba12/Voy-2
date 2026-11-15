import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminService } from '../admin.service';

@Component({
  imports: [DecimalPipe],
  selector: 'app-kpi-metrics',
  templateUrl: './kpi-metrics.html',
  styleUrl: './kpi-metrics.css'
})
export class KpiMetrics {
  private readonly adminService = inject(AdminService);
  protected readonly metrics = this.adminService.getAllMetrics();
}