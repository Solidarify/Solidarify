import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { PerfilOng } from '../services/perfil-ong';
import { PerfilONGModel } from '../models/perfil-ong.model';
import { OngDetalleComponent } from '../modals/ong-detalle/ong-detalle.component';
import { Usuario } from '../services/usuario';

@Component({
  selector: 'app-lista-ongs',
  templateUrl: './lista-ongs.page.html',
  styleUrls: ['./lista-ongs.page.scss'],
  standalone: false
})
export class ListaOngsPage implements OnInit {

  ongs$!: Observable<PerfilONGModel[]>;
  filtroForm!: FormGroup;
  currentUser: any = null;
  loading = true;
  totalOngs = 0;
  pageTitle = 'Explorar ONGs';
  userRole: string = '';

  constructor(
    private fb: FormBuilder,
    private perfilOngService: PerfilOng,
    private modalCtrl: ModalController,
    private usuarioService: Usuario
  ) {}

  ngOnInit() {
    this.usuarioService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userRole = user?.roles?.[0] || '';
      console.log('👤 Usuario en ListaOngs:', this.userRole);
    });

    this.pageTitle = 'Explorar ONGs';
    this.initFiltroForm();
    this.cargarOngsIniciales();
  }

  /*
  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }
  */

  get searchControl(): FormControl {
    return this.filtroForm.get('search') as FormControl;
  }

  get estadoControl(): FormControl {
    return this.filtroForm.get('estadoVerificacion') as FormControl;
  }

  initFiltroForm() {
    const initialFilters: any = {
      search: ''
    };

    this.filtroForm = this.fb.group(initialFilters);

    this.filtroForm.valueChanges.pipe(
      debounceTime(500), 
      distinctUntilChanged(), 
      switchMap(filtros => {
        this.loading = true;
        return this.filtrarOngs(filtros.search);
      })
    ).subscribe(ongs => {
      this.ongs$ = of(ongs);
      this.totalOngs = ongs.length;
      this.loading = false;
    });
  }

  private filtrarOngs(search: string): Observable<PerfilONGModel[]> {
    return this.perfilOngService.getAll().pipe(
      switchMap(ongs => {
        if (search && search.trim().length > 0) {
          const term = search.toLowerCase();
          const filtradas = ongs.filter(o =>
            o.nombreLegal.toLowerCase().includes(term) ||
            o.cif.toLowerCase().includes(term) ||
            (o.descripcion || '').toLowerCase().includes(term)
          );
          return of(filtradas);
        }
        return of(ongs);
      })
    );
  }

  cargarOngsIniciales() {
    this.loading = true;
    console.log('🔍 Cargando ONGs públicas');
    this.perfilOngService.getAll().subscribe(ongs => {
      this.ongs$ = of(ongs);
      this.totalOngs = ongs.length;
      this.loading = false;
    });
  }

  limpiarFiltros() {
    this.filtroForm.reset({
      search: '',
      estadoVerificacion: ''
    });
  }

  async verDetalle(ong: PerfilONGModel) {
    const modal = await this.modalCtrl.create({
      component: OngDetalleComponent,
      componentProps: { 
        ong,
        isAdmin: this.userRole === 'ADMIN'
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'ong-modal-sheet'
    });

    modal.onDidDismiss().then(result => {
      if (result.data?.ong) {
        this.cargarOngsIniciales();
      }
    });
    
    await modal.present();
  }

  trackById(index: number, ong: PerfilONGModel) {
    return ong.idUsuario;
  }
}
