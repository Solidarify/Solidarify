import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
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
  
  propuestas$!: Observable<PropuestaModel[]>;
  filtroForm!: FormGroup;
  currentUser: any = null;
  loading = true;
  totalPropuestas = 0;
  mode: 'mine' | 'explore' = 'explore';
  pageTitle = 'Explorar propuestas';
  userRole: string = '';
  userId: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: Usuario,
    private propuestaService: Propuesta,
    private modalCtrl: ModalController 
  ) { }

  ngOnInit() {
    // ✅ SUSCRIBIRSE al usuario actual (igual que HomePage)
    this.usuarioService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userRole = user?.roles?.[0] || '';
      this.userId = user?.idUsuario || 0;
      console.log('👤 Usuario en ListaPropuestas:', this.userRole, this.userId);
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.mode = (params.get('mode') as 'mine' | 'explore') || 'explore';
      
      // ✅ Validar permisos ANTES de cargar
      if (this.mode === 'mine' && !this.tienePermisoMisPropuestas()) {
        console.log('❌ Sin permisos para Mis propuestas');
        this.router.navigate(['/explorar']);
        return;
      }
      
      this.pageTitle = this.mode === 'mine' ? 'Mis propuestas' : 'Explorar propuestas';
      this.initFiltroForm();
      this.cargarPropuestasIniciales();
    });
  }

  // ✅ NUEVA validación de permisos
  tienePermisoMisPropuestas(): boolean {
    const rolesPermitidos = ['ORGANIZADOR', 'ONG', 'ADMIN'];
    return rolesPermitidos.includes(this.userRole as any);
  }

  get searchControl(): FormControl {
    return this.filtroForm.get('search') as FormControl;
  }

  initFiltroForm() {
    const initialFilters: any = {
      search: '',
      tipoBien: '',
      lugar: '',
      estado: 'publicada',
      fechaInicio: ''
    };

    //MIS PROPUESTAS: filtrar por organizador del usuario actual
    if (this.mode === 'mine' && this.userId > 0) {
      initialFilters.organizador = this.userId;
      console.log('🔍 Filtro organizador:', this.userId);
    }

    this.filtroForm = this.fb.group(initialFilters);

    this.filtroForm.valueChanges.pipe(
      debounceTime(500), 
      distinctUntilChanged(), 
      switchMap(filtros => {
        this.loading = true;
        
        //Forzar filtro organizador en "mis propuestas"
        if (this.mode === 'mine' && this.userId > 0) {
          filtros.organizador = this.userId;
        }
        
        return this.propuestaService.getFiltradas(filtros);
      })
    ).subscribe(propuestas => {
      this.propuestas$ = of(propuestas);
      this.totalPropuestas = propuestas.length;
      this.loading = false;
    });

  }

  cargarPropuestasIniciales() {
    this.loading = true;
    
    if (this.mode === 'mine' && this.userId > 0) {
      // ✅ ORGANIZADOR/ONG: sus propias propuestas
      console.log('📋 Cargando MIS propuestas para ID:', this.userId);
      this.propuestaService.getByOrganizador(this.userId).subscribe(propuestas => {
        this.propuestas$ = of(propuestas);
        this.totalPropuestas = propuestas.length;
        this.loading = false;
      });

    } else {
      // ✅ EXPLORAR o Usuario normal: solo públicas
      console.log('🔍 Cargando propuestas públicas');
      this.propuestaService.getPublicas().subscribe(propuestas => {
        this.propuestas$ = of(propuestas);
        this.totalPropuestas = propuestas.length;
        this.loading = false;
      });
    }
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
        this.cargarPropuestasIniciales();
      }
    });
    
    await modal.present();
  }

  limpiarFiltros() {
    const base: any = { estado: 'publicada' };
    if (this.mode === 'mine' && this.userId > 0) {
      base.organizador = this.userId;
    }
    
    this.filtroForm.reset(base);
  }

  trackById(index: number, propuesta: PropuestaModel) {
    return propuesta.idPropuesta;
  }
}
