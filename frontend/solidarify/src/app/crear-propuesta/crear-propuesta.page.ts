import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Usuario } from '../services/usuario';
import { UsuarioModel } from '../models/usuario.model';

@Component({
  selector: 'app-crear-propuesta',
  templateUrl: './crear-propuesta.page.html',
  styleUrls: ['./crear-propuesta.page.scss'],
  standalone: false
})
export class CrearPropuestaPage implements OnInit {

  propuestaForm!: FormGroup;
  loading = false;
  
  currentUser: UsuarioModel | null = null; 

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
    this.usuarioService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (!this.currentUser) {
         const saved = localStorage.getItem('currentUser');
         if (!saved) {
           console.error('Usuario no logeado. Redirigiendo...');
           this.router.navigate(['/login']);
         }
      }
    });

    this.initForm();
  }

  private initForm(): void {
    this.propuestaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      tipoBien: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.minLength(5)]],
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      estadoPropuesta: ['borrador', Validators.required]
    });
  }

  get tituloField(): AbstractControl | null { return this.propuestaForm.get('titulo'); }
  get descripcionField(): AbstractControl | null { return this.propuestaForm.get('descripcion'); }
  get tipoBienField(): AbstractControl | null { return this.propuestaForm.get('tipoBien'); }
  get lugarField(): AbstractControl | null { return this.propuestaForm.get('lugar'); }

  async onSubmit(): Promise<void> {
    if (this.propuestaForm.invalid) {
    this.propuestaForm.markAllAsTouched(); 
    
    Object.keys(this.propuestaForm.controls).forEach(key => {
      const controlErrors = this.propuestaForm.get(key)?.errors;
      if (controlErrors) {
        console.log('Error en campo:', key, controlErrors);
      }
    });
    
    await this.showAlert('Error', 'Formulario inválido. Revisa los campos en rojo.');
    return;
  }

    const loading = await this.loadingCtrl.create({
      message: 'Creando propuesta...',
    });
    await loading.present();

    try {
      const formData = this.prepareFormData();
      console.log('Datos propuesta a enviar:', formData);

      // SIMULACIÓN DE GUARDADO
      //  await this.propuestaService.create(formData).toPromise();
      
      // Simulamos un retardo de red de 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));

      await loading.dismiss();
      await this.showAlert('¡Éxito!', 'Propuesta creada correctamente.');
      this.router.navigate(['/tabs/mis-propuestas']);

    } catch (error) {
      await loading.dismiss();
      await this.showAlert('Error', 'Ocurrió un error al guardar.');
      console.error(error);
    }
  }

  private prepareFormData(): any {
    return {
      idOrganizador: this.currentUser?.idUsuario, 
      idTipoBien: parseInt(this.propuestaForm.value.tipoBien),
      titulo: this.propuestaForm.value.titulo,
      descripcion: this.propuestaForm.value.descripcion,
      lugar: this.propuestaForm.value.lugar,
      fechaInicio: this.propuestaForm.value.fechaInicio,
      fechaFin: this.propuestaForm.value.fechaFin,
      estadoPropuesta: this.propuestaForm.value.estadoPropuesta,
      fechaCreacion: new Date().toISOString() 
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

  fechaCambiada(campo: string, event: any) {
    const valorFecha = event.detail.value;
    const control = this.propuestaForm.get(campo);
    
    if (control) {
      control.setValue(valorFecha, { emitEvent: false });
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

}
