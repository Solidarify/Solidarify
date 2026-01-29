import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PropuestaModel } from '../models/propuesta.model';

@Injectable({
  providedIn: 'root',
})
export class Propuesta {
  
  // ✅ Datos falsos (tu SQL)
  private propuestasFake: PropuestaModel[] = [
    PropuestaModel.fromApi({
      Id_Propuesta: 1,
      Id_Organizador: 2,
      Id_Tipo_Bien: 1,
      Titulo: 'Campaña de alimentos barrio Norte',
      Descripcion: 'Recogida de alimentos no perecederos para familias del barrio Norte.',
      Fecha_Inicio: '2025-01-15T09:00:00Z',
      Fecha_Fin: '2025-02-01T20:00:00Z',
      Fecha_Publicacion: '2025-01-05T10:00:00Z',
      Estado_Propuesta: 'publicada',
      Lugar: 'Centro Cívico La Isleta'
    }),
    PropuestaModel.fromApi({
      Id_Propuesta: 2,
      Id_Organizador: 3,
      Id_Tipo_Bien: 2,
      Titulo: 'Vuelta al cole solidaria',
      Descripcion: 'Recogida de material escolar para niños en situación vulnerable.',
      Fecha_Inicio: '2025-08-20T09:00:00Z',
      Fecha_Fin: '2025-09-10T20:00:00Z',
      Fecha_Publicacion: '2025-08-01T09:00:00Z',
      Estado_Propuesta: 'publicada',
      Lugar: 'Centro Cultural Vecindario'
    }),
    PropuestaModel.fromApi({
      Id_Propuesta: 3,
      Id_Organizador: 4,
      Id_Tipo_Bien: 3,
      Titulo: 'Ropa de abrigo para invierno',
      Descripcion: 'Campaña de recogida de ropa y mantas para personas sin hogar.',
      Fecha_Inicio: '2025-11-01T09:00:00Z',
      Fecha_Fin: '2025-12-15T20:00:00Z',
      Fecha_Publicacion: '2025-10-10T10:30:00Z',
      Estado_Propuesta: 'publicada',
      Lugar: 'Plaza Principal San Mateo'
    })
  ];

  /*
  constructor() {
    // Recuperar propuestas persistentes
    const saved = localStorage.getItem('propuestasFake');
    if (saved) {
      const savedPropuestas = JSON.parse(saved);
      this.propuestasFake.push(...savedPropuestas.map((p: any) => new PropuestaModel(p)));
    }
  }
  */

  //CAMBIO PARA QUE AL RECARGAR LA PÁGINA CON IONIC SERVE, SE MUESTRE LOS CAMBIOS REALIZADOS
 //SE ALMACENAN LAS PROPUESTAS EN EL LOCAL STORAGE
  constructor() {
    //Carga localstorage si no hay datos
    const saved = localStorage.getItem('propuestasFake');
    if (saved) {
      try {
        const savedPropuestas = JSON.parse(saved);
        //Reemplaza, no agrega
        this.propuestasFake = savedPropuestas.map((p: any) => new PropuestaModel(p));
        console.log('Datos cargados desde localStorage:', this.propuestasFake.length);
      } catch (e) {
        console.warn('localStorage corrupto, usando datos fake');
      }
    } else {
      console.log('Sin datos en localStorage, usando fake');
      this.saveToStorage(); //Guarda los iniciales
    }
  }

  //Get all
  getAll(): Observable<PropuestaModel[]> {
    console.log('Cargando todas las propuestas...');
    return of([...this.propuestasFake]).pipe(delay(500));
  }

  //Solo públicas (para ONGs)
  getPublicas(): Observable<PropuestaModel[]> {
    console.log('Cargando propuestas públicas...');
    return of(this.propuestasFake.filter(p => p.isPublicada)).pipe(delay(600));
  }

  //Por organizador (mis propuestas)
  getByOrganizador(idOrganizador: number): Observable<PropuestaModel[]> {
    console.log('Propuestas organizador ID:', idOrganizador);
    const propuestas = this.propuestasFake.filter(p => p.idOrganizador === idOrganizador);
    return of(propuestas).pipe(delay(400));
  }

  //Por ID
  getById(id: number): Observable<PropuestaModel | null> {
    console.log('Buscando propuesta ID:', id);
    const propuesta = this.propuestasFake.find(p => p.idPropuesta === id) || null;
    return of(propuesta).pipe(delay(300));
  }

  //CRUD
  create(propuestaData: Partial<PropuestaModel>): Observable<PropuestaModel> {
    console.log('Creando propuesta:', propuestaData.titulo);
    const nueva = new PropuestaModel({
      ...propuestaData,
      idPropuesta: Date.now(), // Simular auto_increment
      estadoPropuesta: 'borrador'
    });
    
    this.propuestasFake.unshift(nueva);
    this.saveToStorage();
    return of(nueva).pipe(delay(800));
  }

  update(id: number, propuestaData: Partial<PropuestaModel>): Observable<PropuestaModel> {
    console.log('Actualizando propuesta ID:', id);
    const index = this.propuestasFake.findIndex(p => p.idPropuesta === id);
    
    if (index !== -1) {
      this.propuestasFake[index] = new PropuestaModel({
        ...this.propuestasFake[index],
        ...propuestaData
      });
      this.saveToStorage();
      return of(this.propuestasFake[index]).pipe(delay(600));
    }
    
    return throwError(() => new Error('Propuesta no encontrada')).pipe(delay(300));
  }

  //Publicar (cambiar estado)
  publicar(id: number): Observable<PropuestaModel> {
    console.log('Publicando propuesta ID:', id);
    const index = this.propuestasFake.findIndex(p => p.idPropuesta === id);
    
    if (index !== -1) {
      this.propuestasFake[index].estadoPropuesta = 'publicada';
      this.propuestasFake[index].fechaPublicacion = new Date();
      this.saveToStorage();
      return of(this.propuestasFake[index]).pipe(delay(700));
    }
    
    return throwError(() => new Error('Propuesta no encontrada')).pipe(delay(300));
  }

  delete(id: number): Observable<boolean> {
    console.log('liminando propuesta ID:', id);
    const index = this.propuestasFake.findIndex(p => p.idPropuesta === id);
    
    if (index !== -1) {
      this.propuestasFake.splice(index, 1);
      this.saveToStorage();
      return of(true).pipe(delay(400));
    }
    
    return of(false).pipe(delay(200));
  }

  //Filtro
  getFiltradas(filtros: any): Observable<PropuestaModel[]> {
  console.log('Filtrando propuestas:', filtros);
  const resultados = this.propuestasFake.filter(p => {
    // Buscar en título y descripción
    const matchSearch = !filtros.search || 
      p.titulo.toLowerCase().includes(filtros.search.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filtros.search.toLowerCase());
    
    // Filtrar por tipo bien
    const matchTipo = !filtros.tipoBien || p.idTipoBien.toString() === filtros.tipoBien;
    
    // Filtrar por lugar
    const matchLugar = !filtros.lugar || p.lugar.toLowerCase().includes(filtros.lugar.toLowerCase());
    
    // Filtrar por estado
    const matchEstado = !filtros.estado || p.estadoPropuesta === filtros.estado;
    
    return matchSearch && matchTipo && matchLugar && matchEstado;
  });
  
  return of(resultados).pipe(delay(500));
}

  //Filtro búsqueda (solo para ONG)
  search(filtro: string): Observable<PropuestaModel[]> {
    console.log('Buscando propuestas:', filtro);
    const resultados = this.propuestasFake.filter(p =>
      p.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
      p.lugar.toLowerCase().includes(filtro.toLowerCase())
    );
    return of(resultados).pipe(delay(600));
  }

  //Utilidades
  countPublicas(): number {
    return this.propuestasFake.filter(p => p.isPublicada).length;
  }

  /*
  private saveToStorage(): void {
    localStorage.setItem('propuestasFake', JSON.stringify(this.propuestasFake));
  }
  */
 //CAMBIO PARA QUE AL RECARGAR LA PÁGINA CON IONIC SERVE, SE MUESTRE LOS CAMBIOS REALIZADOS
 //SE ALMACENAN LAS PROPUESTAS EN EL LOCAL STORAGE
  private saveToStorage(): void {
    //Filtra duplicados
    const uniquePropuestas = this.propuestasFake.filter((p, index, self) => 
      index === self.findIndex(t => t.idPropuesta === p.idPropuesta)
    );
    localStorage.setItem('propuestasFake', JSON.stringify(uniquePropuestas));
  }

}
