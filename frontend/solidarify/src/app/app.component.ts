import { Component, inject, effect } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router'; 
import { Auth } from '../app/services/auth'; 
import { UsuarioModel } from './models/usuario.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  
  private auth = inject(Auth);
  private menuCtrl = inject(MenuController);
  public router = inject(Router);

  currentUser: UsuarioModel | null = null;
  isLoggedIn = false;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      this.currentUser = user;
      this.isLoggedIn = !!user;
      
      if (!user) {
        this.menuCtrl.close();
      }
    });
  }

  showLogin() { 
    this.router.navigate(['/login']);
  }

  showRegister() { 
    this.router.navigate(['/register']);
  }

  logout() {
    this.auth.logout(); 
  }
}
