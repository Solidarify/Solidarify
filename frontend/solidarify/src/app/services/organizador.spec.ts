import { TestBed } from '@angular/core/testing';

import { Organizador } from './organizador';

describe('Organizador', () => {
  let service: Organizador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Organizador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
