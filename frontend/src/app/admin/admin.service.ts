import { httpResource } from '@angular/common/http';
import { Service } from '@angular/core';
import { metricsDTO } from './metrics';

@Service()
export class AdminService {
    private readonly url = 'api/admin';

    getAllMetrics(){
        return httpResource<metricsDTO>(() => `${this.url}/metrics/`);
    }
}
