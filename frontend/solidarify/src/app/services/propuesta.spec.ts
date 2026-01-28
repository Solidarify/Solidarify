import { TestBed } from '@angular/core/testing';

import { Propuesta } from './propuesta';

describe('Propuesta', () => {
  let service: Propuesta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Propuesta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
