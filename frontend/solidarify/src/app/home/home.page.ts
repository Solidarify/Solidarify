import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Usuario } from '../services/usuario';
import { UsuarioModel } from '../models/usuario.model';
import { Subscription } from 'rxjs';

export type UserRole = 'ORGANIZADOR' | 'ONG' | 'Usuario' | 'ADMIN';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {
  currentUser: UsuarioModel | null = null;
  isLoggedIn = false;
  userRoles: string[] = [];

  private userSub?: Subscription;

  constructor(    
    private router: Router,
    private alertCtrl: AlertController,
    private usuarioService: Usuario
  ) {}

  ngOnInit() {
    console.log('🏠 HomePage ngOnInit()');
    
    // ✅ SUSCRIPCIÓN con unsubscribe para evitar memory leaks
    this.userSub = this.usuarioService.currentUser$.subscribe(user => {
      console.log('🔄 Usuario recibido:', user);
      this.currentUser = user;
      this.isLoggedIn = !!user;
      
      // ✅ ACTUALIZAR ROLES cada vez que cambie el usuario
      this.userRoles = this.roles;
      
      console.log('🔍 Estado actualizado:', {
        nombre: user?.displayName,
        roles: this.userRoles,
        isLoggedIn: this.isLoggedIn,
        permissions: {
          create: this.canCreateProposal(),
          myProposals: this.canViewMyProposals(),
          explore: this.canExplore()
        }
      });
    });

    // ✅ Verificar usuario inicial desde localStorage
    const initialUser = this.usuarioService.getCurrentUser();
    if (initialUser) {
      console.log('🏠 Usuario inicial desde localStorage:', initialUser.displayName);
    }
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  // ✅ Getter que actualiza userRoles
  private get roles(): string[] {
    if (!this.currentUser) return [];
    
    // Prioridad: roles del modelo (ya definido en usuariosFake)
    if (this.currentUser.roles?.length) {
      return this.currentUser.roles;
    }
    
    // Fallback por email/nombre
    if (this.currentUser.email?.includes('@admin')) return ['ADMIN'];
    if (this.currentUser.nombre?.includes('Organizador') || this.currentUser.nombre?.includes('Norte')) return ['ORGANIZADOR'];
    if (this.currentUser.nombre?.includes('ONG')) return ['ONG'];
    
    return ['Usuario'];
  }

  // ✅ MÉTODO logout que navega
  logout() {
    console.log('🚪 Logout desde HomePage');
    this.usuarioService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  canCreateProposal(): boolean {
    return this.roles.includes('ORGANIZADOR') || this.roles.includes('ADMIN');
  }

  canViewMyProposals(): boolean {
    return this.roles.includes('ORGANIZADOR') || this.roles.includes('ONG') || this.roles.includes('ADMIN');
  }

  canViewOngs(): boolean {
    return true;
  }

  canExplore(): boolean {
    return true;
  }

  // ✅ navigateTo simplificado
  navigateTo(route: string): void {
    console.log('🚀 navigateTo:', route);
    
    switch(route) {
      case '/crear-propuesta':
        if (!this.canCreateProposal()) {
          this.showPermissionAlert('crear');
          return;
        }
        break;
      case '/lista-propuestas':
        if (!this.canViewMyProposals()) {
          this.showPermissionAlert('mis');
          return;
        }
        break;
      case '/account':
        if (!this.isLoggedIn) {
          this.showPermissionAlert('perfil');
          return; 
        }
        break;
      case '/lista-ongs':
        break;
    }
    
    this.router.navigate([route]);
  }

  // ✅ Alert personalizada
  private async showPermissionAlert(option: 'crear' | 'mis' | 'perfil'): Promise <void> {
    const role = this.userRoles[0] || 'no logueado';
    let message = '';
    
    switch(option) {
      case 'crear': message = `❌ Solo **ORGANIZADOR** y **ADMIN**`; break;
      case 'mis': message = `❌ Solo **ORGANIZADOR**, **ONG** y **ADMIN**`; break;
      case 'perfil': message = `❌ Debes iniciar sesión`; break;
    }
    
    const alert = await this.alertCtrl.create({
      header: 'Acceso restringido',
      message: `${message}\n\nTu rol: **${role}**`,
      buttons: ['OK']
    });
    await alert.present();
  }

  // ✅ Para los botones info (usa roles actualizados)
  async showInfo(option: 'crear' | 'mis' | 'explorar' | 'perfil' | 'ongs') {
    let header = '', message = '';
    const role = this.userRoles[0] || 'no logueado';

    switch (option) {
      case 'crear':
        header = 'Crear propuesta';
        message = this.canCreateProposal()
          ? `✅ Como **${role}**, puedes crear propuestas.`
          : `❌ Solo **ORGANIZADOR** y **ADMIN**. Tu rol: **${role}**`;
        break;
      case 'mis':
        header = 'Mis propuestas';
        message = this.canViewMyProposals()
          ? `📋 Tus propuestas como **${role}**.`
          : `❌ Solo **ORGANIZADOR**, **ONG** y **ADMIN**. Tu rol: **${role}**`;
        break;
      case 'explorar':
        header = 'Explorar';
        message = `🔍 Lista pública de propuestas.`;
        break;
      case 'perfil':
        header = 'Mi perfil';
        message = this.isLoggedIn 
          ? `👤 Gestiona tu cuenta **${role}**.`
          : `❌ Inicia sesión primero`;
        break;
      case 'ongs':
        header = 'Lista de ONGs';
        message = `📋 Directorio completo de ONGs ${this.roles.includes('ADMIN') ? '(ADMIN puede editar)' : ''}`;
        break;
    }

    const alert = await this.alertCtrl.create({
      header,
      message: message.replace(/<strong>/g, '').replace(/<\/strong>/g, ' **'),
      buttons: ['Entendido']
    });
    await alert.present();
  }
}
