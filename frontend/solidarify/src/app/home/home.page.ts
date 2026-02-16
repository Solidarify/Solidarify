import { Component, OnInit, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { PropuestaDetalleComponent } from '../modals/propuesta-detalle/propuesta-detalle.component';
import { PropuestaModel } from '../models/propuesta.model';
import { Auth } from '../services/auth'; 
import { UsuarioModel } from '../models/usuario.model';

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

  currentUser = this.auth.currentUser; 
  isLoggedIn = this.auth.isAuthenticated; 

  constructor() {
    
  }

  ngOnInit() {
    console.log('🏠 HomePage iniciada');
  }
  
  get canCreateProposal(): boolean {
    return this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ADMIN');
  }

  get canViewMyProposals(): boolean {
    // Mis propuestas: Organizadores y ONGs (para ver sus asignaciones) y Admin
    return this.auth.hasRole('ORGANIZADOR') || this.auth.hasRole('ONG') || this.auth.hasRole('ADMIN');
  }

  get canViewOngs(): boolean {
    return true; 
  }


  logout() {
    console.log('🚪 Cerrando sesión...');
    this.auth.logout();
    this.router.navigate(['/login']);
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


get canExplore(): boolean {
  return true; 
}

async irADetalle(id: number) {
    
    // 1. Simular datos según el ID clicado
    const datosSimulados = new PropuestaModel({
      idPropuesta: id,
      idOrganizador: 99,
      titulo: id === 1 ? 'Recogida de Alimentos' : 'Abrigos para invierno',
      descripcion: 'Esta es una propuesta urgente que has seleccionado desde el Home. ¡Ayuda ahora!',
      lugar: id === 1 ? 'Madrid Centro' : 'Zona Norte',
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 días después
      estadoPropuesta: 'publicada',
      idTipoBien: id === 1 ? 1 : 3, // 1: Alimentos, 3: Ropa
      imagen: id === 1 
        ? 'https://placehold.co/600x400/orange/white?text=Comida' 
        : 'https://placehold.co/600x400/blue/white?text=Ropa'
    });

    const modal = await this.modalCtrl.create({
      component: PropuestaDetalleComponent,
      componentProps: {
        propuesta: datosSimulados
      }
    });

    await modal.present();
  }

}
