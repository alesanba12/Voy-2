import { TestBed } from '@angular/core/testing';
import { AdminPartiesService } from './admin-parties-service';

describe('AdminPartiesService', () => {
  let service: AdminPartiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPartiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
