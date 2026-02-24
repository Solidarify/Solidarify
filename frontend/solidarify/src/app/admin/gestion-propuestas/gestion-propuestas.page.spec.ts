import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionPropuestasPage } from './gestion-propuestas.page';

describe('GestionPropuestasPage', () => {
  let component: GestionPropuestasPage;
  let fixture: ComponentFixture<GestionPropuestasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionPropuestasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
