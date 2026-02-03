import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

type AuthMode = 'none' | 'login' | 'register';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  authMode: AuthMode = 'none';
  selectedRole: string = '';
  isLoggedIn = false;
  currentUser: any = null;
  loginForm = { email: '', password: '' };
  registerForm = { };

  constructor(private menuCtrl: MenuController) {
    this.simularLogin();
  }

  simularLogin() {
    setTimeout(() => {
      this.isLoggedIn = true;
      this.currentUser = {
        idUsuario: 2,
        displayName: 'Pedro Organizador',
        email: 'pedro@test.com',
        roles: ['ORGANIZADOR'] // ['ADMIN'], ['ONG'], o []
      };
      console.log('Usuario simulado:', this.currentUser);
    }, 500);
  }

  showLogin() {
    this.authMode = 'login';
    this.selectedRole = '';
  }

  showRegister() {
    this.authMode = 'register';
    this.selectedRole = '';
  }

  closeForm() {
    this.authMode = 'none';
    this.resetForms();
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    this.menuCtrl.close();
    console.log('Logout realizado');
  }

  private resetForms() {
    this.loginForm = { email: '', password: '' };
    this.registerForm = {  };
  }
}
