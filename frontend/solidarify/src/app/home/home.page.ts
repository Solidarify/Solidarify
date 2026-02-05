import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Auth, User } from '../services/auth';
import { Usuario } from '../services/usuario';

export type UserRole = 'ORGANIZADOR' | 'ONG' | 'Usuario' | 'ADMIN';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

    currentUser: any = null;
    isLoggedIn = false;
    userRoles: string[] = [];

  constructor(    
    private router: Router,
    private alertCtrl: AlertController,
    private usuarioService: Usuario
  ) {}

  ngOnInit() {
    console.log('🧑‍💻 HomePage cargando usuario...');
    this.currentUser = this.usuarioService.getCurrentUser();
    this.isLoggedIn = !!this.currentUser;
    
    // ✅ MAPEAR ROLES según tu lógica (como hace SideMenu)
    this.userRoles = this.detectarRoles(this.currentUser);
    console.log('✅ Usuario:', this.currentUser);
    console.log('✅ Roles detectados:', this.userRoles);
    console.log('✅ Permisos:', {
      create: this.canCreateProposal(),
      myProposals: this.canViewMyProposals(),
      explore: this.canExplore()
    });
  }

  private detectarRoles(user: any): string[] {
    const roles: string[] = [];
    
    if (!user) return roles;
    
    if (user.roles && user.roles.includes('ORGANIZADOR')) {
      roles.push('ORGANIZADOR');
    }
    if (user.roles && user.roles.includes('ONG')) {
      roles.push('ONG');
    }
    if (user.roles && user.roles.includes('ADMIN')) {
      roles.push('ADMIN');
    }
    
    // Fallback: por email/nombre como en tu sistema
    if (!roles.length) {
      if (user.email?.includes('@admin')) roles.push('ADMIN');
      else if (user.nombre?.includes('Organizador')) roles.push('ORGANIZADOR');
      else roles.push('Usuario');
    }
    
    return roles;
  }

  canCreateProposal(): boolean {
    return this.userRoles.includes('ORGANIZADOR');
  }

  canViewMyProposals(): boolean {
    return this.userRoles.includes('ORGANIZADOR') || this.userRoles.includes('ONG');
  }

  canExplore(): boolean {
    return !!this.currentUser;
  }

  navigateTo(route: string, allowed: boolean) {
    console.log('🚀 navigateTo:', route, 'Usuario:', this.currentUser);

    if (route === '/crear-propuesta' && !this.canCreateProposal()) return;
    if (route === '/lista-propuestas' && !this.canViewMyProposals()) return;
    if (route === '/explorar' && !this.canExplore()) return;
    if (route === '/account' && !this.isLoggedIn) return;
    
    // Si llega aquí → tiene permisos → navega
    this.router.navigate([route]);
  }

  async showInfo(option: 'crear' | 'mis' | 'explorar' | 'perfil') {
    let header = '', message = '';
    const role = this.userRoles[0] || 'no logueado';

    switch (option) {
      case 'crear':
        header = 'Crear propuesta';
        message = this.canCreateProposal() 
          ? `✅ Como **${role}**, puedes crear propuestas.`
          : `❌ Solo **ORGANIZADOR**.`;
        break;

      case 'mis':
        header = 'Mis propuestas';
        message = this.canViewMyProposals()
          ? `📋 Tus propuestas como **${role}**.`
          : `ℹ️ Solo **ORGANIZADOR** y **ONG**.`;
        break;

      case 'explorar':
        header = 'Explorar';
        message = `🔍 Lista pública de propuestas.`;
        break;

      case 'perfil':
        header = 'Mi perfil';
        message = `👤 Gestiona tu cuenta **${role}**.`;
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
