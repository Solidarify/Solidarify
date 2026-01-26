import { Component } from '@angular/core';
import { Router } from '@angular/router';

type AuthMode = 'none' | 'login' | 'register';
type UserRole = 'ONG' | 'ORGANIZADOR' | '';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  isLoggedIn = false;

  constructor(private router: Router) { }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

}
