import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PropuestaModel } from '../models/propuesta.model'; 

@Injectable({
  providedIn: 'root',
})
export class Propuesta {

  private http = inject(HttpClient);
  
  private readonly USE_MOCK = true;
  private readonly API_URL = 'http://localhost:3000/api/propuestas';
  private readonly STORAGE_KEY = 'propuestasFake';

  private propuestasFake: PropuestaModel[] = [
    PropuestaModel.fromApi({
      Id_Propuesta: 1, Id_Organizador: 2, Id_Tipo_Bien: 1, Titulo: 'Campaña de alimentos barrio Norte', 
      Descripcion: 'Recogida de alimentos...', Fecha_Inicio: '2025-01-15T09:00:00Z', Fecha_Fin: '2025-02-01T20:00:00Z', 
      Fecha_Publicacion: '2025-01-05T10:00:00Z', Estado_Propuesta: 'publicada', Lugar: 'Centro Cívico La Isleta'
    }),
    PropuestaModel.fromApi({
      Id_Propuesta: 2, Id_Organizador: 3, Id_Tipo_Bien: 2, Titulo: 'Vuelta al cole solidaria', 
      Descripcion: 'Material escolar...', Fecha_Inicio: '2025-08-20T09:00:00Z', Fecha_Fin: '2025-09-10T20:00:00Z', 
      Fecha_Publicacion: '2025-08-01T09:00:00Z', Estado_Propuesta: 'publicada', Lugar: 'Centro Cultural Vecindario'
    }),
    PropuestaModel.fromApi({
      Id_Propuesta: 3, Id_Organizador: 4, Id_Tipo_Bien: 3, Titulo: 'Ropa de abrigo', 
      Descripcion: 'Ropa y mantas...', Fecha_Inicio: '2025-11-01T09:00:00Z', Fecha_Fin: '2025-12-15T20:00:00Z', 
      Fecha_Publicacion: '2025-10-10T10:30:00Z', Estado_Propuesta: 'publicada', Lugar: 'Plaza Principal San Mateo'
    })
  ];

  constructor() {
    this.loadFromStorage();
  }

  getAll(): Observable<PropuestaModel[]> {
    if (this.USE_MOCK) {
      console.log('MOCK: Cargando todas las propuestas...');
      return of([...this.propuestasFake]).pipe(delay(500));
    }
    return this.http.get<any[]>(this.API_URL).pipe(
      map(items => items.map(item => PropuestaModel.fromApi(item)))
    );
  }

  getPublicas(): Observable<PropuestaModel[]> {
    if (this.USE_MOCK) {
      return of(this.propuestasFake.filter(p => p.estadoPropuesta === 'publicada')).pipe(delay(600));
    }
    return this.http.get<any[]>(`${this.API_URL}/publicas`).pipe(
      map(items => items.map(item => PropuestaModel.fromApi(item)))
    );
  }

  getById(id: number): Observable<PropuestaModel | null> {
    if (this.USE_MOCK) {
      const propuesta = this.propuestasFake.find(p => p.idPropuesta === id) || null;
      return of(propuesta).pipe(delay(300));
    }
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  getByOrganizador(idOrganizador: number): Observable<PropuestaModel[]> {
    if (this.USE_MOCK) {
      const filtered = this.propuestasFake.filter(p => p.idOrganizador === idOrganizador);
      return of(filtered).pipe(delay(400));
    }
    return this.http.get<any[]>(`${this.API_URL}`, { params: { organizador_id: idOrganizador } }).pipe(
      map(items => items.map(item => PropuestaModel.fromApi(item)))
    );
  }

  create(propuestaData: Partial<PropuestaModel>): Observable<PropuestaModel> {
    if (this.USE_MOCK) {
      const nueva = new PropuestaModel({
        ...propuestaData,
        idPropuesta: Date.now(), 
        estadoPropuesta: 'borrador',
        fechaPublicacion: new Date() 
      });
      this.propuestasFake.unshift(nueva);
      this.saveToStorage();
      return of(nueva).pipe(delay(800));
    }
    return this.http.post<any>(this.API_URL, propuestaData).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  update(id: number, propuestaData: Partial<PropuestaModel>): Observable<PropuestaModel> {
    if (this.USE_MOCK) {
      const index = this.propuestasFake.findIndex(p => p.idPropuesta === id);
      if (index !== -1) {
        const actualizada = new PropuestaModel({
          ...this.propuestasFake[index],
          ...propuestaData
        });
        this.propuestasFake[index] = actualizada;
        this.saveToStorage();
        return of(actualizada).pipe(delay(600));
      }
      return throwError(() => new Error('Propuesta no encontrada'));
    }
    return this.http.put<any>(`${this.API_URL}/${id}`, propuestaData).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  delete(id: number): Observable<boolean> {
    if (this.USE_MOCK) {
      const index = this.propuestasFake.findIndex(p => p.idPropuesta === id);
      if (index !== -1) {
        this.propuestasFake.splice(index, 1);
        this.saveToStorage();
        return of(true).pipe(delay(400));
      }
      return of(false);
    }
    return this.http.delete<boolean>(`${this.API_URL}/${id}`);
  }



  publicar(id: number): Observable<PropuestaModel> {
    if (this.USE_MOCK) {
     
      return this.update(id, { 
        estadoPropuesta: 'publicada', 
        fechaPublicacion: new Date() 
      });
    }

    return this.http.patch<any>(`${this.API_URL}/${id}/publicar`, {}).pipe(
      map(item => PropuestaModel.fromApi(item))
    );
  }

  getFiltradas(filtros: any): Observable<PropuestaModel[]> {
    if (this.USE_MOCK) {
   
      const resultados = this.propuestasFake.filter(p => {
        const search = filtros.search?.toLowerCase() || '';
        const matchSearch = !search || p.titulo.toLowerCase().includes(search) || p.descripcion.toLowerCase().includes(search);
        const matchTipo = !filtros.tipoBien || p.idTipoBien.toString() == filtros.tipoBien; // == para coerción de tipos
        const matchLugar = !filtros.lugar || p.lugar.toLowerCase().includes(filtros.lugar.toLowerCase());
        const matchEstado = !filtros.estado || p.estadoPropuesta === filtros.estado;
        const matchOrg = !filtros.organizador || p.idOrganizador === filtros.organizador;
        return matchSearch && matchTipo && matchLugar && matchEstado && matchOrg;
      });
        return of(resultados).pipe(delay(500));
    }

  
    let params = new HttpParams();
    if (filtros.search) params = params.set('q', filtros.search);
    if (filtros.tipoBien) params = params.set('tipo_bien_id', filtros.tipoBien);
    if (filtros.lugar) params = params.set('lugar', filtros.lugar);
    if (filtros.estado) params = params.set('estado', filtros.estado);

    return this.http.get<any[]>(`${this.API_URL}/buscar`, { params }).pipe(
      map(items => items.map(item => PropuestaModel.fromApi(item)))
    );
  }


  private loadFromStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.propuestasFake = parsed.map((p: any) => new PropuestaModel(p));
      } catch (e) {
        console.warn('Error al cargar localStorage, usando defaults');
        this.saveToStorage(); 
      }
    } else {
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    const unique = this.propuestasFake.filter((p, index, self) => 
      index === self.findIndex(t => t.idPropuesta === p.idPropuesta)
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unique));
  }
}
