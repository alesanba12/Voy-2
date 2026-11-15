import { Component } from '@angular/core';
import { KpiMetrics } from '../kpi-metrics/kpi-metrics';
import { OrganizerRequests } from '../organizer-requests/organizer-requests';

@Component({
  imports: [KpiMetrics, OrganizerRequests],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
