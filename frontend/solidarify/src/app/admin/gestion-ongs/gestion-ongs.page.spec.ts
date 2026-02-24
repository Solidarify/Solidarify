import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionOngsPage } from './gestion-ongs.page';

describe('GestionOngsPage', () => {
  let component: GestionOngsPage;
  let fixture: ComponentFixture<GestionOngsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionOngsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
