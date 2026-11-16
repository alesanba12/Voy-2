import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { metricsDTO } from './kpi-metrics/metrics';
import { OrganizerRejectReqDTO, OrganizerVerificationResDTO } from './organizer-requests/organizer-requests.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly metricsUrl = '/api/admin/metrics';
  private readonly organizersUrl = '/api/admin/organizers';

  // Recurso compartido para que KpiMetrics y OrganizerRequests actualicen las mismas tarjetas
  readonly metricsResource = httpResource<metricsDTO>(() => {
    const token = this.authService.getToken();
    return token ? this.metricsUrl : undefined;
  });

  getAllMetrics() {
    return this.metricsResource;
  }

  getPendingVerifications() {
    return httpResource<OrganizerVerificationResDTO[]>(() => {
      const token = this.authService.getToken();
      return token ? `${this.organizersUrl}/pending` : undefined;
    });
  }

  approveVerification(userExternalId: string) {
    return this.http.patch<OrganizerVerificationResDTO>(
      `${this.organizersUrl}/${userExternalId}/approve`,
      {}
    );
  }

  rejectVerification(userExternalId: string, body: OrganizerRejectReqDTO) {
    return this.http.patch<OrganizerVerificationResDTO>(
      `${this.organizersUrl}/${userExternalId}/reject`,
      body
    );
  }
}