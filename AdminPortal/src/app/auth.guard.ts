import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let url: string = state.url;
     return this.authenticate(url);
  }
  
  authenticate(url: string): Observable<boolean>{
    return new Observable<boolean>(observer => {
      this.authService.hasLoggedIn().subscribe((flag: any)=>{
        if(flag.isLoggedIn){
          observer.next(true);
          this.authService.isLoggedIn$.next(true);
        }else{
          this.authService.setRedirectUrl(url);
          this.authService.isLoggedIn$.next(false);
          this.router.navigate(['/login']);
          observer.next(false);
        }
      });
    });

  }

}
