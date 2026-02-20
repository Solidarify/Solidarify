import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UsuarioModel } from '../models/usuario.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Usuario { 
  
  private http = inject(HttpClient);
  
  private readonly API_URL = environment.apiUrl ? `${environment.apiUrl}/usuarios` : 'http://localhost:3000/api/usuarios';

  constructor() {}

  getAll(): Observable<UsuarioModel[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(items => items.map(i => UsuarioModel.fromApi(i)))
    );
  }

  getById(id: number): Observable<UsuarioModel | null> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(i => UsuarioModel.fromApi(i))
    );
  }

  create(data: Partial<UsuarioModel>): Observable<UsuarioModel> {
    return this.http.post<any>(this.API_URL, data).pipe(
      map(i => UsuarioModel.fromApi(i))
    );
  }

  update(id: number, data: Partial<UsuarioModel>): Observable<UsuarioModel> {
    return this.http.put<any>(`${this.API_URL}/${id}`, data).pipe(
      map(i => UsuarioModel.fromApi(i))
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      map(() => true)
    );
  }

  getDetallesRol(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}/detalles`);
  }
}
