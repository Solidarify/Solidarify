import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'ORGANIZADOR' | 'ONG';
}

export interface LoginResponse {
  success: boolean;
  user?: User;  
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  // Estado observable
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  currentUser$ = new BehaviorSubject<User | null>(null);

  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  // SIMPLE: Fake → Real con 1 cambio
  login(email: string, password: string): Promise<User | null> {
    // FAKE (actual)
    const fakeUser: User = { id: 1, nombre: 'Pedro ONG', email, role: 'ONG' };
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'ong@test.com') {
          this.isLoggedIn$.next(true);
          this.currentUser$.next(fakeUser);
          resolve(fakeUser);
        } else {
          resolve(null);
        }
      }, 2000);
    });

    // Esto lo usaremos mas adelante cuando tengamos el backend hecho
    // return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
    //   .toPromise().then(res => {
    //     if (res.success && res.user) {
    //       this.isLoggedIn$.next(true);
    //       this.currentUser$.next(res.user);
    //       return res.user;
    //     }
    //     return null;
    //   });
  }

  logout(): void {
    this.isLoggedIn$.next(false);
    this.currentUser$.next(null);
    // Real: this.http.post(`${this.apiUrl}/logout`, {});
  }

  getCurrentUser(): User | null {
    return this.currentUser$.value;
  }
}
