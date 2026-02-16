import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, delay, map } from 'rxjs/operators';
import { UsuarioModel } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly USE_MOCK = true; 
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  currentUser = signal<UsuarioModel | null>(null);
  isAuthenticated = signal<boolean>(false);

  // MOCK DATA
  private mockUsers = [
    { email: 'admin@donapp.com', password: '123', role: 'ADMIN', name: 'Admin General', id: 1 },
    { email: 'org@donapp.com', password: '123', role: 'ORGANIZADOR', name: 'Organizador Norte', id: 2 },
    { email: 'ong@donapp.com', password: '123', role: 'ONG', name: 'ONG Manos Verdes', id: 5 },
    { email: 'user@donapp.com', password: '123', role: 'USUARIO', name: 'Juan Usuario', id: 10 }
  ];

  constructor() {
    this.checkSession();
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    if (this.USE_MOCK) {
      return of(null).pipe(
        delay(1000),
        map(() => {
          const userFound = this.mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
          
          if (userFound) {
            const userModel = new UsuarioModel({
              idUsuario: userFound.id,
              nombre: userFound.name,
              email: userFound.email,
              roles: [userFound.role], 
              activo: true
            });
            return { token: 'fake-jwt-' + Date.now(), user: userModel };
          } else {
            throw new Error('Credenciales incorrectas');
          }
        }),
        tap(response => this.saveSession(response.token, response.user))
      );
    }

    // API REAL
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.saveSession(response.token, new UsuarioModel(response.user)))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private saveSession(token: string, user: UsuarioModel) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private checkSession() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (token && userStr) {
      try {
        const user = new UsuarioModel(JSON.parse(userStr));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles?.includes(role) || false;
  }
}
