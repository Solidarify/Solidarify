import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule  } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.initForm();
    this.setupRoleChangeListener();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      role: ['', Validators.required],

      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.pattern(/^[0-9]{9,15}$/)]],

      orgNombre: [''],
      orgCif: [''],
      orgEmail: ['', [Validators.email]],
      orgCargo: [''],
      orgTelefonoDirecto: ['', [Validators.pattern(/^[0-9]{9,15}$/)]],
      orgZona: [''],
      orgObservaciones: [''],

      ongNombreLegal: [''],
      ongCif: [''],
      ongDescripcion: [''],
      ongDireccion: [''],
      ongTelefonoContacto: ['', [Validators.pattern(/^[0-9]{9,15}$/)]],
      ongWeb: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  private setupRoleChangeListener(): void {
    this.registerForm.get('role')?.valueChanges.subscribe((role: string) => {
      this.updateValidatorsByRole(role);
    });
  }

  private updateValidatorsByRole(role: string): void {
    this.clearOrganizadorValidators();
    this.clearOngValidators();

    if (role === 'ORGANIZADOR') {
      this.setOrganizadorValidators();
    } else if (role === 'ONG') {
      this.setOngValidators();
    }

    this.registerForm.updateValueAndValidity();
  }

  private setOrganizadorValidators(): void {
    this.registerForm.get('orgNombre')?.setValidators([Validators.required, Validators.minLength(3)]);
    this.registerForm.get('orgCif')?.setValidators([Validators.required, Validators.pattern(/^[A-Z][0-9]{8}$/)]);
    this.registerForm.get('orgEmail')?.setValidators([Validators.required, Validators.email]);

    this.registerForm.get('orgNombre')?.updateValueAndValidity();
    this.registerForm.get('orgCif')?.updateValueAndValidity();
    this.registerForm.get('orgEmail')?.updateValueAndValidity();
  }

  private clearOrganizadorValidators(): void {
    ['orgNombre', 'orgCif', 'orgEmail', 'orgCargo', 'orgTelefonoDirecto', 'orgZona', 'orgObservaciones'].forEach(field => {
      this.registerForm.get(field)?.clearValidators();
      this.registerForm.get(field)?.updateValueAndValidity();
    });
  }

  private setOngValidators(): void {
    this.registerForm.get('ongNombreLegal')?.setValidators([Validators.required, Validators.minLength(3)]);
    this.registerForm.get('ongCif')?.setValidators([Validators.required, Validators.pattern(/^[A-Z][0-9]{8}$/)]);

    this.registerForm.get('ongNombreLegal')?.updateValueAndValidity();
    this.registerForm.get('ongCif')?.updateValueAndValidity();
  }

  private clearOngValidators(): void {
    ['ongNombreLegal', 'ongCif', 'ongDescripcion', 'ongDireccion', 'ongTelefonoContacto', 'ongWeb'].forEach(field => {
      this.registerForm.get(field)?.clearValidators();
      this.registerForm.get(field)?.updateValueAndValidity();
    });
  }

  get roleField(): AbstractControl | null {
    return this.registerForm.get('role');
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      await this.showAlert('Error', 'Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registrando...',
    });
    await loading.present();

    try {
      const formData = this.prepareFormData();
      
      // TODO: Aquí llamamos a la auth real para registrar al usuario
      // await this.authService.register(formData);
      
      console.log('Datos a enviar:', formData);

      await loading.dismiss();
      await this.showAlert('Éxito', 'Registro completado. Pendiente de verificación por el administrador.');
      this.router.navigate(['/login']);

    } catch (error) {
      await loading.dismiss();
      await this.showAlert('Error', 'Ocurrió un error durante el registro. Inténtalo de nuevo.');
      console.error('Error en registro:', error);
    }
  }

  private prepareFormData(): any {
    const role = this.registerForm.value.role;
    const baseData = {
      role,
      nombre: this.registerForm.value.nombre,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      telefono: this.registerForm.value.telefono || null,
    };

    if (role === 'ORGANIZADOR') {
      return {
        ...baseData,
        organizador: {
          nombre: this.registerForm.value.orgNombre,
          cif: this.registerForm.value.orgCif,
          email: this.registerForm.value.orgEmail,
          cargo: this.registerForm.value.orgCargo || null,
          telefonoDirecto: this.registerForm.value.orgTelefonoDirecto || null,
          zonaResponsable: this.registerForm.value.orgZona || null,
          observaciones: this.registerForm.value.orgObservaciones || null,
        }
      };
    } else if (role === 'ONG') {
      return {
        ...baseData,
        ong: {
          nombreLegal: this.registerForm.value.ongNombreLegal,
          cif: this.registerForm.value.ongCif,
          descripcion: this.registerForm.value.ongDescripcion || null,
          direccion: this.registerForm.value.ongDireccion || null,
          telefonoContacto: this.registerForm.value.ongTelefonoContacto || null,
          web: this.registerForm.value.ongWeb || null,
        }
      };
    }

    return baseData;
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
