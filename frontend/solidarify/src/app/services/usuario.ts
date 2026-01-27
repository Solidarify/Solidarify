import { Injectable } from '@angular/core';
import { UsuarioModel } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  
  //Datos falsos
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

  //Simular login
  login(email: string, password: string): UsuarioModel | null {
    const usuario = this.usuariosFake.find(u => 
      u.email === email && u.passwordHash.includes('hash')
    );
    
    console.log('Login simulado:', { email, encontrado: !!usuario });
    return usuario || null;
  }

  //Obtener todos los usuarios
  getAll(): UsuarioModel[] {
    console.log('Usuarios fake cargados:', this.usuariosFake.length);
    return [...this.usuariosFake]; // copia para no mutar
  }

  //Obtener por ID
  getById(id: number): UsuarioModel | null {
    const usuario = this.usuariosFake.find(u => u.idUsuario === id);
    console.log('Usuario por ID:', id, usuario?.displayName);
    return usuario || null;
  }

}
