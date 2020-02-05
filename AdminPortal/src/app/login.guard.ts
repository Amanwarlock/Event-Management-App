import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router){
  
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let url: string = state.url;
      return this.validate();
  }

  validate(): boolean{
    let isLoggedIn = Boolean(localStorage.getItem('isLoggedIn'));
    if(isLoggedIn){
      this.router.navigate(['/']);
      return false;
    }else{
      return true;
    }
  }
  
}
