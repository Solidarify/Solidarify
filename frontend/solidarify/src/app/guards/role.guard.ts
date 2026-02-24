import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  private auth = inject(Auth);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRole = route.data['role']; 

    if (!this.auth.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    if (this.auth.hasRole(requiredRole) || this.auth.hasRole('ADMIN')) {
      return true;
    }

    return this.router.createUrlTree(['/home']);
  }
}
