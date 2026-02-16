import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { OrganizadorModel } from '../models/organizador.model'; 

@Injectable({
  providedIn: 'root',
})
export class Organizador {
  
  private http = inject(HttpClient);
  
  private readonly USE_MOCK = true;
  private readonly API_URL = 'http://localhost:3000/api/organizadores';
  private readonly STORAGE_KEY = 'organizadoresFake';

  private organizadoresFake: OrganizadorModel[] = [
    new OrganizadorModel({
      idUsuario: 2, nombre: 'Solidaridad Norte LP', cif: 'G11223344', email: 'contacto@solidaridadnorte.com', cargo: 'Coordinador', telefonoDirecto: '600 123 456', zonaResponsable: 'Zona Norte', observaciones: 'Exp en alimentos', createdAt: new Date('2025-01-02')
    }),
    new OrganizadorModel({
      idUsuario: 3, nombre: 'Ayuda Vecinal Sur GC', cif: 'G55667788', email: 'ayuda@sur.org', cargo: 'Logística', telefonoDirecto: '600 987 654', zonaResponsable: 'Zona Sur', observaciones: 'Distribución puntual', createdAt: new Date('2025-01-05')
    }),
    new OrganizadorModel({
      idUsuario: 4, nombre: 'Cooperativa Isla Bonita', cif: 'G99887766', email: 'info@islabonita.coop', zonaResponsable: 'Centro', observaciones: 'Voluntarios con vehículo', createdAt: new Date('2025-01-12')
    })
  ];

  constructor() {
    this.loadFromStorage();
  }

  getAll(): Observable<OrganizadorModel[]> {
    if (this.USE_MOCK) return of([...this.organizadoresFake]).pipe(delay(600));
    
    return this.http.get<any[]>(this.API_URL).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  getById(idUsuario: number): Observable<OrganizadorModel | null> {
    if (this.USE_MOCK) {
      const org = this.organizadoresFake.find(o => o.idUsuario === idUsuario);
      return of(org || null).pipe(delay(400));
    }
    return this.http.get<any>(`${this.API_URL}/${idUsuario}`).pipe(
      map(i => new OrganizadorModel(i))
    );
  }

  getByZona(zona: string): Observable<OrganizadorModel[]> {
    if (this.USE_MOCK) {
      const res = this.organizadoresFake.filter(o => o.zonaResponsable?.toLowerCase().includes(zona.toLowerCase()));
      return of(res).pipe(delay(500));
    }
    return this.http.get<any[]>(`${this.API_URL}?zona=${zona}`).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  getByCif(cif: string): Observable<OrganizadorModel | null> {
    if (this.USE_MOCK) {
      const org = this.organizadoresFake.find(o => o.cif === cif.toUpperCase());
      return of(org || null).pipe(delay(400));
    }
    return this.http.get<any[]>(`${this.API_URL}?cif=${cif}`).pipe(
      map(items => items.length ? new OrganizadorModel(items[0]) : null)
    );
  }

  searchByName(nombre: string): Observable<OrganizadorModel[]> {
    if (this.USE_MOCK) {
      const res = this.organizadoresFake.filter(o => o.nombre.toLowerCase().includes(nombre.toLowerCase()));
      return of(res).pipe(delay(500));
    }
    return this.http.get<any[]>(`${this.API_URL}?q=${nombre}`).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  create(data: Partial<OrganizadorModel>): Observable<OrganizadorModel> {
    if (this.USE_MOCK) {
      const nuevo = new OrganizadorModel({
        ...data,
        idUsuario: Date.now(),
        createdAt: new Date()
      });
      this.organizadoresFake.unshift(nuevo);
      this.saveToStorage();
      return of(nuevo).pipe(delay(1000));
    }
    return this.http.post<any>(this.API_URL, data).pipe(map(i => new OrganizadorModel(i)));
  }

  update(idUsuario: number, data: Partial<OrganizadorModel>): Observable<OrganizadorModel> {
    if (this.USE_MOCK) {
      const idx = this.organizadoresFake.findIndex(o => o.idUsuario === idUsuario);
      if (idx !== -1) {
        const updated = new OrganizadorModel({ ...this.organizadoresFake[idx], ...data });
        this.organizadoresFake[idx] = updated;
        this.saveToStorage();
        return of(updated).pipe(delay(800));
      }
      return throwError(() => new Error('Organizador no encontrado'));
    }
    return this.http.put<any>(`${this.API_URL}/${idUsuario}`, data).pipe(map(i => new OrganizadorModel(i)));
  }

  delete(idUsuario: number): Observable<boolean> {
    if (this.USE_MOCK) {
      const idx = this.organizadoresFake.findIndex(o => o.idUsuario === idUsuario);
      if (idx !== -1) {
        this.organizadoresFake.splice(idx, 1);
        this.saveToStorage();
        return of(true).pipe(delay(500));
      }
      return of(false);
    }
    return this.http.delete<boolean>(`${this.API_URL}/${idUsuario}`);
  }

  getByZonas(zonas: string[]): Observable<OrganizadorModel[]> {
    if (this.USE_MOCK) {
      const res = this.organizadoresFake.filter(o => 
        zonas.some(z => o.zonaResponsable?.toLowerCase().includes(z.toLowerCase()))
      );
      return of(res).pipe(delay(600));
    }
    return this.http.get<any[]>(`${this.API_URL}?zonas=${zonas.join(',')}`).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

  getConContacto(): Observable<OrganizadorModel[]> {
    if (this.USE_MOCK) {
      return of(this.organizadoresFake.filter(o => o.hasContactInfo)).pipe(delay(400));
    }
    return this.http.get<any[]>(`${this.API_URL}?has_contact=true`).pipe(
      map(items => items.map(i => new OrganizadorModel(i)))
    );
  }

countByZona(zona: string): Observable<number> {
    if (this.USE_MOCK) {
      const count = this.organizadoresFake.filter(o => 
        o.zonaResponsable?.toLowerCase().includes(zona.toLowerCase())
      ).length;
      return of(count).pipe(delay(300)); 
    }
    
    return this.http.get<{ count: number }>(`${this.API_URL}/count?zona=${zona}`).pipe(
      map(response => response.count)
    );
  }

  private loadFromStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.organizadoresFake = parsed.map((o: any) => new OrganizadorModel(o));
      } catch (e) {
        this.saveToStorage();
      }
    } else {
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.organizadoresFake));
  }
}
