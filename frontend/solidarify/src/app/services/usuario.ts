import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { UsuarioModel } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class Usuario { 
  
  private http = inject(HttpClient);
  
  // CONFIG
  private readonly USE_MOCK = true;
  private readonly API_URL = 'http://localhost:3000/api/usuarios';

  // DATA FAKE
  private usuariosFake: UsuarioModel[] = [
    UsuarioModel.fromApi({ Id_Usuario: 1, Nombre: 'Admin General', Email: 'admin@donapp.com', roles: ['ADMIN'], Activo: 1 }),
    UsuarioModel.fromApi({ Id_Usuario: 2, Nombre: 'Organizador Norte', Email: 'org@donapp.com', roles: ['ORGANIZADOR'], Activo: 1 }),
    UsuarioModel.fromApi({ Id_Usuario: 5, Nombre: 'ONG Manos Verdes', Email: 'ong@donapp.com', roles: ['ONG'], Activo: 1 }),
    UsuarioModel.fromApi({ Id_Usuario: 10, Nombre: 'Juan Usuario', Email: 'user@donapp.com', roles: ['USUARIO'], Activo: 1 })
  ];

  constructor() {}

  getAll(): Observable<UsuarioModel[]> {
    if (this.USE_MOCK) return of([...this.usuariosFake]).pipe(delay(500));
    return this.http.get<any[]>(this.API_URL).pipe(map(items => items.map(i => UsuarioModel.fromApi(i))));
  }

  getById(id: number): Observable<UsuarioModel | null> {
    if (this.USE_MOCK) return of(this.usuariosFake.find(u => u.idUsuario === id) || null).pipe(delay(300));
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(map(i => UsuarioModel.fromApi(i)));
  }

  create(data: Partial<UsuarioModel>): Observable<UsuarioModel> {
    if (this.USE_MOCK) {
      const nuevo = new UsuarioModel({ ...data, idUsuario: Date.now(), activo: true });
      this.usuariosFake.unshift(nuevo);
      return of(nuevo).pipe(delay(800));
    }
    return this.http.post<any>(this.API_URL, data).pipe(map(i => UsuarioModel.fromApi(i)));
  }

  update(id: number, data: Partial<UsuarioModel>): Observable<UsuarioModel> {
    if (this.USE_MOCK) {
      const idx = this.usuariosFake.findIndex(u => u.idUsuario === id);
      if (idx !== -1) {
        const updated = new UsuarioModel({ ...this.usuariosFake[idx], ...data });
        this.usuariosFake[idx] = updated;
        return of(updated).pipe(delay(600));
      }
      return throwError(() => new Error('No encontrado'));
    }
    return this.http.put<any>(`${this.API_URL}/${id}`, data).pipe(map(i => UsuarioModel.fromApi(i)));
  }

  delete(id: number): Observable<boolean> {
    if (this.USE_MOCK) {
      const idx = this.usuariosFake.findIndex(u => u.idUsuario === id);
      if (idx !== -1) {
        this.usuariosFake.splice(idx, 1);
        return of(true).pipe(delay(400));
      }
      return of(false);
    }
    return this.http.delete<boolean>(`${this.API_URL}/${id}`);
  }
}
