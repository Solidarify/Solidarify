import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Usuario } from '../../services/usuario';  // Ajusta la ruta
import { PerfilOng } from '../../services/perfil-ong';  // Ajusta la ruta
import { Organizador } from '../../services/organizador';  // Ajusta la ruta
@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent  implements OnInit, OnChanges {

  @Input() currentUser: any = null;
  @Input() isLoggedIn = false;

  @Output() onLogout = new EventEmitter<void>();

  //Datos del menú
  userRole = '';
  currentUserRole = '';
  ongEstadoVerificacion = '';
  countOngsPendientes = 0;

  constructor( private usuarioService: Usuario,
    private perfilOngService: PerfilOng,
    private organizadorService: Organizador) { }

  ngOnInit() {
    this.detectarRol();
    this.cargarContadores();
  }

  ngOnChanges(changes: SimpleChanges) {
    //Detectar cambios en usuario logueado
    if (changes['currentUser'] && this.currentUser) {
      this.detectarRol();
    }
  }

  //Detectar rol de usuario (basado en datos fake)
  detectarRol() {
    if (!this.currentUser) {
      this.userRole = '';
      return;
    }

    // Admin (ID 1)
    if (this.currentUser.idUsuario === 1) {
      this.userRole = 'admin';
      this.currentUserRole = 'Administrador';
    } 
    // Organizador (ID 2)
    else if (this.currentUser.idUsuario === 2) {
      this.userRole = 'organizador';
      this.currentUserRole = 'Organizador';
    } 
    // ONG (ID 5)
    else if (this.currentUser.idUsuario === 5) {
      this.userRole = 'ong';
      this.currentUserRole = 'ONG';
      this.ongEstadoVerificacion = 'pendiente'; // Por defecto
    } 
    // Usuario normal
    else {
      this.userRole = 'usuario';
      this.currentUserRole = 'Usuario';
    }

  }

  //Cargar contadores (solo admin)
  cargarContadores() {
    if (this.userRole === 'admin') {
      this.perfilOngService.getPendientes().subscribe(ongs => {
        this.countOngsPendientes = ongs.length;
      });
    }
  }
}
