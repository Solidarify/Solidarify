import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, tap, catchError } from 'rxjs/operators';
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

  ongs$: Observable<PerfilONGModel[]> = of([]); 
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
    this.loading = true;

    this.ongs$ = combineLatest([
      this.filtroForm.get('search')!.valueChanges.pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged()
      ),
      this.refreshTrigger$
    ]).pipe(
      tap(([termino, _]) => {
        this.loading = true;
      }),
      switchMap(([termino, _]) => {
        if (termino && termino.trim().length > 0) {
          return this.perfilOngService.searchByName(termino.trim());
        } else {
          return this.perfilOngService.getAll();
        }
      }),
      tap(resultados => {
        this.totalOngs = resultados.length;
        this.loading = false;
      }),
      catchError(err => {
        this.loading = false;
        return of([]);
      })
    );
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
    
    if (data?.refresh || data?.ong) {
      this.refreshTrigger$.next();
    }
  }

  trackById(index: number, item: PerfilONGModel) {
    return item.idUsuario;
  }
}
