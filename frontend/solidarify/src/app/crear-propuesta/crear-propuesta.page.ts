import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Usuario } from '../services/usuario';

@Component({
  selector: 'app-crear-propuesta',
  templateUrl: './crear-propuesta.page.html',
  styleUrls: ['./crear-propuesta.page.scss'],
  standalone: false
})
export class CrearPropuestaPage implements OnInit {

  propuestaForm!: FormGroup;
  loading = false;

  //Datos del organizador logeado
  currentUser: any = null;

  //Tipos de bienes (a partir del modelo)
  tiposBienes = [
    { id: 1, nombre: 'Alimentos no perecederos' },
    { id: 2, nombre: 'Ropa en buen estado' },
    { id: 3, nombre: 'Productos de higiene' },
    { id: 4, nombre: 'Juguetes nuevos/usados' },
    { id: 5, nombre: 'Libros escolares' }
  ];

  estadosPropuesta = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'publicado', label: 'Publicado' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private usuarioService: Usuario
  ) { }

  ngOnInit() {
    this.currentUser = this.usuarioService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.initForm();
  }

  private initForm(): void {
    this.propuestaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      tipoBien: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.minLength(5)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      estadoPropuesta: ['borrador', Validators.required]
    });
  }

  get tituloField(): AbstractControl | null {
    return this.propuestaForm.get('titulo');
  }

  get descripcionField(): AbstractControl | null {
    return this.propuestaForm.get('descripcion');
  }

  get tipoBienField(): AbstractControl | null {
    return this.propuestaForm.get('tipoBien');
  }

  get lugarField(): AbstractControl | null {
    return this.propuestaForm.get('lugar');
  }

  async onSubmit(): Promise<void> {
    if (this.propuestaForm.invalid) {
      await this.showAlert('Error', 'Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creando propuesta...',
    });
    await loading.present();

    try {
      //Simular guardado (igual que register console.log)
      const formData = this.prepareFormData();
      console.log('Datos propuesta a enviar:', formData);

      // TODO: Aquí conectar con PropuestaService.create()
      
      await loading.dismiss();
      await this.showAlert('¡Éxito!', 'Propuesta creada correctamente como borrador.');
      this.router.navigate(['/tabs/mis-propuestas']);
    } catch (error) {
      await loading.dismiss();
      await this.showAlert('Error', 'Ocurrió un error. Inténtalo de nuevo.');
      console.error('Error crear propuesta:', error);
    }
  }

  private prepareFormData(): any {
    return {
      idOrganizador: this.currentUser.idUsuario,
      idTipoBien: parseInt(this.propuestaForm.value.tipoBien),
      titulo: this.propuestaForm.value.titulo,
      descripcion: this.propuestaForm.value.descripcion,
      lugar: this.propuestaForm.value.lugar,
      fechaInicio: this.propuestaForm.value.fechaInicio,
      fechaFin: this.propuestaForm.value.fechaFin,
      estadoPropuesta: this.propuestaForm.value.estadoPropuesta,
      fechaCreacion: new Date()
    };
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
