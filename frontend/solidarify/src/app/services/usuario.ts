import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, throwError } from 'rxjs';
import { UsuarioModel } from '../models/usuario.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  
   private usuariosFake: UsuarioModel[] = [
    UsuarioModel.fromApi({
      Id_Usuario: 1,
      Nombre: 'Admin General',
      Email: 'admin@donapp.com',
      Password_Hash: 'hash_admin',
      Telefono: '600000001',
      Activo: 1,
      Created_At: '2025-01-01T09:00:00Z'
    }),
    UsuarioModel.fromApi({
      Id_Usuario: 2,
      Nombre: 'Organizador Norte',
      Email: 'org.norte@donapp.com',
      Password_Hash: 'hash_org_norte',
      Telefono: '600000002',
      Activo: 1,
      Created_At: '2025-01-02T09:00:00Z'
    }),
    UsuarioModel.fromApi({
      Id_Usuario: 5,
      Nombre: 'ONG Manos Verdes',
      Email: 'contacto@manosverdes.org',
      Password_Hash: 'hash_ong_manosverdes',
      Telefono: '600000005',
      Activo: 1,
      Created_At: '2025-01-03T09:00:00Z'
    })
  ];

  //Estado de usuario actual (login/logout)
  private currentUserSubject = new BehaviorSubject<UsuarioModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const usuario = JSON.parse(saved) as UsuarioModel;
      this.currentUserSubject.next(new UsuarioModel(usuario));
    }
  }

  //Simular login (cambio a HTTP)
  login(email: string, password: string): Observable<UsuarioModel | null> {
    console.log('Login intento:', email);
    return of(null).pipe(
      delay(1000), // Simular latencia red
      map(() => {
        const usuario = this.usuariosFake.find(u => 
          u.email === email.toLowerCase() && 
          u.passwordHash.includes('hash')
        );
        
        console.log('Usuario encontrado:', usuario);
        console.log('Password esperado:', usuario ? usuario.passwordHash : 'N/A');
        console.log('Password proporcionado:', password);
        if (usuario) {
          console.log('Login OK:', usuario.displayName);
          this.currentUserSubject.next(usuario);
          localStorage.setItem('currentUser', JSON.stringify(usuario));
          return usuario;
        }
        
        console.log('Credenciales inválidas');
        return null;
      })
    );
  }

  //Simular logout
  logout(): void {
    console.log('Logout');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  //Obtener todos los usuarios (cambio a HTTP)
  getAll(): Observable<UsuarioModel[]> {
    console.log('Cargando todos usuarios...');
    return of([...this.usuariosFake]).pipe(
      delay(500) // Simular carga
    );
  }

  //Obtener por ID
  getById(id: number): Observable<UsuarioModel | null> {
    console.log('Buscando usuario ID:', id);
    return of(this.usuariosFake.find(u => u.idUsuario === id) || null).pipe(
      delay(300)
    );
  }

  //CRUD
  create(usuarioData: Partial<UsuarioModel>): Observable<UsuarioModel> {
    console.log('Creando usuario:', usuarioData);
    const nuevo = new UsuarioModel({
      ...usuarioData,
      idUsuario: Date.now(), // Simular auto_increment
      activo: true
    });
    
    this.usuariosFake.unshift(nuevo);
    return of(nuevo).pipe(delay(800));
  }

  update(id: number, usuarioData: Partial<UsuarioModel>): Observable<UsuarioModel> {
    console.log('Actualizando usuario ID:', id);
    const index = this.usuariosFake.findIndex(u => u.idUsuario === id);
    
    if (index !== -1) {
      this.usuariosFake[index] = new UsuarioModel({
        ...this.usuariosFake[index],
        ...usuarioData
      });
      return of(this.usuariosFake[index]).pipe(delay(600));
    }
    
    return throwError(() => new Error('Usuario no encontrado')).pipe(delay(300));
  }

  delete(id: number): Observable<boolean> {
    console.log('Eliminando usuario ID:', id);
    const index = this.usuariosFake.findIndex(u => u.idUsuario === id);
    
    if (index !== -1) {
      this.usuariosFake.splice(index, 1);
      return of(true).pipe(delay(400));
    }
    
    return of(false).pipe(delay(200));
  }

  //Utilidades
  getCurrentUser(): UsuarioModel | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getActivos(): Observable<UsuarioModel[]> {
    return of(this.usuariosFake.filter(u => u.isActive)).pipe(delay(400));
  }

}
