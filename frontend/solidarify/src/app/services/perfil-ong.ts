import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { PerfilONGModel } from '../models/perfil-ong.model'; 

@Injectable({
  providedIn: 'root',
})
export class PerfilOng {
  
  private http = inject(HttpClient);
  
  // CONFIG
  private readonly USE_MOCK = true;
  private readonly API_URL = 'http://localhost:3000/api/ongs';
  private readonly STORAGE_KEY = 'ongsFake';

  // DATOS MOCK
  private ongsFake: PerfilONGModel[] = [
    new PerfilONGModel({
      idUsuario: 5, nombreLegal: 'Fundación Manos Verdes', cif: 'G12345678', 
      descripcion: 'Apoyo alimentario...', direccion: 'Calle Solidaridad 10', telefonoContacto: '928 123 456', 
      web: 'https://manosverdes.org', estadoVerificacion: 'verificado', idAdminVerificador: 1, createdAt: new Date('2025-01-03')
    }),
    new PerfilONGModel({
      idUsuario: 6, nombreLegal: 'Asociación Sonrisas', cif: 'G87654321', 
      descripcion: 'Ayuda educativa...', telefonoContacto: '600 987 654', estadoVerificacion: 'pendiente', createdAt: new Date('2025-01-10')
    }),
    new PerfilONGModel({
      idUsuario: 7, nombreLegal: 'Fundación Esperanza', cif: 'G44556677', 
      direccion: 'Av. Principal 25', estadoVerificacion: 'rechazado', idAdminVerificador: 1, createdAt: new Date('2025-01-15')
    })
  ];

  constructor() {
    this.loadFromStorage();
  }


  getAll(): Observable<PerfilONGModel[]> {
    if (this.USE_MOCK) {
      return of([...this.ongsFake]).pipe(delay(600));
    }
    return this.http.get<any[]>(this.API_URL).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  getById(idUsuario: number): Observable<PerfilONGModel | null> {
    if (this.USE_MOCK) {
      const ong = this.ongsFake.find(o => o.idUsuario === idUsuario);
      return of(ong || null).pipe(delay(400));
    }
    return this.http.get<any>(`${this.API_URL}/${idUsuario}`).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

  getByCif(cif: string): Observable<PerfilONGModel | null> {
    if (this.USE_MOCK) {
      const ong = this.ongsFake.find(o => o.cif === cif.toUpperCase());
      return of(ong || null).pipe(delay(500));
    }
    return this.http.get<any>(`${this.API_URL}/buscar?cif=${cif}`).pipe(
      map(items => items.length ? new PerfilONGModel(items[0]) : null)
    );
  }

  getVerificadas(): Observable<PerfilONGModel[]> {
    if (this.USE_MOCK) {
      return of(this.ongsFake.filter(o => o.isVerified)).pipe(delay(400));
    }
    return this.http.get<any[]>(`${this.API_URL}?estado=verificado`).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  getPendientes(): Observable<PerfilONGModel[]> {
    if (this.USE_MOCK) {
      return of(this.ongsFake.filter(o => o.isPending)).pipe(delay(400));
    }
    return this.http.get<any[]>(`${this.API_URL}?estado=pendiente`).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  searchByName(nombre: string): Observable<PerfilONGModel[]> {
    if (this.USE_MOCK) {
      const res = this.ongsFake.filter(o => o.nombreLegal.toLowerCase().includes(nombre.toLowerCase()));
      return of(res).pipe(delay(600));
    }
    return this.http.get<any[]>(`${this.API_URL}?q=${nombre}`).pipe(
      map(items => items.map(i => new PerfilONGModel(i)))
    );
  }

  create(ongData: Partial<PerfilONGModel>): Observable<PerfilONGModel> {
    if (this.USE_MOCK) {
      const nuevaOng = new PerfilONGModel({
        ...ongData,
        idUsuario: Date.now(),
        estadoVerificacion: 'pendiente',
        createdAt: new Date()
      });
      this.ongsFake.unshift(nuevaOng);
      this.saveToStorage();
      return of(nuevaOng).pipe(delay(1000));
    }
    return this.http.post<any>(this.API_URL, ongData).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

  update(idUsuario: number, ongData: Partial<PerfilONGModel>): Observable<PerfilONGModel> {
    if (this.USE_MOCK) {
      const idx = this.ongsFake.findIndex(o => o.idUsuario === idUsuario);
      if (idx !== -1) {
        const updated = new PerfilONGModel({ ...this.ongsFake[idx], ...ongData });
        this.ongsFake[idx] = updated;
        this.saveToStorage();
        return of(updated).pipe(delay(800));
      }
      return throwError(() => new Error('ONG no encontrada'));
    }
    return this.http.put<any>(`${this.API_URL}/${idUsuario}`, ongData).pipe(
      map(i => new PerfilONGModel(i))
    );
  }

  delete(idUsuario: number): Observable<boolean> {
    if (this.USE_MOCK) {
      const idx = this.ongsFake.findIndex(o => o.idUsuario === idUsuario);
      if (idx !== -1) {
        this.ongsFake.splice(idx, 1);
        this.saveToStorage();
        return of(true).pipe(delay(500));
      }
      return of(false);
    }
    return this.http.delete<boolean>(`${this.API_URL}/${idUsuario}`);
  }


verificar(idUsuario: number, aprobado: boolean): Observable<PerfilONGModel> {
  if (this.USE_MOCK) {
    const idx = this.ongsFake.findIndex(o => o.idUsuario === idUsuario);
    
    if (idx !== -1) { 
      
      this.ongsFake[idx].estadoVerificacion = aprobado ? 'verificado' : 'rechazado';
      this.ongsFake[idx].idAdminVerificador = 1;
      this.saveToStorage();
      
      return of(this.ongsFake[idx]).pipe(delay(700));
    }
    return throwError(() => new Error('ONG no encontrada'));
  }
  
  const action = aprobado ? 'aprobar' : 'rechazar';
  return this.http.patch<any>(`${this.API_URL}/${idUsuario}/${action}`, {}).pipe(
    map(i => new PerfilONGModel(i))
  );
}


  countVerificadas(): number {
    return this.ongsFake.filter(o => o.isVerified).length;
  }

  countPendientes(): number {
    return this.ongsFake.filter(o => o.isPending).length;
  }

  private loadFromStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.ongsFake = parsed.map((o: any) => new PerfilONGModel(o));
      } catch (e) {
        console.warn('Error storage ONGs, usando default');
        this.saveToStorage();
      }
    } else {
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.ongsFake));
  }
}
