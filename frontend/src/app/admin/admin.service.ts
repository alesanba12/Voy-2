import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, Service, Signal, inject } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { metricsDTO } from './kpi-metrics/metrics';
import { OrganizerQueryParams, OrganizerRejectReq, OrganizerVerificationRes, PageResponse } from './organizer.request.model';

@Service()
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

  // Recurso compartido para el widget compacto de pendientes (/pending)
  readonly pendingVerificationsResource = httpResource<OrganizerVerificationRes[]>(() => {
    const token = this.authService.getToken();
    return token ? `${this.organizersUrl}/pending` : undefined;
  });

  getAllMetrics() {
    return this.metricsResource;
  }

  getPendingVerifications() {
    return this.pendingVerificationsResource;
  }

  // Recurso paginado/filtrado para OrganizerRequestsTable
  getVerifications(params: Signal<OrganizerQueryParams>) {
    return httpResource<PageResponse<OrganizerVerificationRes>>(() => {
      const token = this.authService.getToken();
      if (!token) return undefined;

      const { status, page, size } = params();
      const query = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort: 'createdAt,desc',
      });

      if (status !== 'ALL') {
        query.set('status', status);
      }

      return `${this.organizersUrl}?${query.toString()}`;
    });
  }

  approveVerification(userExternalId: string) {
    return this.http.patch<OrganizerVerificationRes>(
      `${this.organizersUrl}/${userExternalId}/approve`,
      {}
    );
  }

  rejectVerification(userExternalId: string, body: OrganizerRejectReq) {
    return this.http.patch<OrganizerVerificationRes>(
      `${this.organizersUrl}/${userExternalId}/reject`,
      body
    );
  }
}