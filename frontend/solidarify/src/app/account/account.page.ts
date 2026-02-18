import { Component, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  private actionSheetCtrl = inject(ActionSheetController);

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
      const currentUser = this.auth.currentUser();
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

  // ⬇️ NUEVA FUNCIÓN: Devuelve foto de perfil o avatar generado
  get avatarUrl(): string {
    const u = this.usuario();
    
    // Si tiene foto en Base64, usar esa
    if (u?.fotoPerfil) {
      return u.fotoPerfil.startsWith('data:image') 
        ? u.fotoPerfil 
        : `data:image/jpeg;base64,${u.fotoPerfil}`;
    }
    
    // Si no, generar avatar con iniciales
    return u 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=10b981&color=fff&size=256`
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

  // ⬇️ NUEVA FUNCIÓN: Cambiar foto de perfil
  async cambiarFoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Cambiar foto de perfil',
      buttons: [
        {
          text: '📷 Hacer foto',
          handler: () => this.tomarFoto(CameraSource.Camera)
        },
        {
          text: '🖼️ Elegir de galería',
          handler: () => this.tomarFoto(CameraSource.Photos)
        },
        {
          text: '🗑️ Eliminar foto',
          role: 'destructive',
          handler: () => this.eliminarFoto()
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  private async tomarFoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: source,
        width: 512,
        height: 512
      });

      if (image.base64String) {
        const base64Image = `data:image/${image.format};base64,${image.base64String}`;
        await this.guardarFotoPerfil(base64Image);
      }

    } catch (error) {
      console.error('Error capturando imagen:', error);
      this.mostrarAlerta('Error', 'No se pudo capturar la imagen.');
    }
  }

  private async eliminarFoto() {
    const confirm = await this.alertCtrl.create({
      header: 'Eliminar foto',
      message: '¿Quieres eliminar tu foto de perfil?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.guardarFotoPerfil(null)
        }
      ]
    });

    await confirm.present();
  }

  private async guardarFotoPerfil(base64: string | null) {
    const u = this.usuario();
    if (!u) return;

    const loading = await this.loadingCtrl.create({ message: 'Guardando foto...' });
    await loading.present();

    try {
      const usuarioActualizado = new UsuarioModel({
        ...u,
        fotoPerfil: base64 || undefined
      });

      const updated = await firstValueFrom(
        this.usuarioService.update(u.idUsuario, usuarioActualizado)
      );

      this.auth.currentUser.set(updated);
      this.mostrarAlerta('¡Listo!', 'Foto actualizada correctamente.');

    } catch (error) {
      console.error('Error guardando foto:', error);
      this.mostrarAlerta('Error', 'No se pudo guardar la foto.');
    } finally {
      loading.dismiss();
    }
  }

  async guardarCambios() {
    const confirm = await this.alertCtrl.create({
      header: 'Confirmar cambios',
      message: '¿Estás seguro de guardar estos cambios?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: () => this.ejecutarGuardado() }
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

  logout() {
    this.auth.logout();
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
