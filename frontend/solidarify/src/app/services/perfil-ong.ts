import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { PerfilONGModel } from '../models/perfil-ong.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PerfilOng {
  
  //Datos fake (BD de perfilONG)
  private ongsFake: PerfilONGModel[] = [
    new PerfilONGModel({
      idUsuario: 5,
      nombreLegal: 'Fundación Manos Verdes',
      cif: 'G12345678',
      descripcion: 'Apoyo alimentario a familias vulnerables de Las Palmas',
      direccion: 'Calle Solidaridad 10, Las Palmas de Gran Canaria',
      telefonoContacto: '928 123 456',
      web: 'https://manosverdes.org',
      estadoVerificacion: 'verificado',
      idAdminVerificador: 1,
      createdAt: new Date('2025-01-03')
    }),
    new PerfilONGModel({
      idUsuario: 6,
      nombreLegal: 'Asociación Sonrisas Solidarias',
      cif: 'G87654321',
      descripcion: 'Ayuda educativa para niños en situación vulnerable',
      telefonoContacto: '600 987 654',
      estadoVerificacion: 'pendiente',
      createdAt: new Date('2025-01-10')
    }),
    new PerfilONGModel({
      idUsuario: 7,
      nombreLegal: 'Fundación Esperanza Viva',
      cif: 'G44556677',
      direccion: 'Av. Principal 25, Telde',
      estadoVerificacion: 'rechazado',
      idAdminVerificador: 1,
      createdAt: new Date('2025-01-15')
    })
  ];

  constructor() {
    // Recuperar ONGs persistentes
    const saved = localStorage.getItem('ongsFake');
    if (saved) {
      const savedOngs = JSON.parse(saved);
      this.ongsFake.push(...savedOngs.map((o: any) => new PerfilONGModel(o)));
    }
  }

  //CRUD (cambio a HTTP)
  getAll(): Observable<PerfilONGModel[]> {
    console.log('Cargando todas las ONGs...');
    return of([...this.ongsFake]).pipe(delay(600));
  }

  getById(idUsuario: number): Observable<PerfilONGModel | null> {
    console.log('Buscando ONG ID:', idUsuario);
    const ong = this.ongsFake.find(o => o.idUsuario === idUsuario);
    return of(ong || null).pipe(delay(400));
  }

  getByCif(cif: string): Observable<PerfilONGModel | null> {
    console.log('Buscando ONG CIF:', cif);
    const ong = this.ongsFake.find(o => o.cif === cif.toUpperCase());
    return of(ong || null).pipe(delay(500));
  }

  getVerificadas(): Observable<PerfilONGModel[]> {
    console.log('Cargando ONGs verificadas...');
    return of(this.ongsFake.filter(o => o.isVerified)).pipe(delay(400));
  }

  getPendientes(): Observable<PerfilONGModel[]> {
    console.log('Cargando ONGs pendientes...');
    return of(this.ongsFake.filter(o => o.isPending)).pipe(delay(400));
  }

  create(ongData: Partial<PerfilONGModel>): Observable<PerfilONGModel> {
    console.log('Creando nueva ONG:', ongData.nombreLegal);
    const nuevaOng = new PerfilONGModel({
      ...ongData,
      idUsuario: Date.now(), // Simular auto_increment
      estadoVerificacion: 'pendiente',
      createdAt: new Date()
    });
    
    this.ongsFake.unshift(nuevaOng);
    this.saveToStorage();
    return of(nuevaOng).pipe(delay(1000));
  }

  update(idUsuario: number, ongData: Partial<PerfilONGModel>): Observable<PerfilONGModel> {
    console.log('Actualizando ONG ID:', idUsuario);
    const index = this.ongsFake.findIndex(o => o.idUsuario === idUsuario);
    
    if (index !== -1) {
      this.ongsFake[index] = new PerfilONGModel({
        ...this.ongsFake[index],
        ...ongData
      });
      this.saveToStorage();
      return of(this.ongsFake[index]).pipe(delay(800));
    }
    
    return throwError(() => new Error('ONG no encontrada')).pipe(delay(300));
  }

  //Verificar/Rechazar (admin)
  verificar(idUsuario: number, aprobado: boolean): Observable<PerfilONGModel> {
    console.log('📋', aprobado ? 'Verificando' : 'Rechazando', 'ONG ID:', idUsuario);
    const index = this.ongsFake.findIndex(o => o.idUsuario === idUsuario);
    
    if (index !== -1 && this.ongsFake[index].isPending) {
      this.ongsFake[index].estadoVerificacion = aprobado ? 'verificado' : 'rechazado';
      this.ongsFake[index].idAdminVerificador = 1; // Admin actual
      this.saveToStorage();
      return of(this.ongsFake[index]).pipe(delay(700));
    }
    
    return throwError(() => new Error('ONG no puede ser verificada')).pipe(delay(300));
  }

  delete(idUsuario: number): Observable<boolean> {
    console.log('Eliminando ONG ID:', idUsuario);
    const index = this.ongsFake.findIndex(o => o.idUsuario === idUsuario);
    
    if (index !== -1) {
      this.ongsFake.splice(index, 1);
      this.saveToStorage();
      return of(true).pipe(delay(500));
    }
    
    return of(false).pipe(delay(200));
  }

  //Utilidades
  countVerificadas(): number {
    return this.ongsFake.filter(o => o.isVerified).length;
  }

  countPendientes(): number {
    return this.ongsFake.filter(o => o.isPending).length;
  }

  searchByName(nombre: string): Observable<PerfilONGModel[]> {
    const resultados = this.ongsFake.filter(o => 
      o.nombreLegal.toLowerCase().includes(nombre.toLowerCase())
    );
    return of(resultados).pipe(delay(600));
  }

  private saveToStorage(): void {
    // Persistir datos fake (simula BD)
    localStorage.setItem('ongsFake', JSON.stringify(this.ongsFake));
  }
}
