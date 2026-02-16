import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { PerfilOng } from '../../services/perfil-ong'; // Solo si necesitas cargar estado extra

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
  standalone: false
})
export class SidemenuComponent implements OnInit, OnChanges {

  private perfilOngService = inject(PerfilOng);
  private toastCtrl = inject(ToastController);

  @Input() currentUser: any = null;
  @Input() isLoggedIn = false;
  @Output() onLogout = new EventEmitter<void>();

  isAdmin = false;
  isOrganizador = false;
  isONG = false;
  isUsuarioNormal = false;
  
  currentUserRole = '';
  ongEstadoVerificacion = '';
  countOngsPendientes = 0;

  constructor() { }

  ngOnInit() {
    this.actualizarMenu();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentUser'] || changes['isLoggedIn']) {
      this.actualizarMenu();
    }
  }

  private actualizarMenu() {
    this.detectarRoles();
    this.cargarContadores();
  }

  private detectarRoles() {
    this.resetRoles();

    if (!this.currentUser || !this.isLoggedIn) {
      this.isUsuarioNormal = true;
      this.currentUserRole = 'Invitado';
      return;
    }

    const roles = (this.currentUser.roles || []).map((r: string) => r.toUpperCase());

    if (roles.includes('ADMIN')) {
      this.isAdmin = true;
      this.currentUserRole = 'Administrador';
    }
    
    if (roles.includes('ORGANIZADOR')) {
      this.isOrganizador = true;
      this.currentUserRole = this.isAdmin ? 'Admin/Organizador' : 'Organizador';
    }
    
    if (roles.includes('ONG')) {
      this.isONG = true;
      this.currentUserRole = 'ONG';
      this.cargarEstadoONG();
    }

    if (!this.isAdmin && !this.isOrganizador && !this.isONG) {
      this.isUsuarioNormal = true;
      this.currentUserRole = 'Usuario';
    }
  }

  private resetRoles() {
    this.isAdmin = false;
    this.isOrganizador = false;
    this.isONG = false;
    this.isUsuarioNormal = false;
    this.currentUserRole = '';
    this.ongEstadoVerificacion = '';
  }

  private cargarEstadoONG() {
    if (!this.currentUser?.idUsuario) return;
    
    this.perfilOngService.getById(this.currentUser.idUsuario).subscribe({
      next: (ong) => this.ongEstadoVerificacion = ong?.estadoVerificacion || 'pendiente',
      error: () => this.ongEstadoVerificacion = 'pendiente'
    });
  }

  private cargarContadores() {
    if (this.isAdmin) {
      this.perfilOngService.getPendientes().subscribe({
        next: (ongs) => this.countOngsPendientes = ongs.length,
        error: () => this.countOngsPendientes = 0
      });
    }
  }

  async mostrarMensajePendiente(seccion: string) {
    const toast = await this.toastCtrl.create({
      message: `La sección "${seccion}" estará disponible próximamente`,
      duration: 2000,
      color: 'warning',
      position: 'bottom',
      icon: 'construct-outline'
    });
    toast.present();
  }
}
