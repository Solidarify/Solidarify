import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, switchMap, startWith, catchError, tap } from 'rxjs/operators';
import { Auth } from '../services/auth';
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
  
  private auth = inject(Auth);
  private propuestaService = inject(Propuesta);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  propuestas$: Observable<PropuestaModel[]> = of([]); 
  
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
    console.log('🏁 Inicializando ListaPropuestasPage...');
    
    this.route.queryParamMap.subscribe(params => {
      const modeParam = params.get('mode');
      this.mode = (modeParam === 'mine') ? 'mine' : 'explore';
      this.configurarPagina();
      
      this.refreshTrigger$.next();
    });

    this.propuestas$ = combineLatest([
      this.filtroForm.valueChanges.pipe(startWith(this.filtroForm.value), debounceTime(400)),
      this.refreshTrigger$
    ]).pipe(
      tap(() => this.loading = true), 
      switchMap(([filtros, _]) => {
        let request$: Observable<PropuestaModel[]>;
        if (this.mode === 'mine') {
          const user = this.auth.currentUser();
          if (!user) {
            request$ = of([]); 
          } else {
            request$ = this.propuestaService.getFiltradas({ ...filtros, organizador: user.idUsuario });
          }
        } else {
          request$ = this.propuestaService.getFiltradas({ ...filtros, estado: 'publicada' });
        }

        return request$.pipe(
          tap(resultados => {
            this.loading = false;
            this.totalPropuestas = resultados.length;
            console.log('✅ Resultados encontrados:', resultados.length);
          }),
          catchError(err => {
            console.error('❌ Error HTTP:', err);
            this.loading = false; 
            return of([]); 
          })
        );
      })
    );
  }

  private configurarPagina() {
    if (this.mode === 'mine') {
      if (!this.auth.isAuthenticated()) {
        this.router.navigate(['/login']);
        return;
      }
      
      const esOrganizador = this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ONG') || this.auth.hasRole('ADMIN');
      if (!esOrganizador) {
        this.router.navigate(['/lista-propuestas', { mode: 'explore' }]);
        return;
      }
      
      this.pageTitle = 'Mis propuestas';
      this.filtroForm.patchValue({ estado: '' }, { emitEvent: false });
    } else {
      this.pageTitle = 'Explorar propuestas';
      this.filtroForm.patchValue({ estado: 'publicada' }, { emitEvent: false });
    }
  }

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
    if (data?.refresh) {
      this.refreshTrigger$.next();
    }
  }

  limpiarFiltros() {
    this.filtroForm.reset({
      search: '',
      tipoBien: '',
      lugar: '',
      estado: this.mode === 'mine' ? '' : 'publicada',
      fechaInicio: ''
    });
  }
  
  get searchControl(): FormControl {
    return this.filtroForm.get('search') as FormControl;
  }

  trackById(index: number, item: PropuestaModel) {
    return item.idPropuesta;
  }

  get esUsuario(): boolean {
    return this.auth.hasRole('USER'); 
  }
}
