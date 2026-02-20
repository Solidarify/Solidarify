import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PerfilONGModel } from '../models/perfil-ong.model'; 
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PerfilOng {
  
  private http = inject(HttpClient);
  
  private readonly API_URL = environment.apiUrl ? `${environment.apiUrl}/ongs` : 'http://localhost:3000/api/ongs';

  constructor() {}

  getAll(): Observable<PerfilONGModel[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  getById(idUsuario: number): Observable<PerfilONGModel | null> {
    return this.http.get<any>(`${this.API_URL}/${idUsuario}`).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

  getByCif(cif: string): Observable<PerfilONGModel | null> {
    const params = new HttpParams().set('cif', cif);
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.length ? new PerfilONGModel(items[0]) : null)
    );
  }

  getVerificadas(): Observable<PerfilONGModel[]> {
    const params = new HttpParams().set('estado', 'verificado');
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  getPendientes(): Observable<PerfilONGModel[]> {
    const params = new HttpParams().set('estado', 'pendiente');
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  searchByName(nombre: string): Observable<PerfilONGModel[]> {
    const params = new HttpParams().set('q', nombre);
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  create(ongData: Partial<PerfilONGModel>): Observable<PerfilONGModel> {
    return this.http.post<any>(this.API_URL, ongData).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

  update(idUsuario: number, ongData: Partial<PerfilONGModel>): Observable<PerfilONGModel> {
    return this.http.put<any>(`${this.API_URL}/${idUsuario}`, ongData).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

  delete(idUsuario: number): Observable<boolean> {
    return this.http.delete<any>(`${this.API_URL}/${idUsuario}`).pipe(
      map(() => true)
    );
  }

  verificar(idUsuario: number, aprobado: boolean): Observable<PerfilONGModel> {
    return this.http.patch<any>(`${this.API_URL}/${idUsuario}/verificar`, { aprobado }).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

    createOrUpdate(ongData: Partial<PerfilONGModel>): Observable<PerfilONGModel> {
    return this.http.post<any>(this.API_URL, ongData).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

}
