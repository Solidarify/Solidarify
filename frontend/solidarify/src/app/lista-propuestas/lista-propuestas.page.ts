import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Usuario } from '../services/usuario';
import { Propuesta } from '../services/propuesta';

@Component({
  selector: 'app-lista-propuestas',
  templateUrl: './lista-propuestas.page.html',
  styleUrls: ['./lista-propuestas.page.scss'],
})
export class ListaPropuestasPage implements OnInit {

  propuestas$!: Observable<any[]>;
  filtroForm!: FormGroup;
  currentUser: any = null;
  loading = true;
  totalPropuestas = 0;

  constructor(
    private fb: FormBuilder,
    private usuarioService: Usuario,
    private propuestaService: Propuesta
  ) { }

  ngOnInit() {
    this.currentUser = this.usuarioService.getCurrentUser();
    this.initFiltroForm();
    this.cargarPropuestas();
  }

  initFiltroForm() {
    this.filtroForm = this.fb.group({
      search: '',
      tipoBien: '',
      lugar: '',
      estado: 'publicada', // Por defecto solo públicas
      fechaInicio: '',
      organizador: ''
    });

    // Filtro reactivo(busca mientras escribes)
    this.filtroForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(filtros => this.propuestaService.getFiltradas(filtros))
    ).subscribe(propuestas => {
      this.propuestas$ = of(propuestas);
      this.totalPropuestas = propuestas.length;
      this.loading = false;
    });
  }

  cargarPropuestas() {
    this.loading = true;
    this.propuestaService.getPublicas().subscribe(propuestas => {
      this.propuestas$ = of(propuestas);
      this.totalPropuestas = propuestas.length;
      this.loading = false;
    });
  }

  // Filtros por campos SQL
  limpiarFiltros() {
    this.filtroForm.reset({ estado: 'publicada' });
  }

  trackById(index: number, propuesta: any) {
    return propuesta.Id_Propuesta;
  }

}