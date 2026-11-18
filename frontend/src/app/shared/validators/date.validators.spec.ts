import { TestBed } from '@angular/core/testing';
import { DateValidators } from './date.validators';

describe('DateValidators', () => {
  let service: DateValidators;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateValidators);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
