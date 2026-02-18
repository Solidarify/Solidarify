import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

// Servicios y Modelos
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
  
  // INYECCIONES
  private modalCtrl = inject(ModalController);
  private auth = inject(Auth);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private propuestaService = inject(Propuesta);

  // ESTADO DE USUARIO
  currentUser = this.auth.currentUser; 
  isLoggedIn = this.auth.isAuthenticated; 

  // ESTADO DE DATOS
  propuestasUrgentes: PropuestaModel[] = [];
  cargando = true;

  constructor() {}

  async ngOnInit() {
    console.log('🏠 HomePage iniciada');
    await this.cargarUrgentes();
  }

  // --- LÓGICA DE CARGA DE DATOS ---

  async cargarUrgentes() {
    this.cargando = true;
    try {
      // 1. Obtenemos todas las propuestas
      const todas = await firstValueFrom(this.propuestaService.getAll());
      
      const hoy = new Date();
      const enSieteDias = new Date();
      enSieteDias.setDate(hoy.getDate() + 7);

      // 2. Filtramos: Activas Y que caduquen en los próximos 7 días
      this.propuestasUrgentes = todas.filter(p => {
        // Aseguramos que fechaFin sea objeto Date
        const fechaFin = new Date(p.fechaFin);
        return p.estadoPropuesta === 'publicada' && 
               fechaFin >= hoy && 
               fechaFin <= enSieteDias;
      });

    } catch (error) {
      console.error('Error cargando home:', error);
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

  // --- NAVEGACIÓN Y MODALES ---

  async irADetalle(propuesta: PropuestaModel) {
    const modal = await this.modalCtrl.create({
      component: PropuestaDetalleComponent,
      componentProps: { propuesta } // Pasamos el objeto real
    });
    
    await modal.present();
    
    // Si al cerrar el modal nos dicen que recarguemos (ej: se editó), recargamos
    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.cargarUrgentes();
    }
  }

  navigateTo(route: string): void {
    console.log('🚀 Navegando a:', route);
    
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
    console.log('🚪 Cerrando sesión...');
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // --- PERMISOS (GETTERS) ---

  get canCreateProposal(): boolean {
    return this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ADMIN');
  }

  get canViewMyProposals(): boolean {
    return this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ONG') || this.auth.hasRole('ADMIN');
  }

  get canViewOngs(): boolean {
    return true; 
  }

  get canExplore(): boolean {
    return true; 
  }

  // --- ALERTAS E INFO ---

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

  async showInfo(option: 'crear' | 'mis' | 'explorar' | 'perfil' | 'ongs') {
    let header = '', message = '';
    const roles = this.currentUser()?.roles?.join(', ') || 'Invitado';

    switch (option) {
      case 'crear':
        header = 'Crear propuesta';
        message = this.canCreateProposal
          ? `✅ Tienes permiso para crear campañas.`
          : `❌ Requiere rol **ORGANIZADOR** o **ADMIN**.`;
        break;
      case 'mis':
        header = 'Mis propuestas';
        message = this.canViewMyProposals
          ? `📋 Gestiona tus propuestas creadas o asignadas.`
          : `❌ Panel de gestión para **ORGANIZADORES** y **ONGs**.`;
        break;
      case 'explorar':
        header = 'Explorar';
        message = `🔍 Busca iniciativas públicas para colaborar.`;
        break;
      case 'perfil':
        header = 'Mi perfil';
        message = this.isLoggedIn()
          ? `👤 Configura tu cuenta de **${roles}**.`
          : `❌ Inicia sesión para acceder.`;
        break;
      case 'ongs':
        header = 'Directorio de ONGs';
        message = `📋 Lista de organizaciones verificadas.`;
        break;
    }

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Entendido']
    });
    await alert.present();
  }
}
