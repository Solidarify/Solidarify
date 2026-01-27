import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { OrganizadorModel } from '../models/organizador.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Organizador {
  
  //Datos fake (Organizadores de la BD)
  private organizadoresFake: OrganizadorModel[] = [
    new OrganizadorModel({
      idUsuario: 2,
      nombre: 'Solidaridad Norte LP',
      cif: 'G11223344',
      email: 'contacto@solidaridadnorte.com',
      cargo: 'Coordinador de Campañas',
      telefonoDirecto: '600 123 456',
      zonaResponsable: 'Zona Norte Las Palmas de Gran Canaria',
      observaciones: '5 años experiencia en recogida de alimentos y ropa',
      createdAt: new Date('2025-01-02')
    }),
    new OrganizadorModel({
      idUsuario: 3,
      nombre: 'Ayuda Vecinal Sur GC',
      cif: 'G55667788',
      email: 'ayuda.vecinal@sur.org',
      cargo: 'Responsable Logística',
      telefonoDirecto: '600 987 654',
      zonaResponsable: 'Zona Sur Gran Canaria (Telde, Vecindario)',
      observaciones: 'Especializados en distribución puntual de ayuda',
      createdAt: new Date('2025-01-05')
    }),
    new OrganizadorModel({
      idUsuario: 4,
      nombre: 'Cooperativa Isla Bonita',
      cif: 'G99887766',
      email: 'info@islabonita.coop',
      zonaResponsable: 'Tamaraceite - Zona Centro',
      observaciones: 'Cooperativa de voluntarios con vehículo propio',
      createdAt: new Date('2025-01-12')
    })
  ];

  constructor() {
    // Recuperar organizadores persistentes
    const saved = localStorage.getItem('organizadoresFake');
    if (saved) {
      const savedOrgs = JSON.parse(saved);
      this.organizadoresFake.push(...savedOrgs.map((o: any) => new OrganizadorModel(o)));
    }
  }

  //CRUD (cambio a HTTP)
  getAll(): Observable<OrganizadorModel[]> {
    console.log('Cargando todos los organizadores...');
    return of([...this.organizadoresFake]).pipe(delay(600));
  }

  getById(idUsuario: number): Observable<OrganizadorModel | null> {
    console.log('Buscando organizador ID:', idUsuario);
    const org = this.organizadoresFake.find(o => o.idUsuario === idUsuario);
    return of(org || null).pipe(delay(400));
  }

  getByZona(zona: string): Observable<OrganizadorModel[]> {
    console.log('Buscando organizadores en zona:', zona);
    const resultados = this.organizadoresFake.filter(o => 
      o.zonaResponsable?.toLowerCase().includes(zona.toLowerCase())
    );
    return of(resultados).pipe(delay(500));
  }

  getByCif(cif: string): Observable<OrganizadorModel | null> {
    console.log('Buscando organizador CIF:', cif);
    const org = this.organizadoresFake.find(o => o.cif === cif.toUpperCase());
    return of(org || null).pipe(delay(400));
  }

  create(organizadorData: Partial<OrganizadorModel>): Observable<OrganizadorModel> {
    console.log('Creando nuevo organizador:', organizadorData.nombre);
    const nuevoOrg = new OrganizadorModel({
      ...organizadorData,
      idUsuario: Date.now(), // Simular auto_increment
      createdAt: new Date()
    });
    
    this.organizadoresFake.unshift(nuevoOrg);
    this.saveToStorage();
    return of(nuevoOrg).pipe(delay(1000));
  }

  update(idUsuario: number, organizadorData: Partial<OrganizadorModel>): Observable<OrganizadorModel> {
    console.log('Actualizando organizador ID:', idUsuario);
    const index = this.organizadoresFake.findIndex(o => o.idUsuario === idUsuario);
    
    if (index !== -1) {
      this.organizadoresFake[index] = new OrganizadorModel({
        ...this.organizadoresFake[index],
        ...organizadorData
      });
      this.saveToStorage();
      return of(this.organizadoresFake[index]).pipe(delay(800));
    }
    
    return throwError(() => new Error('Organizador no encontrado')).pipe(delay(300));
  }

  delete(idUsuario: number): Observable<boolean> {
    console.log('Eliminando organizador ID:', idUsuario);
    const index = this.organizadoresFake.findIndex(o => o.idUsuario === idUsuario);
    
    if (index !== -1) {
      this.organizadoresFake.splice(index, 1);
      this.saveToStorage();
      return of(true).pipe(delay(500));
    }
    
    return of(false).pipe(delay(200));
  }

  //Utilidades
  getByZonas(zonas: string[]): Observable<OrganizadorModel[]> {
    console.log('Filtrando por zonas:', zonas);
    const resultados = this.organizadoresFake.filter(o => 
      zonas.some(zona => o.zonaResponsable?.toLowerCase().includes(zona.toLowerCase()))
    );
    return of(resultados).pipe(delay(600));
  }

  searchByName(nombre: string): Observable<OrganizadorModel[]> {
    console.log('Buscando organizador:', nombre);
    const resultados = this.organizadoresFake.filter(o => 
      o.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
    return of(resultados).pipe(delay(500));
  }

  getConContacto(): Observable<OrganizadorModel[]> {
    console.log('Organizador con contacto disponible...');
    return of(this.organizadoresFake.filter(o => o.hasContactInfo)).pipe(delay(400));
  }

  countByZona(zona: string): number {
    return this.organizadoresFake.filter(o => 
      o.zonaResponsable?.toLowerCase().includes(zona.toLowerCase())
    ).length;
  }

  private saveToStorage(): void {
    // Persistir datos fake (simula BD)
    localStorage.setItem('organizadoresFake', JSON.stringify(this.organizadoresFake));
  }
}
