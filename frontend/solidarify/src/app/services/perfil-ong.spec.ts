import { TestBed } from '@angular/core/testing';

import { PerfilOng } from './perfil-ong';

describe('PerfilOng', () => {
  let service: PerfilOng;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfilOng);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
