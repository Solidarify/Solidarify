import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Usuario } from '../services/usuario';
import { UsuarioModel } from '../models/usuario.model';
import { PerfilOng } from '../services/perfil-ong';
import { PerfilONGModel } from '../models/perfil-ong.model';
import { Organizador } from '../services/organizador';
import { OrganizadorModel } from '../models/organizador.model';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false
})
export class AccountPage implements OnInit, OnDestroy {
  usuario!: UsuarioModel;
  usuarioEditado!: UsuarioModel;
  perfilONG?: PerfilONGModel;
  perfilONGEditado?: PerfilONGModel;
  organizador?: OrganizadorModel;
  organizadorEditado?: OrganizadorModel;

  roles: string[] = [];
  modoEdicion = false;
  loading = true;

  private subs = new Subscription();

  constructor(
    private usuarioService: Usuario,
    private ongService: PerfilOng,
    private organizadorService: Organizador,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
    
  ) {}

  ngOnInit() {
    this.subs.add(
      this.usuarioService.currentUser$.subscribe((usuario) => {
        if (usuario) {
          this.cargarPerfilCompleto(usuario);
        } else {
          this.loading = false;
        }
      })
    );

    const currentUser = this.usuarioService.getCurrentUser();
    if (currentUser) {
      this.cargarPerfilCompleto(currentUser);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private async cargarPerfilCompleto(usuario: UsuarioModel) {
    this.loading = true;
    
    try {
      this.usuario = usuario;

      const [ong, organizador] = await Promise.all([
        this.ongService.getById(usuario.idUsuario!).toPromise().catch(() => null),
        this.organizadorService.getById(usuario.idUsuario!).toPromise().catch(() => null)
      ]);

      // Determinar roles
      this.roles = [];
      if (ong) {
        this.perfilONG = ong;
        this.roles.push('ONG');
      }
      if (organizador) {
        this.organizador = organizador;
        this.roles.push('ORGANIZADOR');
      }
      if (!ong && !organizador) {
        this.roles.push('USER');
      }
      if (usuario.idUsuario === 1) {
        this.roles.push('ADMIN');
      }

      this.resetEdicion();

    } catch (error) {
      console.error('Error cargando perfil:', error);

    } finally {
      this.loading = false;
    }
  }

  // Getters
  get esUsuario(): boolean { return this.roles.includes('USER'); }
  get esONG(): boolean { return this.roles.includes('ONG'); }
  get esOrganizador(): boolean { return this.roles.includes('ORGANIZADOR'); }
  get esAdmin(): boolean { return this.roles.includes('ADMIN'); }

  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.usuario.displayName)}&background=0D8ABC&color=fff&size=128`;
  }

  // Edición
  async activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.resetEdicion();
    this.modoEdicion = false;
  }

  async guardarCambios() {
    const confirm = await this.alertCtrl.create({
      header: 'Confirmar cambios',
      message: '¿Estás seguro de guardar estos cambios en tu perfil?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Guardar',
          cssClass: 'primary',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Guardando cambios...'
            });
            await loading.present();

            try {
              await this.usuarioService.update(
                this.usuario.idUsuario!,
                this.usuarioEditado
              ).toPromise();

              if (this.esONG && this.perfilONGEditado) {
                await this.ongService.update(
                  this.perfilONG!.idUsuario!,
                  this.perfilONGEditado
                ).toPromise();
              }

              if (this.esOrganizador && this.organizadorEditado) {
                await this.organizadorService.update(
                  this.organizador!.idUsuario!,
                  this.organizadorEditado
                ).toPromise();
              }

              this.usuario = new UsuarioModel(this.usuarioEditado);
              if (this.perfilONG) this.perfilONG = new PerfilONGModel(this.perfilONGEditado!);
              if (this.organizador) this.organizador = new OrganizadorModel(this.organizadorEditado!);

              const alert = await this.alertCtrl.create({
                header: '¡Guardado!',
                message: 'Tus datos se han actualizado correctamente.',
                cssClass: 'success-alert',
                buttons: ['OK']
              });
              await alert.present();

            } catch (error) {
              console.error('Error guardando:', error);
              const alert = await this.alertCtrl.create({
                header: 'Error',
                message: 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
                cssClass: 'error-alert',
                buttons: ['OK']
              });
              await alert.present();
            } finally {
              await loading.dismiss();
              this.modoEdicion = false;
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  private resetEdicion() {
    this.usuarioEditado = new UsuarioModel(this.usuario);
    if (this.perfilONG) {
      this.perfilONGEditado = new PerfilONGModel(this.perfilONG);
    }
    if (this.organizador) {
      this.organizadorEditado = new OrganizadorModel(this.organizador);
    }
  }
}