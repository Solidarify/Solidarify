import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaPropuestasPage } from './lista-propuestas.page';

describe('ListaPropuestasPage', () => {
  let component: ListaPropuestasPage;
  let fixture: ComponentFixture<ListaPropuestasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPropuestasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
