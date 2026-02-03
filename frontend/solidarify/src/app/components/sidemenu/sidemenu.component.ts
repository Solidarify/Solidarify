import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Usuario } from '../../services/usuario';
import { PerfilOng } from '../../services/perfil-ong';
import { Organizador } from '../../services/organizador';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
  standalone: false
})
export class SidemenuComponent implements OnInit, OnChanges {

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

  constructor(
    private usuarioService: Usuario,
    private perfilOngService: PerfilOng,
    private organizadorService: Organizador,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    console.log('🔧 SidemenuComponent inicializado');
    this.actualizarMenu();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🔄 ngOnChanges detectado:', changes);
    if (changes['currentUser'] || changes['isLoggedIn']) {
      this.actualizarMenu();
    }
  }

  actualizarMenu() {
    console.log('📋 Actualizando menú...');
    console.log('  - currentUser:', this.currentUser);
    console.log('  - isLoggedIn:', this.isLoggedIn);
    
    this.detectarRoles();
    this.cargarContadores();
  }

  detectarRoles() {
    this.isAdmin = false;
    this.isOrganizador = false;
    this.isONG = false;
    this.isUsuarioNormal = false;

    if (!this.currentUser) {
      console.log('⚠️ No hay currentUser, modo invitado');
      this.isUsuarioNormal = true;
      this.currentUserRole = 'Invitado';
      return;
    }

    if (!this.currentUser.roles || this.currentUser.roles.length === 0) {
      console.log('⚠️ Usuario sin roles específicos');
      this.isUsuarioNormal = true;
      this.currentUserRole = 'Usuario';
      return;
    }

    const roles = this.currentUser.roles.map((r: string) => r.toUpperCase());
    console.log('🎭 Roles detectados:', roles);

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

    console.log('✅ Roles finales:', {
      isAdmin: this.isAdmin,
      isOrganizador: this.isOrganizador,
      isONG: this.isONG,
      isUsuarioNormal: this.isUsuarioNormal,
      currentUserRole: this.currentUserRole
    });
  }

  cargarEstadoONG() {
    if (!this.currentUser?.idUsuario) return;
    
    this.perfilOngService.getById(this.currentUser.idUsuario).subscribe(
      (ong: any) => {
        this.ongEstadoVerificacion = ong?.estadoVerificacion || 'pendiente';
      },
      error => {
        console.error('Error al cargar perfil ONG:', error);
        this.ongEstadoVerificacion = 'pendiente';
      }
    );
  }

  cargarContadores() {
    if (this.isAdmin) {
      this.perfilOngService.getPendientes().subscribe(
        ongs => {
          this.countOngsPendientes = ongs.length;
        },
        error => {
          console.error('Error al cargar ONGs pendientes:', error);
          this.countOngsPendientes = 0;
        }
      );
    }
  }

  async mostrarMensajePendiente(seccion: string) {
    const toast = await this.toastCtrl.create({
      message: `La sección "${seccion}" estará disponible próximamente`,
      duration: 2500,
      color: 'warning',
      position: 'bottom',
      icon: 'construct-outline'
    });
    toast.present();
  }
}
