import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Propuesta } from '../services/propuesta';
import { Auth } from '../services/auth';
import { PropuestaModel } from '../models/propuesta.model';
import { PropuestaDetalleComponent } from '../modals/propuesta-detalle/propuesta-detalle.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  
  private modalCtrl = inject(ModalController);
  private auth = inject(Auth);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private propuestaService = inject(Propuesta);

  currentUser = this.auth.currentUser; 
  isLoggedIn = this.auth.isAuthenticated; 

  propuestasUrgentes: PropuestaModel[] = [];
  cargando = true;

  stats = {
    ayudasCompletadas: 0,
    ayudasEnCurso: 0
  };

  constructor() {}

  async ngOnInit() {
    await this.cargarUrgentes();
    if (this.isLoggedIn()) {
      await this.cargarEstadisticas();
    }
  }

  get avatarUrl(): string {
    const u = this.currentUser();
    
    if (u?.fotoPerfil) {
      return u.fotoPerfil.startsWith('data:image') 
        ? u.fotoPerfil 
        : `data:image/jpeg;base64,${u.fotoPerfil}`;
    }
    
    return u 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=10b981&color=fff`
      : '';
  }

  async cargarEstadisticas() {
    const user = this.currentUser();
    if (!user) return;

    try {
      const todas = await firstValueFrom(this.propuestaService.getAll());
      
      const misPropuestas = todas.filter(p => 
        p.idOrganizador === user.idUsuario || p.idOngAsignada === user.idUsuario
      );

      this.stats.ayudasEnCurso = misPropuestas.filter(p => p.estadoPropuesta !== 'completada' && p.estadoPropuesta !== 'cancelada').length;
      this.stats.ayudasCompletadas = misPropuestas.filter(p => p.estadoPropuesta === 'completada').length;

    } catch (error) {
    }
  }

  async cargarUrgentes() {
    this.cargando = true;
    try {
      const todas = await firstValueFrom(this.propuestaService.getAll());
      
      const hoy = new Date();
      const enSieteDias = new Date();
      enSieteDias.setDate(hoy.getDate() + 7);

      this.propuestasUrgentes = todas.filter(p => {
        const fechaFin = new Date(p.fechaFin);
        return p.estadoPropuesta === 'publicada' && 
               fechaFin >= hoy && 
               fechaFin <= enSieteDias;
      });

    } catch (error) {
    } finally {
      this.cargando = false;
    }
  }

  getDiasRestantes(fechaFin: Date | string | undefined): number {
    if (!fechaFin) return 0;
    const fin = new Date(fechaFin).getTime();
    const hoy = new Date().getTime();
    const diff = Math.ceil((fin - hoy) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }

  async irADetalle(propuesta: PropuestaModel) {
    const modal = await this.modalCtrl.create({
      component: PropuestaDetalleComponent,
      componentProps: { propuesta } 
    });
    
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.cargarUrgentes();
      if (this.isLoggedIn()) this.cargarEstadisticas(); 
    }
  }

  navigateTo(route: string): void {
    
    switch(route) {
      case '/crear-propuesta':
        if (!this.canCreateProposal) { 
          this.showPermissionAlert('crear');
          return;
        }
        this.router.navigate([route]);
        break;

      case '/lista-propuestas/explore':
        this.router.navigate(['/lista-propuestas'], { queryParams: { mode: 'explore' } });
        break;

      case '/lista-propuestas/mine':
        this.router.navigate(['/lista-propuestas'], { queryParams: { mode: 'mine' } });
        break;
        
      case '/lista-propuestas':
        if (this.canViewMyProposals) {
          this.router.navigate(['/lista-propuestas'], { queryParams: { mode: 'mine' } });
        } else {
          this.router.navigate(['/lista-propuestas'], { queryParams: { mode: 'explore' } });
        }
        break;

      case '/lista-ongs':
        if (!this.canViewOngs) {
          this.showPermissionAlert('ongs' as any); 
          return;
        }
        this.router.navigate([route]).catch(err => {
        });
        break;
        
       case '/estadisticas':
        if (!this.isLoggedIn()) {
          this.showPermissionAlert('perfil');
          return;
        }
        this.router.navigate(['/statistics']);
        break;
      case '/account':
        if (!this.isLoggedIn()) { 
          this.showPermissionAlert('perfil');
          this.router.navigate(['/login']);
          return; 
        }
        this.router.navigate([route]);
        break;

      default:
        this.router.navigate([route]);
        break;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get canCreateProposal(): boolean {
    return this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ADMIN');
  }

  get canViewMyProposals(): boolean {
    return this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ONG') || this.auth.hasRole('ADMIN');
  }

  get canViewOngs(): boolean {
    return true; 
  }

  private async showPermissionAlert(option: 'crear' | 'mis' | 'perfil'): Promise<void> {
    const roles = this.currentUser()?.roles?.join(', ') || 'Invitado';
    let message = '';
    
    switch(option) {
      case 'crear': message = `❌ Solo **ORGANIZADORES** y **ADMINS** pueden crear propuestas.`; break;
      case 'mis': message = `❌ Solo **ORGANIZADORES**, **ONGs** y **ADMINS** tienen panel propio.`; break;
      case 'perfil': message = `❌ Debes iniciar sesión para ver tu perfil.`; break;
    }
    
    const alert = await this.alertCtrl.create({
      header: 'Acceso restringido',
      message: `${message}\n\nTu rol actual: **${roles}**`,
      buttons: ['OK']
    });
    await alert.present();
  }
}
