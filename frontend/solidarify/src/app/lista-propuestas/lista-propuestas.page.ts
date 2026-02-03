import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { Usuario } from '../services/usuario'; 
import { Propuesta } from '../services/propuesta';
import { PropuestaModel } from '../models/propuesta.model';
import { PropuestaDetalleComponent } from '../modals/propuesta-detalle/propuesta-detalle.component';

@Component({
  selector: 'app-lista-propuestas',
  templateUrl: './lista-propuestas.page.html',
  styleUrls: ['./lista-propuestas.page.scss'],
  standalone: false
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
    private propuestaService: Propuesta,
    private modalCtrl: ModalController 
  ) { }

  ngOnInit() {
    this.currentUser = this.usuarioService.getCurrentUser();
    
    this.initFiltroForm();
    this.cargarPropuestas();
  }

  get searchControl(): FormControl {
    return this.filtroForm.get('search') as FormControl;
  }

  initFiltroForm() {
    this.filtroForm = this.fb.group({
      search: '',
      tipoBien: '',
      lugar: '',
      estado: 'publicada', 
      fechaInicio: '',
      organizador: ''
    });

    this.filtroForm.valueChanges.pipe(
      debounceTime(500), 
      distinctUntilChanged(), 
      switchMap(filtros => {
        this.loading = true;
        return this.propuestaService.getFiltradas(filtros);
      })
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

  async verDetalle(propuesta: PropuestaModel) {
    const modal = await this.modalCtrl.create({
      component: PropuestaDetalleComponent,
      componentProps: { propuesta }, //Pasa modelo tipado
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'propuesta-modal-sheet'
    });

    modal.onDidDismiss().then(result => {
      if (result.data?.propuesta) {
        this.cargarPropuestas(); 
      }
    });
    
    await modal.present();
  }

  limpiarFiltros() {
    this.filtroForm.reset({ estado: 'publicada' });
  }

  trackById(index: number, propuesta: any) {
    return propuesta.idPropuesta;
  }
}
