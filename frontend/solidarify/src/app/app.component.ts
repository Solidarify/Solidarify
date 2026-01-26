import { Component } from '@angular/core';
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

  constructor() {}

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
  }

  private resetForms() {
    this.loginForm = { email: '', password: '' };
    this.registerForm = {  };
  }

}
