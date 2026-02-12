import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaOngsPage } from './lista-ongs.page';

describe('ListaOngsPage', () => {
  let component: ListaOngsPage;
  let fixture: ComponentFixture<ListaOngsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaOngsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
