import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, tap, catchError, map, delay } from 'rxjs/operators';

import { Auth } from '../services/auth';
import { PerfilOng } from '../services/perfil-ong';
import { PerfilONGModel } from '../models/perfil-ong.model';
import { OngDetalleComponent } from '../modals/ong-detalle/ong-detalle.component';

@Component({
  selector: 'app-lista-ongs',
  templateUrl: './lista-ongs.page.html',
  styleUrls: ['./lista-ongs.page.scss'],
  standalone: false
})
export class ListaOngsPage implements OnInit {
  
  private auth = inject(Auth);
  private perfilOngService = inject(PerfilOng);
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  ongs$!: Observable<PerfilONGModel[]>;
  loading = true;
  totalOngs = 0;
  
  pageTitle = 'Directorio de ONGs';
  filtroForm: FormGroup;
  
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.filtroForm = this.fb.group({
      search: [''] 
    });
  }

 ngOnInit() {
  console.log('🏁 Inicializando ListaOngsPage...');

  this.filtroForm.get('search')!.valueChanges.pipe(
    startWith(''),
    debounceTime(400),
    distinctUntilChanged(),
    tap(val => {
      console.log('⚡ Stream activo. Valor:', val);
      this.loading = true;
    }),
    switchMap(termino => {
      console.log('🔄 Llamando al servicio...');
      if (termino && termino.trim().length > 0) {
        return this.perfilOngService.searchByName(termino.trim());
      } else {
        return this.perfilOngService.getAll();
      }
    })
  ).subscribe({
    next: (resultados) => {
      console.log('✅ Datos recibidos:', resultados.length);
      this.ongs$ = of(resultados); 
      this.totalOngs = resultados.length;
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Error fatal:', err);
      this.loading = false;
    }
  });
}


  get searchControl(): FormControl {
    return this.filtroForm.get('search') as FormControl;
  }

  get esAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  limpiarFiltros() {
    this.filtroForm.setValue({ search: '' }); 
  }


async verDetalle(ong: PerfilONGModel) {
  const modal = await this.modalCtrl.create({
    component: OngDetalleComponent,
    componentProps: { 
      ong, 
      isAdmin: this.esAdmin 
    },
    breakpoints: [0, 1],
    initialBreakpoint: 1,
    cssClass: 'ong-modal-sheet'
  });

  await modal.present();
  
  const { data } = await modal.onDidDismiss();
  
  if (data?.refresh) {
    console.log('🔄 Recargando lista tras cambios...');
    this.filtroForm.get('search')?.updateValueAndValidity();
  }
}


  trackById(index: number, item: PerfilONGModel) {
    return item.idUsuario;
  }
}
