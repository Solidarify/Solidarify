import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PropuestaModel } from '../models/propuesta.model'; 
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Propuesta {

  private http = inject(HttpClient);
  
  private readonly API_URL = environment.apiUrl ? `${environment.apiUrl}/propuestas` : 'http://localhost:3000/api/propuestas';

  constructor() {}

  getAll(): Observable<PropuestaModel[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(items => items.map(item => PropuestaModel.fromApi(item)))
    );
  }

  getAllAdmin(): Observable<PropuestaModel[]> {
    return this.getAll(); 
  }

  getPublicas(): Observable<PropuestaModel[]> {
    return this.http.get<any[]>(`${this.API_URL}/publicas`).pipe(
      map(items => items.map(item => PropuestaModel.fromApi(item)))
    );
  }

  getById(id: number): Observable<PropuestaModel | null> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  create(propuestaData: Partial<PropuestaModel>): Observable<PropuestaModel> {
    return this.http.post<any>(this.API_URL, propuestaData).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  update(id: number, propuestaData: Partial<PropuestaModel>): Observable<PropuestaModel> {
    return this.http.put<any>(`${this.API_URL}/${id}`, propuestaData).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      map(() => true)
    );
  }

  cambiarEstadoAdmin(id: number, nuevoEstado: string): Observable<PropuestaModel> {
    return this.http.patch<any>(`${this.API_URL}/${id}/estado`, { estado: nuevoEstado }).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  asignarOngManual(idPropuesta: number, idOng: number): Observable<PropuestaModel> {
    return this.http.post<any>(`${this.API_URL}/${idPropuesta}/asignar`, { idOng }).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  getFiltradas(filtros: any): Observable<PropuestaModel[]> {
    let params = new HttpParams();
    
    if (filtros.search) params = params.set('q', filtros.search);
    if (filtros.tipoBien) params = params.set('tipo_bien_id', filtros.tipoBien);
    if (filtros.lugar) params = params.set('lugar', filtros.lugar);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.organizador) params = params.set('organizador_id', filtros.organizador);

    return this.http.get<any[]>(`${this.API_URL}/buscar`, { params }).pipe(
      map(items => items.map(item => PropuestaModel.fromApi(item)))
    );
  }

  solicitarVinculacionOng(idPropuesta: number, idOng: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${idPropuesta}/solicitar-ong`, { idOng });
  }

  responderSolicitudOng(idPropuesta: number, aceptar: boolean): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${idPropuesta}/responder-solicitud`, { aceptar });
  }

}
