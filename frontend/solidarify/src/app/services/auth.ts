import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { UsuarioModel } from '../models/usuario.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = environment.apiUrl ? `${environment.apiUrl}/auth` : 'http://localhost:3000/api/auth';
  
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'currentUser';

  currentUser = signal<UsuarioModel | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkSession();
  }

  // LOGIN REAL
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        const user = new UsuarioModel(response.usuario);
        this.saveSession(response.token, user);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, userData);
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
      console.log('Guardando sesión. Roles recibidos:', user.roles); 

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

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles?.includes(role) || false;
  }

 
  public updateSessionData(updatedUser: Partial<UsuarioModel>) {
    const currentUser = this.currentUser();
    if (currentUser) {
      const mergedUser = new UsuarioModel({ ...currentUser, ...updatedUser });
      
      this.currentUser.set(mergedUser);
      
      localStorage.setItem(this.USER_KEY, JSON.stringify(mergedUser));
      
      console.log('Sesión local actualizada con los nuevos datos.');
    }
  }

}
