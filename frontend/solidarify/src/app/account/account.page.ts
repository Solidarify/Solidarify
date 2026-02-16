import { Component, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AlertController, LoadingController } from '@ionic/angular';

// SERVICIOS
import { Auth } from '../services/auth';
import { Usuario } from '../services/usuario';
import { PerfilOng } from '../services/perfil-ong';
import { Organizador } from '../services/organizador';

// MODELOS
import { UsuarioModel } from '../models/usuario.model';
import { PerfilONGModel } from '../models/perfil-ong.model';
import { OrganizadorModel } from '../models/organizador.model';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false
})
export class AccountPage {
  
  private auth = inject(Auth);
  private usuarioService = inject(Usuario);
  private ongService = inject(PerfilOng);
  private organizadorService = inject(Organizador);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  usuario = signal<UsuarioModel | null>(null);
  perfilONG = signal<PerfilONGModel | null>(null);
  organizador = signal<OrganizadorModel | null>(null);
  loading = signal<boolean>(true);

  usuarioEditado: UsuarioModel | null = null;
  perfilONGEditado: PerfilONGModel | null = null;
  organizadorEditado: OrganizadorModel | null = null;
  modoEdicion = false;
  
  rolesVisuales: string[] = [];

  constructor() {
    effect(async () => {
      const currentUser = this.auth.currentUser(); // Dependencia reactiva

      if (currentUser) {
        this.loading.set(true);
        await this.cargarDatosAdicionales(currentUser);
      } else {
        this.usuario.set(null);
        this.perfilONG.set(null);
        this.organizador.set(null);
        this.rolesVisuales = [];
        this.loading.set(false);
      }
    });
  }

  private async cargarDatosAdicionales(user: UsuarioModel) {
    try {
      this.usuario.set(user);
      
      this.actualizarRolesVisuales();

      const promises: Promise<any>[] = [];

      if (this.auth.hasRole('ONG')) {
        promises.push(
          firstValueFrom(this.ongService.getById(user.idUsuario))
            .then(p => this.perfilONG.set(p))
            .catch(() => this.perfilONG.set(null))
        );
      }

        if (this.auth.hasRole('ORGANIZADOR') && user.idUsuario) { 
      promises.push(
        firstValueFrom(this.organizadorService.getById(user.idUsuario))
          .then(o => this.organizador.set(o))
          .catch(() => this.organizador.set(null))
      );
    }

      await Promise.all(promises);
      this.resetEdicion(); 

    } catch (e) {
      console.error('Error carga reactiva:', e);
    } finally {
      this.loading.set(false);
    }
  }

  private actualizarRolesVisuales() {
    this.rolesVisuales = [];
    if (this.auth.hasRole('ADMIN')) this.rolesVisuales.push('ADMIN');
    if (this.auth.hasRole('ONG')) this.rolesVisuales.push('ONG');
    if (this.auth.hasRole('ORGANIZADOR')) this.rolesVisuales.push('ORGANIZADOR');
    if (this.auth.hasRole('USUARIO')) this.rolesVisuales.push('USUARIO');
  }

  get avatarUrl(): string {
    const u = this.usuario();
    return u 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=0D8ABC&color=fff&size=128`
      : '';
  }

  esUsuario = () => this.auth.hasRole('USUARIO');
  esONG = () => this.auth.hasRole('ONG');
  esOrganizador = () => this.auth.hasRole('ORGANIZADOR');
  esAdmin = () => this.auth.hasRole('ADMIN');

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.resetEdicion();
  }

  private resetEdicion() {
    const u = this.usuario();
    if (u) this.usuarioEditado = new UsuarioModel(u);
    
    const p = this.perfilONG();
    if (p) this.perfilONGEditado = new PerfilONGModel(p);
    
    const o = this.organizador();
    if (o) this.organizadorEditado = new OrganizadorModel(o);
  }

  async guardarCambios() {
    const confirm = await this.alertCtrl.create({
      header: 'Confirmar cambios',
      message: '¿Estás seguro de guardar estos cambios?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: () => this.ejecutarGuardado()
        }
      ]
    });
    await confirm.present();
  }

  private async ejecutarGuardado() {
    const u = this.usuario();
    if (!u || !this.usuarioEditado) return;

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    try {
      const updatedUser = await firstValueFrom(
        this.usuarioService.update(u.idUsuario, this.usuarioEditado)
      );
      
      this.auth.currentUser.set(updatedUser); 
      
      const p = this.perfilONG();
      if (this.esONG() && p && this.perfilONGEditado) {
        const updatedOng = await firstValueFrom(
          this.ongService.update(p.idUsuario!, this.perfilONGEditado)
        );
        this.perfilONG.set(updatedOng);
      }

      const o = this.organizador();
      if (this.esOrganizador() && o && this.organizadorEditado) {
        const updatedOrg = await firstValueFrom(
          this.organizadorService.update(o.idUsuario!, this.organizadorEditado)
        );
        this.organizador.set(updatedOrg);
      }

      this.modoEdicion = false;
      this.mostrarAlerta('¡Guardado!', 'Datos actualizados correctamente.');

    } catch (error) {
      console.error('Error guardando:', error);
      this.mostrarAlerta('Error', 'No se pudieron guardar los cambios.');
    } finally {
      loading.dismiss();
    }
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
