import { httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { metricsDTO } from './metrics';
import { AuthService } from '../core/auth/auth.service';

@Service()
export class AdminService {
    private readonly authService = inject(AuthService);
    private readonly url = '/api/admin';

    getAllMetrics(){
        return httpResource<metricsDTO>(() => {
            const token = this.authService.getToken();
            return token ? `${this.url}/metrics` : undefined;
        });
    }
}
