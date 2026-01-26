import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Router } from '@angular/router';
import { Auth } from '../services/auth';  
import { finalize } from 'rxjs/operators';  

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loginLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,     
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ORGANIZADOR', Validators.required]  
    });
  }

  ngOnInit() {}

  get emailField() { return this.loginForm.get('email')!; }
  get passwordField() { return this.loginForm.get('password')!; }
  get roleField() { return this.loginForm.get('role')!; }

 async onSubmit() {
  if (this.loginForm.valid) {
    this.loginLoading = true;
    const { email, password } = this.loginForm.value;
    
    const user = await this.authService.login(email, password);
    this.loginLoading = false;
    
    if (user) {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      console.log('Login falló');
    }
  }
}

}
