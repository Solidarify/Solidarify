import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
//import { Usuario } from '../services/usuario';
import { Router } from '@angular/router';
import { Auth, User } from '../services/auth'; 
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
  currentUser: User | null = null;
  loading = true;
  totalPropuestas = 0;
  mode: 'mine' | 'explore' = 'explore';
  pageTitle = 'Explorar propuestas';
  userRole: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    //private usuarioService: Usuario,
    private auth: Auth,
    private propuestaService: Propuesta,
    private modalCtrl: ModalController 
  ) { }

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    this.userRole = this.currentUser?.role || '';
    
    //this.initFiltroForm();
    //this.cargarPropuestas();
    // Leer modo desde ruta (mine/explore)

    /*
    this.route.paramMap.subscribe(params => {
      this.mode = (params.get('mode') as 'mine' | 'explore') || 'explore';
      this.pageTitle = this.mode === 'mine' ? 'Mis propuestas' : 'Explorar propuestas';
      this.initFiltroForm();
      this.cargarPropuestasIniciales();
    });
    */

    this.activatedRoute.paramMap.subscribe(params => {
      this.mode = (params.get('mode') as 'mine' | 'explore') || 'explore';
      
      // ✅ Usuario NO puede acceder a "mis propuestas"
      if (this.mode === 'mine' && this.userRole === 'Usuario') {
        this.router.navigate(['/explorar']); // Redirige a explorar
        return;
      }
      
      this.pageTitle = this.mode === 'mine' ? 'Mis propuestas' : 'Explorar propuestas';
      this.initFiltroForm();
      this.cargarPropuestasIniciales();
    });
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
    if (this.mode === 'mine' && this.currentUser && this.userRole !== 'Usuario') {
      initialFilters.organizador = this.currentUser.id;
    }

    this.filtroForm = this.fb.group(initialFilters);

    this.filtroForm.valueChanges.pipe(
      debounceTime(500), 
      distinctUntilChanged(), 
      switchMap(filtros => {
        this.loading = true;
        
        //Forzar filtro organizador en "mis propuestas"
        if (this.mode === 'mine' && this.currentUser) {
          filtros.organizador = this.currentUser.id;
        }
        
        return this.propuestaService.getFiltradas(filtros);
      })
    ).subscribe(propuestas => {
      this.propuestas$ = of(propuestas);
      this.totalPropuestas = propuestas.length;
      this.loading = false;
    });

    /*
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
    */
  }

  cargarPropuestasIniciales() {
    this.loading = true;
    
    //USUARIO: siempre ve públicas (no puede "mis propuestas")
    if (this.userRole === 'Usuario' || this.mode === 'explore') {
      this.propuestaService.getPublicas().subscribe(propuestas => {
        this.propuestas$ = of(propuestas);
        this.totalPropuestas = propuestas.length;
        this.loading = false;
      });

    }else if (this.mode === 'mine' && this.currentUser) {
      // MIS PROPUESTAS: usar servicio específico
      this.propuestaService.getByOrganizador(this.currentUser.id).subscribe(propuestas => {
        this.propuestas$ = of(propuestas);
        this.totalPropuestas = propuestas.length;
        this.loading = false;
      });

    } else {
      //EXPLORAR: todas públicas
      this.propuestaService.getPublicas().subscribe(propuestas => {
        this.propuestas$ = of(propuestas);
        this.totalPropuestas = propuestas.length;
        this.loading = false;
      });
    }
  }

  /*
  cargarPropuestas() {
    this.loading = true;
    this.propuestaService.getPublicas().subscribe(propuestas => {
      this.propuestas$ = of(propuestas);
      this.totalPropuestas = propuestas.length;
      this.loading = false;
    });
  }
  */

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
        //this.cargarPropuestas(); 
        this.cargarPropuestasIniciales();
      }
    });
    
    await modal.present();
  }

  limpiarFiltros() {
    //this.filtroForm.reset({ estado: 'publicada' });
    const base: any = { estado: 'publicada' };
    if (this.mode === 'mine' && this.currentUser && this.userRole !== 'Usuario') {
      base.organizador = this.currentUser.id;
    }
    
    this.filtroForm.reset(base);
  }

  trackById(index: number, propuesta: any) {
    return propuesta.idPropuesta;
  }
}
