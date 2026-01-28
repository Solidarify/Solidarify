import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPropuestaPage } from './crear-propuesta.page';

describe('CrearPropuestaPage', () => {
  let component: CrearPropuestaPage;
  let fixture: ComponentFixture<CrearPropuestaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPropuestaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
