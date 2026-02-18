import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, tap, startWith, catchError } from 'rxjs/operators';
import { Auth } from '../services/auth';
import { Propuesta } from '../services/propuesta';
import { PropuestaModel } from '../models/propuesta.model';
import { PropuestaDetalleComponent } from '../modals/propuesta-detalle/propuesta-detalle.component'; // Ajusta ruta si es necesario

@Component({
  selector: 'app-lista-propuestas',
  templateUrl: './lista-propuestas.page.html',
  styleUrls: ['./lista-propuestas.page.scss'],
  standalone: false
})
export class ListaPropuestasPage implements OnInit {
  
  private auth = inject(Auth);
  private propuestaService = inject(Propuesta);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  propuestas$!: Observable<PropuestaModel[]>;
  loading = true;
  totalPropuestas = 0;
  
  mode: 'mine' | 'explore' = 'explore';
  pageTitle = 'Explorar propuestas';
  filtroForm: FormGroup;
  
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.filtroForm = this.fb.group({
      search: [''],
      tipoBien: [''],
      lugar: [''],
      estado: ['publicada'], 
      fechaInicio: ['']
    });
  }


ngOnInit() {
  console.log('🏁 Inicializando ListaPropuestasPage (Modo Simple)...');
  this.loading = true;

  this.route.queryParamMap.pipe(
    switchMap(params => {
      const modeParam = params.get('mode');
      this.mode = (modeParam === 'mine') ? 'mine' : 'explore';
      this.configurarPagina();
      
      console.log('🔗 Modo detectado:', this.mode);

      return this.filtroForm.valueChanges.pipe(
        startWith(this.filtroForm.value), 
        debounceTime(400),
        switchMap(filtros => {
          console.log('🔍 Ejecutando búsqueda...');
          this.loading = true; 

          if (this.mode === 'mine') {
            const user = this.auth.currentUser();
            if (!user) return of([]); 
            return this.propuestaService.getFiltradas({ ...filtros, organizador: user.idUsuario });
          } else {
            return this.propuestaService.getFiltradas({ ...filtros, estado: 'publicada' });
          }
        })
      );
    })
  ).subscribe({
    next: (resultados) => {
      console.log('✅ Resultados recibidos:', resultados.length);
      this.propuestas$ = of(resultados); 
      this.totalPropuestas = resultados.length;
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Error:', err);
      this.loading = false;
    }
  });
}



  private configurarPagina() {
    if (this.mode === 'mine') {
      if (!this.auth.isAuthenticated()) {
        this.router.navigate(['/login']);
        return;
      }
      
      const esOrganizador = this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ONG') || this.auth.hasRole('ADMIN');
      if (!esOrganizador) {
        this.router.navigate(['/lista-propuestas', { mode: 'explore' }]); // Redirigir a explorar
        return;
      }
      this.pageTitle = 'Mis propuestas';
    } else {
      this.pageTitle = 'Explorar propuestas';
    }
  }

  // --- ACCIONES ---

  async verDetalle(propuesta: PropuestaModel) {
    const modal = await this.modalCtrl.create({
      component: PropuestaDetalleComponent,
      componentProps: { propuesta },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'propuesta-modal-sheet'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    // Si el modal devuelve 'refresh: true' (ej. al editar/borrar), recargamos
    if (data?.refresh) {
      this.refreshTrigger$.next();
    }
  }

  limpiarFiltros() {
    this.filtroForm.reset({
      search: '',
      tipoBien: '',
      lugar: '',
      estado: this.mode === 'mine' ? '' : 'publicada', // En 'mine' queremos ver todas
      fechaInicio: ''
    });
  }

  // --- GETTERS & HELPERS ---
  
  get searchControl(): FormControl {
    return this.filtroForm.get('search') as FormControl;
  }

  trackById(index: number, item: PropuestaModel) {
    return item.idPropuesta;
  }


get esUsuario(): boolean {
  return this.auth.hasRole('USUARIO');
}


}
