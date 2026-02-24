import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrganizadorModel } from '../models/organizador.model'; 
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Organizador {
  
  private http = inject(HttpClient);
  
  private readonly API_URL = environment.apiUrl ? `${environment.apiUrl}/organizadores` : 'http://localhost:3000/api/organizadores';

  constructor() {}

  getAll(): Observable<OrganizadorModel[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  getById(idUsuario: number): Observable<OrganizadorModel> {
    return this.http.get<any>(`${this.API_URL}/${idUsuario}`).pipe(
      map(i => new OrganizadorModel(i))
    );
  }

  getByZona(zona: string): Observable<OrganizadorModel[]> {
    const params = new HttpParams().set('zona', zona);
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  getByCif(cif: string): Observable<OrganizadorModel | null> {
    const params = new HttpParams().set('cif', cif);
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.length ? new OrganizadorModel(items[0]) : null)
    );
  }

  searchByName(nombre: string): Observable<OrganizadorModel[]> {
    const params = new HttpParams().set('q', nombre);
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  create(data: Partial<OrganizadorModel>): Observable<OrganizadorModel> {
    return this.http.post<any>(this.API_URL, data).pipe(
      map(i => new OrganizadorModel(i))
    );
  }

  update(idUsuario: number, data: Partial<OrganizadorModel>): Observable<OrganizadorModel> {
    return this.http.put<any>(`${this.API_URL}/${idUsuario}`, data).pipe(
      map(i => new OrganizadorModel(i))
    );
  }

  delete(idUsuario: number): Observable<boolean> {
    return this.http.delete<any>(`${this.API_URL}/${idUsuario}`).pipe(
      map(() => true)
    );
  }

  getByZonas(zonas: string[]): Observable<OrganizadorModel[]> {
    const params = new HttpParams().set('zonas', zonas.join(','));
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  getConContacto(): Observable<OrganizadorModel[]> {
    const params = new HttpParams().set('has_contact', 'true');
    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  countByZona(zona: string): Observable<number> {
    return this.http.get<{ count: number }>(`${this.API_URL}/count?zona=${zona}`).pipe(
      map(response => response.count)
    );
  }

    createOrUpdate(data: Partial<OrganizadorModel>): Observable<OrganizadorModel> {
    return this.http.post<any>(this.API_URL, data).pipe(
      map(i => new OrganizadorModel(i))
    );
  }

}
