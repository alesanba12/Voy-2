import { Component } from '@angular/core';
import { KpiMetrics } from '../kpi-metrics/kpi-metrics';
import { TagsAdmin } from '../../tags/tags-admin/tags-admin';
import { OrganizerRequests } from '../organizer-requests/organizer-requests';

@Component({
  imports: [KpiMetrics, OrganizerRequests , TagsAdmin],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
