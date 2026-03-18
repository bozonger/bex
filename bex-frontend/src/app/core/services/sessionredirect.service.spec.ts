import { TestBed } from '@angular/core/testing';

import { Sessionredirect } from './sessionredirect.service';

describe('Sessionredirect', () => {
  let service: Sessionredirect;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sessionredirect);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
