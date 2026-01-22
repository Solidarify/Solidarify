import { Component } from '@angular/core';
import { Router } from '@angular/router';

type AuthMode = 'none' | 'login' | 'register';
type UserRole = 'ONG' | 'ORGANIZADOR' | '';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  authMode: AuthMode = 'none';
  selectedRole: UserRole = '';
  isLoggedIn = false;
  currentUser: { role: UserRole; nombre: string } | null = null;

  loginForm = { 
    email: '',      // Usuario.Email VARCHAR(150)
    password: ''    // Usuario.Password_Hash VARCHAR(255)
  };

  registerForm = {
    //Usuario
    nombre: '',           // Usuario.Nombre VARCHAR(100)
    email: '',            // Usuario.Email VARCHAR(150) UNIQUE
    password: '',         // Usuario.Password_Hash VARCHAR(255)
    telefono: '',         // Usuario.Telefono VARCHAR(20)

    //Organizador
    orgNombre: '',        // Organizador.Nombre VARCHAR(150)
    orgCif: '',           // Organizador.CIF VARCHAR(20) UNIQUE
    orgEmail: '',         // Organizador.Email VARCHAR(150)
    orgCargo: '',         // Organizador.Cargo VARCHAR(100)
    orgZona: '',          // Organizador.Zona_Responsable VARCHAR(100)

    //PerfilONG
    ongNombreLegal: '',   // PerfilONG.Nombre_Legal VARCHAR(150)
    ongCif: '',           // PerfilONG.CIF VARCHAR(20) UNIQUE
    ongWeb: '',           // PerfilONG.Web VARCHAR(200)
  };

  constructor(private router: Router) { }

  navigateTo(route: string) {
    this.router.navigate([route]);
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
    this.selectedRole = '';
    this.resetForms();
  }

  onRoleChange(ev: any) {
    this.selectedRole = ev.detail.value;
  }

  submitLogin() {
    if (!this.selectedRole || !this.loginForm.email || !this.loginForm.password) return;

    console.log('LOGIN BD →', {
      table: 'Usuario',
      Email: this.loginForm.email,
      Rol: this.selectedRole // Id_Rol: 2=ORGANIZADOR, 3=ONG
    });

    this.isLoggedIn = true;

    this.currentUser = {
      role: this.selectedRole,
      nombre: this.loginForm.email.split('@')[0]
    };

    this.closeForm();
  }

  submitRegister() {
    if (!this.selectedRole || !this.registerForm.nombre || !this.registerForm.email) return;

    const usuarioData = {
      table: 'Usuario',
      Nombre: this.registerForm.nombre,
      Email: this.registerForm.email,
      Password_Hash: 'hash_' + this.registerForm.password,
      Telefono: this.registerForm.telefono || null
    };

    let perfilData = null;

    if (this.selectedRole === 'ORGANIZADOR') {
      perfilData = {
        table: 'Organizador',
        Nombre: this.registerForm.orgNombre,
        CIF: this.registerForm.orgCif,
        Email: this.registerForm.orgEmail,
        Cargo: this.registerForm.orgCargo,
        Zona_Responsable: this.registerForm.orgZona
      };

    } else if (this.selectedRole === 'ONG') {
      perfilData = {
        table: 'PerfilONG',
        Nombre_Legal: this.registerForm.ongNombreLegal,
        CIF: this.registerForm.ongCif,
        Web: this.registerForm.ongWeb
      };
    }

    console.log('REGISTER BD →', { usuarioData, perfilData });

    this.isLoggedIn = true;

    this.currentUser = {
      role: this.selectedRole,
      nombre: this.registerForm.nombre
    };
    
    this.closeForm();
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  private resetForms() {
    this.loginForm = { email: '', password: '' };
    this.registerForm = {
      nombre: '', email: '', password: '', telefono: '',
      orgNombre: '', orgCif: '', orgEmail: '', orgCargo: '', orgZona: '',
      ongNombreLegal: '', ongCif: '', ongWeb: ''
    };
  }

}
