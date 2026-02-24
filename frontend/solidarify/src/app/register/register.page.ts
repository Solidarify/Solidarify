import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Auth } from '../services/auth'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private auth = inject(Auth); 

  registerForm!: FormGroup;
  isSubmitted = false;

  constructor() {}

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
      orgTelefonoDirecto: [''],
      orgZona: [''],
      orgObservaciones: [''],

      ongNombreLegal: [''],
      ongCif: [''],
      ongDescripcion: [''],
      ongDireccion: [''],
      ongTelefonoContacto: [''], 
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
    this.registerForm.get('orgCif')?.setValidators([Validators.required, Validators.minLength(5)]); 
    this.registerForm.get('orgEmail')?.setValidators([Validators.required, Validators.email]);
    this.registerForm.get('orgTelefonoDirecto')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]);
    
    this.updateControls(['orgNombre', 'orgCif', 'orgEmail', 'orgTelefonoDirecto']);
  }

  private clearOrganizadorValidators(): void {
    this.clearControls(['orgNombre', 'orgCif', 'orgEmail', 'orgCargo', 'orgTelefonoDirecto', 'orgZona', 'orgObservaciones']);
  }

  private setOngValidators(): void {
    this.registerForm.get('ongNombreLegal')?.setValidators([Validators.required, Validators.minLength(3)]);
    this.registerForm.get('ongCif')?.setValidators([Validators.required, Validators.minLength(5)]); 
    this.registerForm.get('ongTelefonoContacto')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]);
    
    this.updateControls(['ongNombreLegal', 'ongCif', 'ongTelefonoContacto']);
  }

  private clearOngValidators(): void {
    this.clearControls(['ongNombreLegal', 'ongCif', 'ongDescripcion', 'ongDireccion', 'ongTelefonoContacto', 'ongWeb']);
  }

  private updateControls(fields: string[]) {
    fields.forEach(f => this.registerForm.get(f)?.updateValueAndValidity());
  }

  private clearControls(fields: string[]) {
    fields.forEach(f => {
      this.registerForm.get(f)?.clearValidators();
      this.registerForm.get(f)?.updateValueAndValidity();
    });
  }

  get roleField(): AbstractControl | null {
    return this.registerForm.get('role');
  }

  getErrorMessage(controlName: string): string | undefined {
    const control = this.registerForm.get(controlName);
    
    if (control && control.invalid && (control.touched || this.isSubmitted)) {
      if (control.hasError('required')) return 'Este campo es obligatorio';
      if (control.hasError('minlength')) return `Mínimo ${control.getError('minlength').requiredLength} caracteres`;
      if (control.hasError('email')) return 'Email no válido';
      if (control.hasError('pattern')) {
        if (controlName === 'telefono' || controlName === 'orgTelefonoDirecto' || controlName === 'ongTelefonoContacto') {
          return 'Solo números (9 a 15 dígitos)';
        }
        if (controlName === 'ongWeb') {
          return 'Debe empezar por http:// o https://';
        }
        return 'Formato incorrecto';
      }
      return 'Dato no válido';
    }
    return undefined;
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      await this.showAlert('Datos incompletos', 'Por favor, revisa los campos marcados en rojo e inténtalo de nuevo.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registrando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const formData = this.prepareFormData();
      this.auth.register(formData).subscribe({
        next: async (res) => {
          await loading.dismiss();
          await this.showAlert('Éxito', 'Registro completado. ¡Bienvenido a Solidarify!');
          this.router.navigate(['/login']);
        },
        error: async (err) => {
          await loading.dismiss();
          const msg = err.error?.message || 'Ocurrió un error. Inténtalo de nuevo.';
          await this.showAlert('Error', msg);
        }
      });

    } catch (error) {
      await loading.dismiss();
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
        nombreOrganizacion: this.registerForm.value.orgNombre,
        cif: this.registerForm.value.orgCif,
        telefonoDirecto: this.registerForm.value.orgTelefonoDirecto,
        zonaResponsable: this.registerForm.value.orgZona
      };
    } else if (role === 'ONG') {
      return {
        ...baseData,
        nombreLegal: this.registerForm.value.ongNombreLegal,
        cif: this.registerForm.value.ongCif,
        descripcion: this.registerForm.value.ongDescripcion,
        direccion: this.registerForm.value.ongDireccion,
        telefonoContacto: this.registerForm.value.ongTelefonoContacto,
        web: this.registerForm.value.ongWeb
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
