import { Component, inject, effect } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router'; 
import { Auth } from './services/auth';
import { UsuarioModel } from './models/usuario.model';

type AuthMode = 'none' | 'login' | 'register';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  
  // INYECCIÓN
  private auth = inject(Auth);
  private menuCtrl = inject(MenuController);
  private router = inject(Router);

  // ESTADO
  authMode: AuthMode = 'none';
  currentUser: UsuarioModel | null = null;
  isLoggedIn = false;

  constructor() {
    // REACTIVIDAD AUTOMÁTICA (Angular Signals)
    // Se ejecuta cada vez que cambia el usuario en Auth
    effect(() => {
      const user = this.auth.currentUser();
      this.currentUser = user;
      this.isLoggedIn = !!user;
      
      console.log('AppComponent: Estado sesión actualizado:', user ? user.nombre : 'Sin usuario');
      
      if (!user) {
        this.menuCtrl.close();
        this.authMode = 'login';
      } else {
        this.authMode = 'none'; // Si hay usuario, ocultamos modales de login
      }
    });
  }

  showLogin() { 
    this.router.navigate(['/login']);
  }

  showRegister() { 
    this.router.navigate(['/register']);
  }

  closeForm() { 
    this.authMode = 'none'; 
  }

  logout() {
    console.log('🚪 Cerrando sesión...');
    this.auth.logout(); 
  }
}
